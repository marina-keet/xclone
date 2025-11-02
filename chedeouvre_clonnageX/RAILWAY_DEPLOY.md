# 🚀 Guide de déploiement Railway - Clone X

## Étapes de déploiement (5 minutes)

### 1️⃣ Préparer le repository
```bash
# Assurez-vous que tout est commité
git add .
git commit -m "Prêt pour déploiement Railway"
git push origin main
```

### 2️⃣ Créer le projet Railway

1. **Aller sur Railway**
   - Visitez [railway.app](https://railway.app)
   - Cliquez "Start a New Project"
   - Connectez votre compte GitHub

2. **Sélectionner le repository**
   - Choisissez "Deploy from GitHub repo"
   - Sélectionnez votre repo `2025-dev-matin-projet-clone-x-with-adonis-marina-keet`
   - Railway détecte automatiquement AdonisJS ✅

3. **Ajouter PostgreSQL**
   - Cliquez "Add Service" → "Database" → "PostgreSQL"
   - Railway crée automatiquement la base de données
   - Les variables de connexion sont générées automatiquement

### 3️⃣ Configurer les variables d'environnement

Dans Railway Dashboard > Variables :

```env
NODE_ENV=production
APP_KEY=cVRtP9GdKfg3YAfg4sSYa15sa3kGES5n
HOST=0.0.0.0
LOG_LEVEL=info
SESSION_DRIVER=cookie

# Mail (optionnel)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
```

**⚠️ Important :** Railway génère automatiquement :
- `PORT` (dynamique)
- `DATABASE_URL` (connexion PostgreSQL)

### 4️⃣ Lancer les migrations

Une fois déployé :

1. **Via Railway CLI** (recommandé)
   ```bash
   # Installer Railway CLI
   npm install -g @railway/cli
   
   # Se connecter
   railway login
   
   # Lancer les migrations
   railway run node ace migration:run --force
   ```

2. **Via interface web**
   - Railway Dashboard > Deployments > Console
   - Exécuter : `node ace migration:run --force`

### 5️⃣ Créer des données de test (optionnel)

```bash
# Via Railway CLI
railway run node ace db:seed
```

## ✅ Vérifications post-déploiement

### URLs à tester
- `https://your-app.railway.app` → Page d'accueil
- `https://your-app.railway.app/register` → Inscription
- `https://your-app.railway.app/login` → Connexion

### Logs de débogage
```bash
# Via CLI
railway logs

# Via interface
Railway Dashboard > Deployments > Logs
```

## 🔧 Configuration automatique Railway

### Ce que Railway fait automatiquement :
- ✅ Détecte AdonisJS (`package.json`)
- ✅ Installe les dépendances (`npm install`)
- ✅ Build l'application (`npm run build`)
- ✅ Lance le serveur (`npm start`)
- ✅ Assigne un port dynamique
- ✅ Génère une URL HTTPS
- ✅ Redéploiement automatique (push GitHub)

### Variables générées automatiquement :
- `PORT` → Port dynamique Railway
- `DATABASE_URL` → Connexion PostgreSQL complète
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

## 🎯 Avantages Railway

### Plan gratuit
- 🆓 500h d'exécution/mois
- 🗄️ PostgreSQL gratuit (1GB)
- 🌍 Déploiement global
- 📊 Monitoring inclus

### Fonctionnalités pro
- 🔄 Déploiements automatiques
- 📈 Scaling automatique  
- 🛡️ SSL/TLS automatique
- 💾 Backups automatiques

## 🚨 En cas de problème

### Erreurs communes

1. **Build failed**
   ```bash
   # Vérifier localement
   npm run build
   ```

2. **Database connection error**
   - Vérifier que PostgreSQL est ajouté
   - `DATABASE_URL` présent dans variables

3. **Port binding error**
   - Railway gère automatiquement le PORT
   - Ne pas définir PORT manuellement

### Support
- 📚 [Docs Railway](https://docs.railway.app)
- 💬 [Discord Railway](https://discord.gg/railway)
- 🐛 Railway Dashboard > Help

## 🎉 Résultat

Après déploiement :
- ✅ Application accessible 24/7
- ✅ HTTPS automatique
- ✅ Base de données PostgreSQL
- ✅ Redéploiement automatique
- ✅ Monitoring et logs

**Votre Clone X sera en ligne en moins de 10 minutes !** 🚀