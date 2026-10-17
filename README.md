# BatiPro — Gestion du pointage des chantiers

BatiPro est une application de gestion du pointage des employés sur les chantiers. Elle centralise les utilisateurs, les chantiers, les affectations et les présences à travers une API REST et des interfaces web et mobile.

## Architecture du dépôt

```text
BatiPro/
├── back-end/       # API REST Laravel
├── app-web/        # Interface web React
├── app-mobile/     # Application mobile React Native / Expo
└── README.md
```

## Fonctionnalités

- Authentification par JWT et gestion des rôles.
- Gestion des utilisateurs, des chantiers et des affectations.
- Enregistrement et consultation des pointages.
- Pointage mobile avec QR code et localisation GPS.

## Technologies

| Partie | Technologies |
|---|---|
| Back-end | PHP, Laravel, API REST, JWT |
| Base de données | MySQL |
| Application web | React, Tailwind CSS |
| Application mobile | React Native, Expo |
| Outils | Git, GitHub, VS Code, Postman |

## Prérequis

Installer Git, PHP avec les extensions nécessaires à Laravel, Composer, MySQL, Node.js et npm. Pour tester l'application mobile, utiliser Expo Go compatible avec la version du projet ou un émulateur Android configuré.

Vérifier les installations :

```powershell
git --version
php -v
composer --version
node -v
npm -v
```

## Récupérer le projet

Pour récupérer la branche contenant cette version du projet :

```powershell
git clone -b restore-before-seeder https://github.com/hajjamabderrahmane/BatiPro.git
cd BatiPro
```

Le dépôt est privé : un accès GitHub autorisé est nécessaire.

## 1. Installer et configurer le back-end

Depuis la racine du dépôt :

```powershell
cd back-end
composer install
Copy-Item .env.example .env
```

Ouvrir le fichier `.env` et adapter la configuration MySQL à l'environnement local. Exemple :

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

Créer d'abord la base de données vide `pointage_db` dans MySQL ou phpMyAdmin. Adapter le nom de la base, l'utilisateur et le mot de passe si nécessaire.

Générer les clés et créer les tables :

```powershell
php artisan key:generate
php artisan jwt:secret
php artisan config:clear
php artisan migrate
```

La commande `jwt:secret` est à exécuter si elle est disponible dans la configuration JWT du projet.

### Créer les comptes et les données de démonstration

Après les migrations, exécuter :

```powershell
php artisan db:seed
```

En environnement local, le seeder crée ou met à jour les comptes de démonstration suivants :

| Rôle | E-mail | Mot de passe initial |
|---|---|---|
| Administrateur | `admin@batipro.test` | `BatiPro@123` |
| Chef de chantier | `chef@batipro.test` | `BatiPro@123` |
| Employé | `employe@batipro.test` | `BatiPro@123` |

Le seeder crée également un chantier de démonstration à Casablanca et affecte le chef de chantier ainsi que l'employé à ce chantier. Il ignore les données de démonstration lorsque l'environnement Laravel est `production`.

**Attention :** `updateOrCreate` peut mettre à jour les informations des comptes de démonstration et les affectations correspondantes lorsqu'ils existent déjà. Exécuter le seeder uniquement sur une base de développement dont les données ont été vérifiées. Les identifiants ci-dessus sont réservés aux tests locaux : ne pas les utiliser dans un environnement partagé ou en production.

### Démarrer l'API

Pour permettre à l'application mobile sur le téléphone d'accéder à l'API, lancer le serveur depuis le dossier `back-end` :

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

L'API est servie sur le port `8000`. Le téléphone et le PC doivent être connectés au même réseau local, et le pare-feu Windows doit autoriser la connexion.

## 2. Installer et démarrer l'application web

Ouvrir un nouveau terminal à la racine du dépôt :

```powershell
cd app-web
npm install
npm run dev
```

Ouvrir dans le navigateur l'adresse locale affichée par Vite, généralement `http://localhost:5173`.

Pour vérifier la compilation de production :

```powershell
npm run build
```

## 3. Installer et démarrer l'application mobile

Ouvrir un autre terminal à la racine du dépôt :

```powershell
cd app-mobile
npm install
npm start
```

Le script `npm start` lance d'abord `scripts/detect-ip.js`, qui détecte une adresse IPv4 privée du PC et met à jour `app-mobile/.env` avec la variable `EXPO_PUBLIC_API_URL`. Expo démarre ensuite.

Scanner le QR code affiché par Expo avec Expo Go compatible. Le téléphone doit être sur le même réseau que le PC et pouvoir joindre le port `8000`.

Scripts supplémentaires disponibles :

```powershell
npm run android
npm run ios
npm run web
```

- `npm run android` lance Expo pour Android.
- `npm run ios` est destiné à un environnement compatible iOS.
- `npm run web` lance la cible web Expo si elle est prise en charge par l'environnement installé.

**Remarque :** la détection automatique de l'adresse IP est exécutée par `npm start`. Utiliser cette commande pour que le fichier local `app-mobile/.env` soit actualisé avant le démarrage d'Expo.

## Ordre de démarrage recommandé

1. Démarrer le service MySQL.
2. Démarrer Laravel depuis `back-end`.
3. Démarrer l'interface web depuis `app-web`, si nécessaire.
4. Démarrer l'application mobile depuis `app-mobile`, si nécessaire.

## Dépannage

- **Connexion MySQL impossible :** vérifier que MySQL est démarré et que les paramètres de `back-end/.env` sont corrects.
- **Migrations en erreur :** lire le message affiché et vérifier la connexion à la base. Ne pas utiliser `php artisan migrate:fresh` sur une base contenant des données à conserver.
- **Le mobile ne rejoint pas l'API :** vérifier le Wi-Fi, le pare-feu Windows, le port `8000` et l'adresse écrite dans `app-mobile/.env`. Relancer `npm start` pour recalculer l'adresse IP.
- **Dépendances manquantes :** lancer `composer install` dans `back-end` ou `npm install` dans le dossier de l'application concernée.

## Fichiers d'environnement et dépendances

Les dossiers `node_modules/` et `back-end/vendor/` sont recréés localement à l'aide de `npm install` et `composer install`.

Les fichiers `.env` contiennent des paramètres locaux et des secrets : ils ne doivent pas être commités. Le fichier `app-mobile/.env` est ignoré par Git et est généré ou actualisé par le script de détection IP. Ne jamais publier de mot de passe, de clé JWT ou de secret réel.
