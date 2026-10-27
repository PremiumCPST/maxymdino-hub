#!/usr/bin/env bash
set -Eeuo pipefail

# Déploie les fichiers statiques du hub vers le document root Nginx du VPS.
# À lancer depuis le dossier de ce projet sur le PC Fedora.
# Usage : ./deploy.sh [alias-ssh]

REMOTE="${1:-maxymdino}"
WEB_ROOT="/usr/share/nginx/html"
STAMP="$(date +%Y%m%d-%H%M%S)-$$"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

for command_name in ssh scp mktemp; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Commande requise absente : $command_name" >&2
    exit 1
  fi
done

for file in index.html app.js styles.css; do
  if [[ ! -f "$SCRIPT_DIR/$file" ]]; then
    echo "Fichier du site absent : $SCRIPT_DIR/$file" >&2
    exit 1
  fi
done
SITE_FILES=("$SCRIPT_DIR/index.html" "$SCRIPT_DIR/app.js" "$SCRIPT_DIR/styles.css")
if [[ -f "$SCRIPT_DIR/config.js" ]]; then
  SITE_FILES+=("$SCRIPT_DIR/config.js")
fi

echo "Connexion à $REMOTE..."
REMOTE_HOME="$(ssh "$REMOTE" 'printf %s "$HOME"')"
if [[ ! "$REMOTE_HOME" =~ ^/home/[A-Za-z0-9._-]+$ ]]; then
  echo "Le dossier personnel distant est inattendu : $REMOTE_HOME" >&2
  exit 1
fi

REMOTE_STAGE="$REMOTE_HOME/.cache/maxymdino-hub/deploy-$STAMP"
ssh "$REMOTE" "mkdir -p '$REMOTE_STAGE'"
scp "${SITE_FILES[@]}" "$REMOTE:$REMOTE_STAGE/"

REMOTE_HELPER="$(mktemp)"
cleanup_local() { rm -f -- "$REMOTE_HELPER"; }
trap cleanup_local EXIT

cat >"$REMOTE_HELPER" <<'REMOTE_SCRIPT'
#!/usr/bin/env bash
set -Eeuo pipefail

stage="${1:?Missing staging directory}"
root="${2:?Missing Nginx document root}"
stamp="${3:?Missing deployment id}"

case "$stage" in
  /home/*/.cache/maxymdino-hub/deploy-*) ;;
  *) echo "Dossier temporaire distant refusé : $stage" >&2; exit 1 ;;
esac
if [[ "$root" != "/usr/share/nginx/html" ]]; then
  echo "Document root inattendu : $root" >&2
  exit 1
fi
if [[ ! "$stamp" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "Identifiant de déploiement invalide." >&2
  exit 1
fi
for file in index.html app.js styles.css; do
  if [[ ! -f "$stage/$file" ]]; then
    echo "Fichier transféré absent : $stage/$file" >&2
    exit 1
  fi
done
if ! systemctl is-active --quiet nginx; then
  echo "Nginx n'est pas actif ; le site n'a pas été remplacé." >&2
  exit 1
fi

parent="$(dirname -- "$root")"
new_root="$parent/.html.new-$stamp"
backup_root="$root.backup-$stamp"
if [[ -e "$new_root" || -e "$backup_root" ]]; then
  echo "Un dossier de ce déploiement existe déjà ; arrêt de sécurité." >&2
  exit 1
fi

install -d -o root -g root -m 0755 "$new_root"
install -o root -g root -m 0644 "$stage/index.html" "$new_root/index.html"
install -o root -g root -m 0644 "$stage/app.js" "$new_root/app.js"
install -o root -g root -m 0644 "$stage/styles.css" "$new_root/styles.css"
if [[ -f "$stage/config.js" ]]; then
  install -o root -g root -m 0644 "$stage/config.js" "$new_root/config.js"
fi

if [[ -e "$root" || -L "$root" ]]; then
  mv -- "$root" "$backup_root"
fi
if ! mv -- "$new_root" "$root"; then
  if [[ -e "$backup_root" && ! -e "$root" ]]; then
    mv -- "$backup_root" "$root"
  fi
  echo "Installation interrompue ; restauration tentée." >&2
  exit 1
fi

if command -v restorecon >/dev/null 2>&1; then
  restorecon -RF "$root" || echo "Avertissement : restorecon n'a pas pu corriger tous les contextes SELinux." >&2
fi

echo "Hub installé dans $root"
if [[ -e "$backup_root" ]]; then
  echo "Ancien site sauvegardé dans $backup_root"
fi
echo "Nginx sert les fichiers statiques sans redémarrage."
REMOTE_SCRIPT

scp "$REMOTE_HELPER" "$REMOTE:$REMOTE_STAGE/deploy-remote.sh"
echo "Installation sur le VPS. Sudo peut demander le mot de passe de l'utilisateur Fedora."
ssh -t "$REMOTE" "sudo bash '$REMOTE_STAGE/deploy-remote.sh' '$REMOTE_STAGE' '$WEB_ROOT' '$STAMP'"

if ssh "$REMOTE" "rm -f -- '$REMOTE_STAGE/index.html' '$REMOTE_STAGE/app.js' '$REMOTE_STAGE/styles.css' '$REMOTE_STAGE/config.js' '$REMOTE_STAGE/deploy-remote.sh' && rmdir '$REMOTE_STAGE'"; then
  echo "Fichiers temporaires supprimés."
else
  echo "Avertissement : nettoyage temporaire incomplet dans $REMOTE_STAGE" >&2
fi

echo
echo "Déploiement terminé dans $WEB_ROOT. Le script ne modifie pas TLS ni la configuration de Cockpit."
