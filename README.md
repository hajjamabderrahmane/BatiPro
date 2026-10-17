# BatiPro — Gestion du pointage des chantiers

BatiPro est une application de gestion du pointage des employés sur les chantiers. Le projet est organisé en trois parties :

- **back-end** : API REST avec Laravel et MySQL.
- **app-web** : interface web avec React et Vite.
- **app-mobile** : application mobile avec React Native et Expo.

## 1. Prérequis

Installer les outils suivants sur la machine :

- Git
- PHP **8.3 ou plus récent**, avec les extensions requises par Laravel
- Composer
- MySQL (par exemple via WampServer)
- Node.js et npm
- Un navigateur web
- Pour tester l'application mobile : Expo Go sur un téléphone compatible, ou un émulateur Android configuré

Vérifier les installations :

```bash
git --version
php -v
composer --version
node -v
npm -v
```

## 2. Récupérer le projet

```bash
git clone https://github.com/hajjamabderrahmane/BatiPro.git
cd BatiPro
```

> Si le dépôt reste privé, l'utilisateur doit avoir accès au dépôt GitHub pour pouvoir le cloner.

## 3. Configurer et démarrer le back-end Laravel

### 3.1 Installer les dépendances PHP

```bash
cd back-end
composer install
```

### 3.2 Créer le fichier d'environnement

Sous Windows (Invite de commandes) :

```cmd
copy .env.example .env
```

Sous PowerShell, la même commande fonctionne. Ensuite, ouvrir `.env` et configurer au minimum les paramètres de l'application et de la base de données.

Pour utiliser MySQL, renseigner les paramètres correspondant à l'installation locale. Exemple à adapter :

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

**Important :** créer d'abord une base de données vide nommée `pointage_db` dans MySQL/phpMyAdmin, ou choisir un autre nom et utiliser le même dans `.env`. Adapter l'utilisateur et le mot de passe à la configuration MySQL locale. Ne jamais publier le vrai fichier `.env` ni ses mots de passe.

Le fichier `.env.example` du dépôt peut contenir des valeurs par défaut différentes : vérifier que `DB_CONNECTION` est bien réglé sur `mysql` si MySQL est utilisé.

### 3.3 Générer les clés et préparer la base

```bash
php artisan key:generate
php artisan jwt:secret
php artisan config:clear
php artisan migrate
```

- `key:generate` génère la clé de l'application Laravel.
- `jwt:secret` génère le secret JWT si la commande est disponible et que le projet utilise cette configuration.
- `migrate` crée les tables définies par les migrations versionnées dans le dépôt.

Les migrations du projet couvrent notamment les utilisateurs, les chantiers, les affectations et les pointages. Les migrations créent la structure des tables, mais ne recopient pas automatiquement les données présentes dans la base locale du développeur. Si des comptes ou des données initiales sont nécessaires, ils doivent être fournis par des seeders ou créés selon la procédure prévue par le projet.

### 3.4 Démarrer l'API

Pour un test local sur la même machine :

```bash
php artisan serve
```

Pour autoriser un téléphone connecté au même réseau Wi-Fi à joindre l'API, démarrer plutôt le serveur avec :

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

L'API est alors accessible depuis la machine hôte à `http://127.0.0.1:8000`. Depuis un téléphone, remplacer `127.0.0.1` par l'adresse IP locale du PC, par exemple `http://192.168.x.x:8000`. Le téléphone et le PC doivent être sur le même réseau, et le pare-feu Windows doit autoriser la connexion.

> Vérifier dans le code mobile où l'URL de base de l'API est définie et la remplacer par l'adresse IP locale de la machine qui exécute Laravel. Ne pas utiliser `localhost` ou `127.0.0.1` dans l'application mobile pour viser le PC : sur le téléphone, ces adresses désignent le téléphone lui-même.

## 4. Installer et démarrer l'application web

Ouvrir un **nouveau terminal** depuis la racine du dépôt :

```bash
cd app-web
npm install
npm run dev
```

Vite affiche l'adresse locale à ouvrir dans le navigateur, généralement `http://localhost:5173`.

Pour vérifier la compilation de production :

```bash
npm run build
```

## 5. Installer et démarrer l'application mobile

Ouvrir un **nouveau terminal** depuis la racine du dépôt :

```bash
cd app-mobile
npm install
npm start
```

Suivre les instructions affichées par Expo. Pour utiliser un téléphone, installer Expo Go si la version de l'application est compatible, puis scanner le QR code affiché dans le terminal. Le téléphone doit pouvoir accéder à l'API via l'adresse IP locale du PC.

Scripts disponibles :

```bash
npm run android
npm run ios
npm run web
```

- `npm run android` démarre Expo avec la cible Android (émulateur configuré requis selon l'environnement).
- `npm run ios` est destiné à un environnement compatible iOS.
- `npm run web` démarre la version web Expo si elle est prise en charge par l'environnement installé.

## 6. Dépendances et fichiers ignorés par Git

Les dossiers `node_modules/` et `back-end/vendor/` ne sont pas stockés dans Git. Chaque développeur les recrée avec `npm install` et `composer install`.

Le fichier `.env` est local et ignoré par Git. Seul le fichier modèle `.env.example` doit être partagé, sans mot de passe ni secret personnel.

## 7. Ordre de démarrage recommandé

1. Démarrer MySQL.
2. Démarrer l'API Laravel depuis `back-end`.
3. Démarrer l'interface web depuis `app-web), si nécessaire.
4. Démarrer l'application mobile depuis `app-mobile`, si nécessaire.

## 8. Dépannage rapide

- **Erreur de connexion MySQL** : vérifier que le service MySQL est démarré, que le port est correct et que les identifiants de `.env` correspondent à la configuration locale.
- **Les migrations échouent** : vérifier la connexion à la base et consulter le message d'erreur avant de relancer une commande destructive. Éviter `php artisan migrate:fresh` sur une base contenant des données à conserver.
- **Le mobile n'atteint pas l'API** : vérifier l'adresse IP locale du PC, le même réseau Wi-Fi, le port 8000 et le pare-feu Windows.
- **Une dépendance manque** : lancer `composer install` dans `back-end`, ou `npm install` dans le dossier web/mobile concerné.

## Technologies

Laravel · PHP · MySQL · React · Vite · React Native · Expo · npm · Composer
