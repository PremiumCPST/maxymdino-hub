# MAXYMDINO — Hub personnel

Hub statique en React, HTML et CSS, avec une interface de menu de quête et de boussole inspirée de Skyrim, pensé pour être servi par Nginx.

## Personnaliser

- Adresse de Cockpit : copie `config.example.js` vers `config.js`, puis renseigne ton URL dans `config.js`. Ce fichier local est ignoré par Git et ne doit pas être publié.
- Prochains projets : compléter le tableau `projects` dans `app.js`. Ajoute `href: "https://..."` à une entrée pour transformer automatiquement sa carte en raccourci actif.
- Couleurs, typographie et mise en page : modifier `styles.css`.

React 18.3.1 et les polices sont chargés depuis des CDN. Le navigateur doit donc avoir accès à Internet pour charger les dépendances et les polices ; le HTML, le CSS et le code de l'application sont servis localement.

Sous Linux : `cp config.example.js config.js`. Sous PowerShell : `Copy-Item config.example.js config.js`. Remplace ensuite l'adresse d'exemple par l'URL de ton Cockpit.

## Publier sur le VPS

Sur le PC Fedora, place-toi dans le dossier du projet puis lance :

```bash
chmod +x deploy.sh
./deploy.sh
```

Le script utilise l'alias SSH `maxymdino`, transfère `index.html`, `app.js`, `styles.css` et, si présent, `config.js`, puis les installe dans `/usr/share/nginx/html/`. Il sauvegarde le document root précédent dans un dossier `html.backup-...` avant de le remplacer. `README.md` n'est pas déployé.
Il ne modifie pas la configuration HTTPS, les règles du pare-feu ou Cockpit.

Sur un PC Windows avec OpenSSH, lance PowerShell dans le dossier du projet puis exécute :

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\deploy.ps1
```

Cette commande contourne la stratégie d'exécution uniquement pour ce processus PowerShell. Elle utilise le même alias SSH `maxymdino`.

Pour utiliser un autre alias SSH :

```bash
./deploy.sh autre-alias
```

Le dépôt ne contient ni adresse de VPS, ni identifiants, ni clé privée. `config.js` contient les paramètres propres à ton installation : conserve-le local et ne le force pas dans Git.
