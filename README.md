# BatiPro : Gestion du pointage sur les chantiers

BatiPro est une application de gestion du pointage des employés sur les chantiers. Elle centralise les utilisateurs, les chantiers, les affectations et les présences à travers une API REST et des interfaces web et mobile.

## Architecture du dépôt

```text
BatiPro/
├── back-end/       # API REST Laravel
├── app-web/        # Interface web React
├── app-mobile/     # Application mobile React Native / Expo
└── README.md
```

## Technologies

| Partie | Technologies |
|---|---|
| Back-end | PHP, Laravel, API REST, JWT |
| Base de données | MySQL |
| Application web | React, Tailwind CSS, Vite |
| Application mobile | React Native, Expo |
| Outils | Git, GitHub, VS Code, Postman |

## Prérequis

Installer les outils suivants :

- **Git**
- **PHP 8.3 ou supérieur**
- **Composer**
- **MySQL** (ou un environnement local comme WampServer)
- **Node.js et npm** — utiliser une version compatible avec Vite 8 : Node.js 20.19+ ou 22.12+.
- **Expo Go** sur le téléphone pour tester l'application mobile, ou un émulateur Android.

Vérifier les installations dans PowerShell :

```powershell
git --version
php -v
composer --version
node -v
npm -v
```

## 1. Récupérer le projet

Exécuter les commandes dans PowerShell, dans le dossier où le projet doit être installé :

```powershell
git clone -b main https://github.com/hajjamabderrahmane/BatiPro.git
cd BatiPro
```

Si le dépôt est déjà cloné, ouvrir un terminal à la racine du dossier `BatiPro`.

## 2. Installer et configurer le back-end Laravel

Depuis la racine du projet :

```powershell
cd back-end
Copy-Item .env.example .env
composer install
```

### Configurer la base de données

Créer une base de données vide nommée `pointage_db` dans MySQL ou phpMyAdmin. Ouvrir le fichier `back-end/.env` et configurer ces paramètres :

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

Adapter `DB_USERNAME` et `DB_PASSWORD` à la configuration MySQL locale. Si le fichier `.env.example` contient `DB_CONNECTION=sqlite`, le remplacer par `DB_CONNECTION=mysql` et renseigner les paramètres ci-dessus.

### Générer les clés et créer les tables

Toujours depuis le dossier `back-end` :

```powershell
php artisan key:generate
php artisan jwt:secret
php artisan config:clear
php artisan migrate
```

### Ajouter les données de démonstration (facultatif)

Pour créer les comptes et le chantier de démonstration, exécuter :

```powershell
php artisan db:seed
```

Cette commande est destinée à une base de développement. Le seeder utilise `updateOrCreate` et peut modifier les comptes de démonstration et leurs affectations s'ils existent déjà. Ne pas l'exécuter sur une base contenant des données à conserver.

Comptes de démonstration :

| Rôle | E-mail | Mot de passe initial |
|---|---|---|
| Administrateur | `admin@batipro.test` | `BatiPro@123` |
| Chef de chantier | `chef@batipro.test` | `BatiPro@123` |
| Employé | `employe@batipro.test` | `BatiPro@123` |

Ces identifiants sont réservés aux tests locaux. Ne pas les utiliser dans un environnement partagé ou en production.

### Démarrer l'API

Dans le terminal du back-end :

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

L'API est disponible sur le PC à l'adresse `http://127.0.0.1:8000/api`. Garder ce terminal ouvert pendant les tests.

Pour un test depuis le téléphone, le PC et le téléphone doivent être connectés au même réseau local. Autoriser le port 8000 dans le pare-feu Windows si nécessaire.

## 3. Installer et démarrer l'application web

Ouvrir **un nouveau terminal PowerShell** à la racine du projet `BatiPro` :

```powershell
cd app-web
npm install
npm run dev
```

Ouvrir dans le navigateur l'adresse indiquée dans le terminal, généralement `http://localhost:5173`. Garder ce terminal ouvert.

Pour vérifier la compilation de production :

```powershell
npm run build
```

## 4. Installer et démarrer l'application mobile

Ouvrir **un autre terminal PowerShell** à la racine du projet `BatiPro` :

```powershell
cd app-mobile
npm install
npm start
```

Le script `npm start` exécute `scripts/detect-ip.js`, qui détecte une adresse IPv4 privée du PC et crée ou actualise `app-mobile/.env` avec la variable `EXPO_PUBLIC_API_URL`. Expo démarre ensuite.

Scanner le QR code affiché dans le terminal avec Expo Go. Le téléphone doit être sur le même réseau que le PC et pouvoir accéder au port 8000. Si l'adresse IP change, arrêter Expo puis relancer `npm start`.

Autres scripts disponibles :

```powershell
npm run android
npm run ios
npm run web
```

- `npm run android` lance Expo pour Android.
- `npm run ios` est destiné à un environnement compatible iOS.
- `npm run web` lance la version web Expo si elle est prise en charge par l'environnement installé.

## Ordre de démarrage recommandé

1. Démarrer le service MySQL.
2. Démarrer l'API Laravel depuis `back-end`.
3. Démarrer l'application web depuis `app-web`, si nécessaire.
4. Démarrer l'application mobile depuis `app-mobile`, si nécessaire.

Les trois parties se lancent dans des terminaux séparés. Ne pas fermer le terminal d'un serveur pendant son utilisation.

## Dépannage

- **Connexion MySQL impossible :** vérifier que le service MySQL est démarré et que les paramètres de `back-end/.env` sont corrects.
- **Erreur de clé Laravel :** vérifier que `php artisan key:generate` a été exécuté dans `back-end`.
- **Erreur JWT :** exécuter `php artisan jwt:secret` dans `back-end`, puis `php artisan config:clear`.
- **Migrations en erreur :** vérifier la connexion à la base de données. Ne pas utiliser `php artisan migrate:fresh` sur une base contenant des données à conserver.
- **Le mobile ne rejoint pas l'API :** vérifier le Wi-Fi, le pare-feu Windows, le port 8000 et l'adresse dans `app-mobile/.env`. Relancer `npm start` pour recalculer l'adresse IP.
- **Dépendances manquantes :** exécuter `composer install` dans `back-end` ou `npm install` dans le dossier de l'application concernée.

## Fichiers d'environnement et dépendances

Les dossiers `node_modules/` et `back-end/vendor/` sont recréés localement à l'aide de `npm install` et `composer install`.

Les fichiers `.env` contiennent des paramètres locaux et des secrets : ils ne doivent pas être commités. Le fichier `app-mobile/.env` est ignoré par Git et généré ou actualisé par le script de détection IP. Ne jamais publier de mot de passe, de clé JWT ou de secret réel.
