import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class AuthController {
  /**
   * Afficher la page d'accueil/connexion
   */
  async showHome({ view }: HttpContext) {
    return view.render('pages/home')
  }

  /**
   * Créer un nouvel utilisateur
   */
  async register({ request, response, session }: HttpContext) {
    try {
      // Validation des données
      const data = request.only(['username', 'fullName', 'email', 'password', 'birthDate'])

      // Vérifier si l'email ou le username existe déjà
      const existingUser = await User.query()
        .where('email', data.email)
        .orWhere('username', data.username)
        .first()

      if (existingUser) {
        session.flash('error', "Cet email ou nom d'utilisateur existe déjà")
        return response.redirect().back()
      }

      // Créer le nouvel utilisateur
      await User.create({
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate ? DateTime.fromISO(data.birthDate) : null,
        verified: false,
        privateAccount: false,
        followersCount: 0,
        followingCount: 0,
        tweetsCount: 0,
      })

      // Rediriger vers la page de connexion avec un message de succès
      session.flash(
        'success',
        'Compte créé avec succès ! Veuillez vous connecter avec vos identifiants.'
      )
      return response.redirect('/')
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      session.flash('error', 'Erreur lors de la création du compte')
      return response.redirect().back()
    }
  }

  /**
   * Connecter un utilisateur
   */
  async login({ request, response, auth, session }: HttpContext) {
    try {
      const { identifier, password } = request.only(['identifier', 'password'])

      // Validation basique
      if (!identifier || !password) {
        throw new Error('Identifiant et mot de passe requis')
      }

      // Nettoyer les données
      const cleanIdentifier = identifier.trim()
      const cleanPassword = password.trim()

      console.log('🔍 Tentative de connexion avec:', cleanIdentifier)

      // Vérifier si l'utilisateur existe
      const userExists = await User.query()
        .where('email', cleanIdentifier)
        .orWhere('username', cleanIdentifier)
        .first()

      if (!userExists) {
        console.log('❌ Utilisateur non trouvé:', cleanIdentifier)
        session.flash('error', 'Utilisateur non trouvé')
        return response.redirect().back()
      }

      console.log('✅ Utilisateur trouvé:', userExists.email, userExists.username)

      // Tenter la connexion avec email ou username
      const user = await User.verifyCredentials(cleanIdentifier, cleanPassword)
      await auth.use('web').login(user)

      console.log('✅ Connexion réussie pour:', user.email)
      session.flash('success', 'Connexion réussie !')
      return response.redirect('/dashboard')
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error.message)
      session.flash('error', 'Identifiants incorrects')
      return response.redirect().back()
    }
  }

  /**
   * Déconnecter l'utilisateur
   */
  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/')
  }

  /**
   * Afficher le dashboard (home Twitter)
   */
  async dashboard({ view, auth }: HttpContext) {
    await auth.authenticate()
    const user = auth.getUserOrFail()
    return view.render('pages/home_twitter', { user })
  }

  /**
   * Afficher le profil utilisateur
   */
  async profile({ view, auth }: HttpContext) {
    await auth.authenticate()
    const user = auth.getUserOrFail()
    
    // Récupérer les tweets de l'utilisateur
    const { default: Tweet } = await import('#models/tweet')
    const tweets = await Tweet.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .preload('user')
      .exec()
    
    console.log(`📊 Profil de ${user.username}:`)
    console.log(`   - Nombre de tweets: ${tweets.length}`)
    if (tweets.length > 0) {
      console.log(`   - Premier tweet: "${tweets[0].content.substring(0, 50)}..."`)
      console.log(`   - Image premier tweet: ${tweets[0].image || 'Aucune image'}`)
      console.log(
        `   - Utilisateur du tweet: ${tweets[0].user.fullName || tweets[0].user.username}`
      )
    }
    
    return view.render('pages/profil', { user, tweets })
  }
}
