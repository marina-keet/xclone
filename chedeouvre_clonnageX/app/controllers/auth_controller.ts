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

      // Créer le nouvel utilisateur (directement vérifié)
      const user = await User.create({
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

      console.log(`✅ Nouveau compte créé: ${user.username} (${user.email})`)

      // Connexion automatique
      session.flash('success', 'Compte créé avec succès ! Vous êtes maintenant connecté.')
      return response.redirect('/dashboard')
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

    // Récupérer tous les tweets pour le feed avec hashtags
    const { default: Tweet } = await import('#models/tweet')
    const { HashtagService } = await import('#services/hashtag_service')
    const tweets = await Tweet.query()
      .preload('user')
      .preload('hashtags')
      .orderBy('created_at', 'desc')
      .limit(50)

    // Formater les tweets avec les hashtags cliquables
    const formattedTweets = tweets.map((tweet) => {
      // Assigner un fullName temporaire si l'utilisateur n'en a pas
      if (tweet.user && (!tweet.user.fullName || tweet.user.fullName.trim() === '')) {
        tweet.user.fullName = `Utilisateur ${tweet.user.username}`
      }

      const serialized = tweet.serialize()

      // Inclure explicitement l'utilisateur sérialisé dans l'objet tweet
      serialized.user = tweet.user
        ? typeof tweet.user.toJSON === 'function'
          ? tweet.user.toJSON()
          : tweet.user
        : null

      return {
        ...serialized,
        createdAt: tweet.createdAt, // Préserver l'objet DateTime original
        updatedAt: tweet.updatedAt, // Préserver l'objet DateTime original
        formattedContent: HashtagService.formatTextWithHashtags(tweet.content),
      }
    })

    // Récupérer des suggestions d'utilisateurs à suivre (excluant l'utilisateur actuel)
    const suggestedUsers = await User.query()
      .whereNot('id', user.id)
      .orderBy('created_at', 'desc')
      .limit(5)

    // Assigner des fullNames temporaires aux suggestions aussi
    const suggestedUsersMapped = suggestedUsers.map((suggestedUser) => {
      if (!suggestedUser.fullName || suggestedUser.fullName.trim() === '') {
        suggestedUser.fullName = `Utilisateur ${suggestedUser.username}`
      }
      return typeof suggestedUser.toJSON === 'function' ? suggestedUser.toJSON() : suggestedUser
    })

    // Calculer le nombre total de messages non lus
    const { default: Message } = await import('#models/message')
    const totalUnreadCount = await Message.query()
      .where('receiver_id', user.id)
      .whereNull('read_at')
      .count('* as total')
      .first()

    const unreadMessagesCount = totalUnreadCount ? Number(totalUnreadCount.$extras.total) : 0

    return view.render('pages/home_twitter', {
      user,
      tweets: formattedTweets,
      suggestedUsers: suggestedUsersMapped,
      totalUnreadCount: unreadMessagesCount,
    })
  }

  /**
   * Afficher le profil utilisateur
   */
  async profile({ view, auth }: HttpContext) {
    await auth.authenticate()
    const user = auth.getUserOrFail()

    // Récupérer les tweets de l'utilisateur avec hashtags
    const { default: Tweet } = await import('#models/tweet')
    const { HashtagService } = await import('#services/hashtag_service')
    const tweets = await Tweet.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .preload('user')
      .preload('hashtags')
      .exec()

    // Formater les tweets avec les hashtags cliquables
    const formattedTweets = tweets.map((tweet) => {
      const serialized = tweet.serialize()
      return {
        ...serialized,
        createdAt: tweet.createdAt, // Préserver l'objet DateTime original
        updatedAt: tweet.updatedAt, // Préserver l'objet DateTime original
        formattedContent: HashtagService.formatTextWithHashtags(tweet.content),
      }
    })

    console.log(`📊 Profil de ${user.username}:`)
    console.log(`   - Nombre de tweets: ${tweets.length}`)
    if (tweets.length > 0) {
      console.log(`   - Premier tweet: "${tweets[0].content.substring(0, 50)}..."`)
      console.log(`   - Image premier tweet: ${tweets[0].imageUrl || 'affichage'}`)
      console.log(
        `   - Utilisateur du tweet: ${tweets[0].user.fullName || tweets[0].user.username}`
      )
    }

    return view.render('pages/profil', { user, tweets: formattedTweets })
  }
}
