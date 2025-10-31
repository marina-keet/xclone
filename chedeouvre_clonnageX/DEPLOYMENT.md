# Guide de déploiement sur Vercel pour Clone X

## Prérequis

1. **Base de données en ligne** : Vercel ne supporte pas PostgreSQL local
   - Utilisez Supabase (gratuit) : https://supabase.com
   - Ou Railway : https://railway.app
   - Ou Neon : https://neon.tech

2. **Variables d'environnement configurées**

## Étapes de déploiement

### 1. Préparer la base de données

```bash
# Créez une base de données PostgreSQL en ligne (Supabase recommandé)
# Récupérez les informations de connexion
```

### 2. Configurer les variables d'environnement sur Vercel

Dans le dashboard Vercel, ajoutez ces variables :

```env
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
APP_KEY=your-32-character-secret-key-here
LOG_LEVEL=info
SESSION_DRIVER=cookie

# Base de données (remplacez par vos vraies valeurs)
DB_HOST=your-supabase-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_DATABASE=postgres

# Mail (optionnel)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
```

### 3. Déployer sur Vercel

```bash
# Option 1: Via CLI Vercel
npm i -g vercel
vercel

# Option 2: Via GitHub
# 1. Push votre code sur GitHub
# 2. Connectez le repo à Vercel
# 3. Vercel déploiera automatiquement
```

### 4. Migrer la base de données

Après le déploiement, exécutez les migrations :

```bash
# Localement avec la base de données de production
DATABASE_URL="postgresql://user:password@host:5432/database"
node ace migration:run --force

# Ou via l'interface Supabase SQL Editor
```

## Problèmes courants et solutions

### Pages qui ne s'affichent pas

1. **Vérifiez les logs Vercel** : Dashboard > Functions > View Logs
2. **Variables d'environnement manquantes** : Vérifiez APP_KEY
3. **Base de données non accessible** : Testez la connexion DB
4. **Routes non trouvées** : Vérifiez vercel.json

### Erreurs de build

1. **Dépendances manquantes** : `npm ci` puis redéployez
2. **Erreurs TypeScript** : `npm run typecheck`
3. **Assets non trouvés** : `npm run build` localement

### Performance

1. **Timeout de fonction** : Augmentez maxDuration dans vercel.json
2. **Cold start lent** : Utilisez un plan Vercel Pro
3. **Base de données lente** : Optimisez les requêtes

## Architecture recommandée pour la production

```
Vercel (Frontend + API)
├── Supabase (Base de données PostgreSQL)
├── Vercel KV ou Upstash (Redis pour cache/sessions)
├── Cloudinary ou AWS S3 (Upload de fichiers)
└── Resend ou SendGrid (Emails)
```

## Commandes utiles

```bash
# Test local avec config production
NODE_ENV=production npm start

# Build et test
npm run build
npm start

# Vérifier les types
npm run typecheck

# Logs Vercel
vercel logs [deployment-url]
```

## Checklist avant déploiement

- [ ] Base de données en ligne configurée
- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] APP_KEY généré (32 caractères)
- [ ] Migrations testées
- [ ] Build local réussi
- [ ] vercel.json présent
- [ ] api/index.js créé
- [ ] .gitignore à jour (ne pas commit .env)

## Support

En cas de problème :
1. Vérifiez les logs Vercel
2. Testez localement avec NODE_ENV=production
3. Vérifiez la connectivité à la base de données
4. Consultez la documentation Vercel + AdonisJS