# 🚀 Guide de Déploiement : BAYA SHOP sur Railway

## Pourquoi Railway ?

Railway est une plateforme cloud fiable qui supporte **SQLite natif** avec filesystem persistant. Contrairement à Vercel, Railway ne remet pas à zéro les fichiers entre les déploiements.

---

## 1. Préparation : Pousser sur GitHub

Votre code doit être sur GitHub. Si ce n'est pas encore fait :

```bash
# Dans le dossier baya-shop :
git add .
git commit -m "Config Railway - prêt pour déploiement"
git remote add origin https://github.com/VOTRE_USERNAME/baya-shop.git
git push -u origin main
```

---

## 2. Déploiement sur Railway

### Étape 1 - Créer un compte Railway
1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"Start a New Project"**
3. Connectez-vous avec votre compte **GitHub**

### Étape 2 - Déployer depuis GitHub
1. Cliquez sur **"Deploy from GitHub repo"**
2. Sélectionnez votre dépôt **baya-shop**
3. Railway détectera automatiquement que c'est un projet Next.js

### Étape 3 - Ajouter les variables d'environnement
Dans Railway, allez dans **Variables** et ajoutez ces valeurs :

| Variable | Valeur |
|---|---|
| `ADMIN_USERNAME` | `albert` |
| `ADMIN_PASSWORD` | `baya` (changez-le !) |
| `BANK_ACCOUNT_NAME` | `Albert BAYA` |
| `BANK_ACCOUNT_NUMBER` | `BJ061120010086600170007` |
| `BANK_NAME` | `BOA` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `eugenebaya6@gmail.com` |
| `SMTP_PASS` | `lfvb cile ynhq vfln` |
| `SMTP_FROM` | `BAYA SHOP <eugenebaya6@gmail.com>` |
| `NODE_ENV` | `production` |

### Étape 4 - Volume persistant (pour SQLite)
Pour que la base de données SQLite soit **permanente** :

1. Dans Railway, allez dans votre service
2. Cliquez sur **"Add Volume"**
3. Configurez le volume avec le chemin de montage : `/app/prisma`
4. Cliquez sur **"Deploy"**

> [!IMPORTANT]
> Le Volume persistant est **essentiel** pour garder vos commandes entre les redémarrages. Sans lui, la DB se réinitialise à chaque redéploiement.

### Étape 5 - Déployer
1. Railway lancera automatiquement le build
2. Le build exécutera `prisma generate && next build`
3. Une fois terminé, Railway vous donnera une URL publique

---

## 3. Initialiser la base de données

Après le premier déploiement, connectez-vous à Railway et exécutez :

```bash
# Dans le terminal Railway (onglet "Deploy" > "View Logs" > "Shell")
npx prisma db push
```

Cela créera les tables dans la DB SQLite.

---

## 4. Accès à votre site

- **Site public** : `https://votre-projet.up.railway.app`
- **Panneau Admin** : `https://votre-projet.up.railway.app/admin`
  - Identifiant : `albert`
  - Mot de passe : `baya` (changez-le dans Railway Variables !)

---

## 5. Tarification Railway

- **Plan Hobby** : 5$ / mois (recommandé)
- **Plan Trial** : Gratuit avec 500 heures/mois

> [!NOTE]
> Le plan Trial suffit pour tester. Pour un site en production permanent, optez pour le plan Hobby à 5$/mois.

---

## 6. Commandes utiles

```bash
# Voir les logs en direct
railway logs

# Ouvrir un shell dans le conteneur
railway shell

# Re-déployer manuellement
railway up
```
