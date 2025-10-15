import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import User from '#models/user'

export default class TweetsController {
  /**
   * Créer un nouveau tweet
   */
  async store({ request, auth, response, session }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.getUserOrFail()

      const { content, image } = request.only(['content', 'image'])

      // Validation basique
      if (!content || content.trim().length === 0) {
        session.flash('error', 'Le contenu du tweet ne peut pas être vide')
        return response.redirect().back()
      }

      if (content.length > 280) {
        session.flash('error', 'Le tweet ne peut pas dépasser 280 caractères')
        return response.redirect().back()
      }

      // Créer le tweet
      await Tweet.create({
        userId: user.id,
        content: content.trim(),
        image: image || null,
        likesCount: 0,
        retweetsCount: 0,
        repliesCount: 0,
      })

      // Incrémenter le compteur de tweets de l'utilisateur
      await User.query().where('id', user.id).increment('tweets_count', 1)

      session.flash('success', 'Tweet publié avec succès !')
      return response.redirect().back()
    } catch (error) {
      console.error('Erreur lors de la création du tweet:', error)
      session.flash('error', 'Erreur lors de la publication du tweet')
      return response.redirect().back()
    }
  }

  /**
   * Récupérer les tweets d'un utilisateur pour son profil
   */
  async getUserTweets({ params, view }: HttpContext) {
    try {
      const userId = params.userId

      const tweets = await Tweet.query()
        .where('user_id', userId)
        .preload('user')
        .orderBy('created_at', 'desc')
        .limit(20)

      return tweets
    } catch (error) {
      console.error('Erreur lors de la récupération des tweets:', error)
      return []
    }
  }

  /**
   * Récupérer tous les tweets pour le feed
   */
  async getFeed({ auth }: HttpContext) {
    try {
      await auth.authenticate()

      const tweets = await Tweet.query().preload('user').orderBy('created_at', 'desc').limit(50)

      return tweets
    } catch (error) {
      console.error('Erreur lors de la récupération du feed:', error)
      return []
    }
  }
}
