# Guide de Déploiement : BAYA SHOP

Félicitations, l'application BAYA SHOP est prête à être mise en ligne.
Ce guide vous indique comment héberger votre site sur un serveur (VPS, Hostinger, LWS, etc.) ou via Vercel.

---

## 1. Prérequis Serveur Classique (Recommandé)

Étant donné que nous utilisons **SQLite** pour stocker les produits, les commandes et les avis, un hébergement sur un **serveur standard (VPS, cPanel Node.js, Hostinger)** est **fortement recommandé**. Cela garantit que la base de données (`dev.db`) ne soit jamais effacée.

### Étapes sur votre VPS / Serveur
1. **Installez Node.js** (version 18+ recommandée).
2. **Uploadez vos fichiers** vers le serveur (via FTP ou Git).
3. **Installez les dépendances** :
   ```bash
   npm install
   ```
4. **Appliquez la base de données Prisma** :
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Compilez l'application Next.js** pour la production :
   ```bash
   npm run build
   ```
6. **Lancez le serveur** (Nous recommandons d'utiliser `pm2` pour que le site reste allumé en permanence) :
   ```bash
   npm install -g pm2
   pm2 start npm --name "bayashop" -- start
   ```

---

## 2. Déploiement sur Vercel (Alternatif)

> [!WARNING]
> Vercel est un environnement **Serverless**. À chaque redémarrage, Vercel **efface les fichiers locaux**. Cela signifie que votre base de données SQLite (`dev.db`) sera réinitialisée constamment et vous perdrez vos commandes.

Si vous **devez** déployer sur Vercel, vous devrez remplacer SQLite par une base de données Cloud gratuite (comme **Neon.tech** ou **Supabase**) :

1. Créez un compte gratuit sur Neon ou Supabase et récupérez l'URL de connexion PostgreSQL.
2. Allez dans le fichier `prisma/schema.prisma` et modifiez le datasource :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Créez un fichier `.env` contenant votre clé :
   ```env
   DATABASE_URL="postgres://votre_utilisateur:motdepasse@serveur.neon.tech/bayashop"
   ```
4. Exécutez :
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Sur Vercel, ajoutez votre `DATABASE_URL` dans les variables d'environnement.
6. Déployez votre projet sur Vercel.

---

## 3. Sécurité (Très Important)
L'espace Administration (`/admin`) nécessite de configurer un mot de passe.
Allez dans le panneau de contrôle de votre hébergeur (ou dans votre fichier `.env.local` sur le serveur) et définissez :
```env
ADMIN_PASSWORD=VOTRE_MOT_DE_PASSE_SECRET
```
Si vous ne le définissez pas, le mot de passe par défaut pour accéder à l'admin restera `admin`. Changez-le dès que possible !
