param(
  [string]$Remote = "maxymdino"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = "/usr/share/nginx/html"
$stamp = "$(Get-Date -Format 'yyyyMMdd-HHmmss')-$PID"
$helperPath = $null

foreach ($commandName in @("ssh.exe", "scp.exe")) {
  if (-not (Get-Command $commandName -ErrorAction SilentlyContinue)) {
    throw "Commande requise introuvable : $commandName. Installe ou active le client OpenSSH de Windows."
  }
}

foreach ($fileName in @("index.html", "app.js", "styles.css")) {
  if (-not (Test-Path -LiteralPath (Join-Path $scriptDir $fileName) -PathType Leaf)) {
    throw "Fichier du site absent : $(Join-Path $scriptDir $fileName)"
  }
}
$siteFiles = @(
  (Join-Path $scriptDir "index.html"),
  (Join-Path $scriptDir "app.js"),
  (Join-Path $scriptDir "styles.css")
)
$localConfig = Join-Path $scriptDir "config.js"
if (Test-Path -LiteralPath $localConfig -PathType Leaf) {
  $siteFiles += $localConfig
}

Write-Host "Connexion à $Remote..."
$remoteHomeLines = & ssh.exe $Remote 'printf %s "$HOME"'
if ($LASTEXITCODE -ne 0) { throw "Connexion SSH impossible vers $Remote." }
$remoteHome = ($remoteHomeLines -join "").Trim()
if ($remoteHome -notmatch '^/home/[A-Za-z0-9._-]+$') {
  throw "Dossier personnel distant inattendu : $remoteHome"
}

$remoteStage = "$remoteHome/.cache/maxymdino-hub/deploy-$stamp"
& ssh.exe $Remote "mkdir -p '$remoteStage'"
if ($LASTEXITCODE -ne 0) { throw "Impossible de créer le dossier temporaire distant." }

$remoteSpec = "${Remote}:$remoteStage/"
& scp.exe @siteFiles $remoteSpec
if ($LASTEXITCODE -ne 0) { throw "Le transfert des fichiers du site a échoué." }

$remoteScript = @'
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
'@

try {
  $helperPath = Join-Path $env:TEMP "maxymdino-deploy-remote-$PID.sh"
  [System.IO.File]::WriteAllText($helperPath, $remoteScript, [System.Text.UTF8Encoding]::new($false))
  & scp.exe $helperPath "${Remote}:$remoteStage/deploy-remote.sh"
  if ($LASTEXITCODE -ne 0) { throw "Impossible de transférer le programme de déploiement distant." }

  Write-Host "Installation sur le VPS. À l'invite sudo, saisis le mot de passe Linux de l'utilisateur Fedora (pas une clé SSH)."
  $deployCommand = "sudo -v && sudo -n bash '$remoteStage/deploy-remote.sh' '$remoteStage' '$webRoot' '$stamp'"
  & ssh.exe -tt $Remote $deployCommand
  if ($LASTEXITCODE -ne 0) { throw "Le déploiement distant a échoué. Les sauvegardes éventuelles restent sur le VPS." }

  $cleanupCommand = "rm -f -- '$remoteStage/index.html' '$remoteStage/app.js' '$remoteStage/styles.css' '$remoteStage/config.js' '$remoteStage/deploy-remote.sh' && rmdir '$remoteStage'"
  & ssh.exe $Remote $cleanupCommand
  if ($LASTEXITCODE -ne 0) { Write-Warning "Nettoyage temporaire incomplet : $remoteStage" }

  Write-Host ""
  Write-Host "Déploiement terminé dans $webRoot. Le script ne modifie pas TLS ni Cockpit."
}
finally {
  if ($helperPath -and (Test-Path -LiteralPath $helperPath)) {
    Remove-Item -LiteralPath $helperPath -Force
  }
}
