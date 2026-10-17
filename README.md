# BatiPro : Gestion du pointage sur les chantiers

BatiPro est une application de gestion du pointage des employés sur les chantiers. Le projet comprend une API REST Laravel, une interface web React et une application mobile React Native / Expo.

## Sommaire

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [1. Télécharger le projet](#1-télécharger-le-projet)
- [2. Préparer MySQL](#2-préparer-mysql)
- [3. Installer et configurer l'API Laravel](#3-installer-et-configurer-lapi-laravel)
- [4. Installer et lancer l'application web](#4-installer-et-lancer-lapplication-web)
- [5. Installer et lancer l'application mobile](#5-installer-et-lancer-lapplication-mobile)
- [6. Lancer BatiPro au quotidien](#6-lancer-batipro-au-quotidien)
- [7. Comptes de démonstration](#7-comptes-de-démonstration)
- [8. Dépannage](#8-dépannage)
- [Sécurité](#sécurité)

## Architecture

```text
BatiPro/
├── back-end/       # API REST Laravel + JWT
├── app-web/        # Interface web React + Tailwind CSS + Vite
├── app-mobile/     # Application mobile React Native + Expo SDK 51
└── README.md
```

Les applications web et mobile communiquent avec l'API Laravel. Le backend accède à MySQL ; les clients web et mobile ne se connectent jamais directement à la base de données.

| Partie | Technologies |
|---|---|
| Back-end | PHP 8.3+, Laravel 13, API REST, JWT |
| Base de données | MySQL |
| Application web | React, Tailwind CSS, Vite |
| Application mobile | React Native, Expo SDK 51, Expo Router |
| Outils | Git, Composer, npm, VS Code, Postman |

## Prérequis

Installez ces outils **sur l'ordinateur qui exécutera le projet** :

1. **Git** — [git-scm.com/downloads](https://git-scm.com/downloads)
2. **PHP 8.3 ou supérieur** et les extensions PHP requises par Laravel. Sous Windows, WampServer peut fournir PHP et MySQL : [wampserver.com](https://www.wampserver.com/).
3. **Composer** — [getcomposer.org/download](https://getcomposer.org/download/)
4. **MySQL** — par exemple via WampServer ou une installation MySQL locale. phpMyAdmin est facultatif et permet de gérer la base avec une interface graphique.
5. **Node.js et npm** — [nodejs.org](https://nodejs.org/). Pour le frontend web avec Vite 8, utilisez Node.js 20.19+ ou 22.12+.
6. **Un éditeur** — par exemple [Visual Studio Code](https://code.visualstudio.com/).
7. **Pour le mobile** : un téléphone Android avec Expo Go compatible SDK 51, ou un émulateur Android. Les instructions et le lien sont dans la section mobile ci-dessous.

Après installation, **fermez puis rouvrez PowerShell** et vérifiez les commandes :

```powershell
git --version
php -v
composer --version
node -v
npm -v
```

Si une commande est « introuvable », vérifiez que le programme est installé et ajouté au `PATH`. Avec WampServer, vous pouvez avoir besoin de sélectionner la version de PHP appropriée dans le terminal ou d'ajouter son dossier au `PATH`.

> **Important :** vous n'avez pas besoin d'installer globalement Laravel, Expo CLI ou Vite pour ce dépôt. Composer et npm installeront les dépendances définies dans les fichiers du projet.

## 1. Télécharger le projet

Ouvrez **PowerShell** dans le dossier où vous souhaitez conserver vos projets, par exemple `C:\Users\<votre-utilisateur>\Documents\Projets`. Créez ce dossier si nécessaire :

```powershell
New-Item -ItemType Directory -Force "$HOME\Documents\Projets"
Set-Location "$HOME\Documents\Projets"
git clone -b main https://github.com/hajjamabderrahmane/BatiPro.git
cd BatiPro
```

Le dépôt sera placé dans :

```text
C:\Users\<votre-utilisateur>\Documents\Projets\BatiPro
```

Vous pouvez choisir un autre dossier. Les commandes `cd back-end`, `cd app-web` et `cd app-mobile` ci-dessous supposent que le terminal est ouvert à la racine de `BatiPro`.

Si le projet est déjà cloné, ne le clonez pas une deuxième fois : ouvrez PowerShell dans son dossier et récupérez les derniers changements :

```powershell
git switch main
git pull origin main
```

## 2. Préparer MySQL

1. Démarrez le service MySQL depuis WampServer ou les services Windows.
2. Ouvrez phpMyAdmin si vous l'utilisez, généralement à l'adresse `http://localhost/phpmyadmin/`.
3. Créez une base de données vide nommée **`pointage_db`**.
4. Notez le nom d'utilisateur et le mot de passe MySQL. Avec une installation locale, l'utilisateur est parfois `root`, mais cela dépend de votre configuration.

La base doit exister avant de lancer les migrations Laravel.

## 3. Installer et configurer l'API Laravel

### 3.1 Installer les dépendances PHP

Dans PowerShell, depuis la racine de `BatiPro` :

```powershell
cd back-end
Copy-Item .env.example .env
composer install
```

Le fichier `.env` est une configuration **locale**. Il ne doit pas être publié sur GitHub.

### 3.2 Configurer la connexion MySQL

Ouvrez le fichier `back-end/.env` dans VS Code. Remplacez les paramètres de base de données par les valeurs suivantes, puis adaptez-les à votre installation :

```env
APP_NAME=BatiPro
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pointage_db
DB_USERNAME=root
DB_PASSWORD=
```

- `DB_DATABASE` doit correspondre au nom de la base créée à l'étape 2.
- Si votre utilisateur MySQL possède un mot de passe, renseignez `DB_PASSWORD`.
- Si `.env.example` indique `DB_CONNECTION=sqlite`, remplacez-le par `DB_CONNECTION=mysql` pour utiliser MySQL.
- Ne remplacez pas tout le fichier `.env` par ce petit extrait : conservez les autres paramètres déjà présents.

### 3.3 Générer les clés et créer les tables

Toujours dans le dossier `back-end`, exécutez :

```powershell
php artisan key:generate
php artisan jwt:secret
php artisan config:clear
php artisan migrate
```

Ces commandes génèrent la clé Laravel, la clé de signature JWT, nettoient la configuration mise en cache et créent les tables dans MySQL. Si Laravel demande une confirmation pour les migrations locales, vérifiez le nom de la base avant de confirmer.

### 3.4 Ajouter les données de démonstration (facultatif)

Pour créer des comptes de test et un chantier de démonstration :

```powershell
php artisan db:seed
```

Exécutez cette commande uniquement sur une base locale de test. Le seeder utilise `updateOrCreate` : il peut mettre à jour les comptes et affectations de démonstration déjà présents. **Ne l'exécutez pas sur une base contenant des données à conserver.**

### 3.5 Démarrer l'API

Depuis le dossier `back-end` :

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

Gardez ce terminal ouvert. Sur le PC, l'API est accessible à l'adresse :

- Base API : `http://127.0.0.1:8000/api`
- Connexion : `POST http://127.0.0.1:8000/api/login`

Pour un téléphone Android connecté au même Wi-Fi, l'application mobile utilise l'adresse IP locale du PC, et non `127.0.0.1`. Le script mobile la détecte automatiquement au démarrage.

## 4. Installer et lancer l'application web

Ouvrez **un nouveau terminal PowerShell**. Revenez à la racine du projet, puis entrez dans `app-web` :

```powershell
cd "$HOME\Documents\Projets\BatiPro\app-web"
npm install
npm run dev
```

Si vous avez cloné le projet ailleurs, remplacez le chemin par votre propre dossier. Vous pouvez aussi ouvrir un nouveau terminal dans VS Code depuis la racine de BatiPro, puis exécuter simplement :

```powershell
cd app-web
npm install
npm run dev
```

Vite affiche l'adresse locale dans le terminal, généralement `http://localhost:5173`. Ouvrez cette adresse dans votre navigateur et laissez le terminal ouvert.

Pour vérifier que la version de production peut être compilée :

```powershell
npm run build
```

Cette commande crée le dossier de build ; elle ne remplace pas le serveur de développement.

## 5. Installer et lancer l'application mobile

L'application mobile du dépôt utilise **Expo SDK 51**. Pour éviter l'erreur « Project is incompatible with this version of Expo Go », utilisez une version d'Expo Go compatible avec SDK 51.

### 5.1 Installer Expo Go sur Android

- **Lien officiel Expo Go pour SDK 51 sur un téléphone Android :** [expo.dev/go — Android, SDK 51](https://expo.dev/go?device=true&platform=android&sdkVersion=51)
- **Lien officiel Expo Go pour SDK 51 sur un émulateur Android :** [expo.dev/go — Android Emulator, SDK 51](https://expo.dev/go?device=false&platform=android&sdkVersion=51)
- La page officielle propose le téléchargement de l'APK compatible et les instructions d'installation.

Sur un téléphone Android, ouvrez le lien ci-dessus dans le navigateur du téléphone et suivez les instructions proposées. Si Android vous avertit qu'un fichier APK provient du navigateur, vérifiez que vous êtes bien sur le site officiel Expo avant d'autoriser l'installation. N'installez pas d'APK depuis un site tiers inconnu.

**iPhone :** Apple ne permet généralement pas d'installer librement une ancienne version d'Expo Go sur un appareil physique. Si l'Expo Go disponible sur l'App Store n'est pas compatible avec SDK 51, utilisez un environnement compatible ou prévoyez une migration du projet vers un SDK Expo plus récent. Ne mettez pas à jour le SDK mobile au hasard sans vérifier la compatibilité des dépendances.

### 5.2 Installer les dépendances mobiles

Ouvrez **un nouveau terminal PowerShell** à la racine de BatiPro :

```powershell
cd app-mobile
npm install
```

N'exécutez pas `npm install` dans le dossier parent : chaque application possède son propre `package.json` et ses propres dépendances.

### 5.3 Démarrer Expo et configurer automatiquement l'adresse de l'API

Assurez-vous d'abord que le serveur Laravel est toujours en cours d'exécution dans son terminal. Puis, dans le terminal mobile :

```powershell
npm start
```

Le script `npm start` exécute `scripts/detect-ip.js` avant Expo. Il cherche une adresse IPv4 privée du PC et crée ou met à jour `app-mobile/.env` avec une variable semblable à :

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api
```

L'adresse `192.168.x.x` est un exemple : le script doit écrire l'adresse réelle de votre PC. Le fichier `app-mobile/.env` est généré localement et ne doit pas être commité.

### 5.4 Ouvrir BatiPro sur le téléphone

1. Connectez le PC et le téléphone au **même réseau Wi-Fi**.
2. Vérifiez que Laravel tourne sur le port `8000`.
3. Exécutez `npm start` dans `app-mobile`.
4. Attendez que le QR code Expo apparaisse.
5. Scannez le QR code avec Expo Go, puis attendez le chargement de l'application.
6. Autorisez la caméra et la localisation lorsque Android le demande, car BatiPro utilise le scan QR et le GPS pour le pointage.

Si l'ordinateur dispose de plusieurs interfaces réseau (Wi-Fi, Ethernet, VPN), vérifiez que le script a détecté l'adresse correspondant au réseau utilisé par le téléphone.

Autres commandes disponibles depuis `app-mobile` :

```powershell
npm run android
npm run ios
npm run web
```

- `npm run android` démarre Expo en ciblant Android.
- `npm run ios` est destiné à un environnement iOS compatible.
- `npm run web` tente de démarrer la cible web Expo si elle est prise en charge.

## 6. Lancer BatiPro au quotidien

Après la première installation, il n'est généralement pas nécessaire de relancer `composer install` ou `npm install`, sauf si les dépendances changent.

Démarrez les éléments nécessaires dans **des terminaux séparés** :

**Terminal 1 — Laravel / API**

```powershell
cd "$HOME\Documents\Projets\BatiPro\back-end"
php artisan serve --host=0.0.0.0 --port=8000
```

**Terminal 2 — Application web (si vous l'utilisez)**

```powershell
cd "$HOME\Documents\Projets\BatiPro\app-web"
npm run dev
```

**Terminal 3 — Application mobile (si vous l'utilisez)**

```powershell
cd "$HOME\Documents\Projets\BatiPro\app-mobile"
npm start
```

Adaptez les chemins si le dépôt est installé ailleurs. MySQL doit être démarré avant d'utiliser l'API.

## 7. Comptes de démonstration

Après avoir exécuté `php artisan db:seed`, les comptes de test suivants sont disponibles localement :

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | `admin@batipro.test` | `BatiPro@123` |
| Chef de chantier | `chef@batipro.test` | `BatiPro@123` |
| Employé | `employe@batipro.test` | `BatiPro@123` |

Le seeder ajoute aussi un chantier de démonstration et les affectations associées. Ces identifiants sont publics parce qu'ils sont destinés aux tests : ne les réutilisez jamais en production ou dans un environnement accessible à d'autres personnes.

## 8. Dépannage

### `php`, `composer` ou `npm` n'est pas reconnu

Fermez et rouvrez PowerShell après l'installation. Vérifiez que le chemin du programme est dans la variable d'environnement Windows `PATH`.

### Erreur de connexion MySQL

- Vérifiez que le service MySQL est démarré.
- Vérifiez que la base `pointage_db` existe.
- Vérifiez `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` et `DB_PASSWORD` dans `back-end/.env`.
- Après une modification du fichier `.env`, exécutez `php artisan config:clear`.

### Erreur de migration

Vérifiez que la connexion à MySQL fonctionne et que le nom de la base est correct. N'utilisez pas `php artisan migrate:fresh` sur une base contenant des données à conserver : cette commande supprime les tables avant de les recréer.

### Erreur JWT

Dans `back-end`, exécutez :

```powershell
php artisan jwt:secret
php artisan config:clear
```

### Le téléphone n'arrive pas à joindre l'API

- Vérifiez que le PC et le téléphone sont sur le même Wi-Fi.
- Vérifiez que Laravel tourne sur le port 8000.
- Autorisez PHP ou le port 8000 dans le pare-feu Windows si nécessaire.
- Relancez `npm start` dans `app-mobile` pour recalculer l'adresse IP.
- Vérifiez le contenu local de `app-mobile/.env` et la valeur de `EXPO_PUBLIC_API_URL`.
- N'utilisez pas `localhost` ou `127.0.0.1` dans l'URL mobile : sur le téléphone, ces adresses désignent le téléphone lui-même.

### Expo Go indique que le SDK n'est pas compatible

Installez la version Expo Go prévue pour SDK 51 depuis le [sélecteur officiel Expo Go](https://expo.dev/go?device=true&platform=android&sdkVersion=51) sur Android. Sur iPhone physique, les anciennes versions ne peuvent généralement pas être installées manuellement ; il faudra envisager un environnement compatible ou mettre à niveau le projet après vérification des dépendances.

### Dépendances manquantes

Relancez la commande dans le bon dossier :

- Backend : `composer install` dans `back-end`.
- Web : `npm install` dans `app-web`.
- Mobile : `npm install` dans `app-mobile`.

## Sécurité

- Ne committez jamais les fichiers `.env`, les clés JWT ou les mots de passe réels.
- Gardez `APP_DEBUG=true` uniquement en développement local ; désactivez le mode debug dans tout environnement de production.
- Les comptes de démonstration sont réservés au développement.
- Ne lancez pas les seeders ou les migrations destructrices sur une base importante sans sauvegarde.
- Le serveur lancé avec `--host=0.0.0.0` peut être accessible aux autres appareils du réseau local : utilisez-le uniquement dans un environnement de développement de confiance.

## Documentation officielle

- [Laravel — Documentation et installation](https://laravel.com/docs)
- [Expo SDK 51](https://expo.dev/sdk/51)
- [Expo Go compatible SDK 51 pour Android](https://expo.dev/go?device=true&platform=android&sdkVersion=51)
- [Node.js](https://nodejs.org/)
- [Composer](https://getcomposer.org/download/)
- [Git](https://git-scm.com/downloads)
