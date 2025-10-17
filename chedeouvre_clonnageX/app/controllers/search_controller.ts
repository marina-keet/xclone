import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Tweet from '#models/tweet'
import { Database } from '@adonisjs/lucid/database'

export default class SearchController {
  /**
   * Rechercher des utilisateurs et des tweets
   */
  async search({ request, response, view, auth }: HttpContext) {
    try {
      const query = request.input('q', '').trim()

      // Récupérer l'utilisateur actuel
      let currentUser = null
      try {
        currentUser = await auth.authenticate()
      } catch (error) {
        // Utilisateur non connecté
      }

      // Récupérer des utilisateurs suggérés (les plus récents, excluant l'utilisateur actuel)
      const suggestedUsersQuery = User.query().orderBy('created_at', 'desc').limit(3)

      if (currentUser) {
        suggestedUsersQuery.where('id', '!=', currentUser.id)
      }

      const suggestedUsers = await suggestedUsersQuery

      if (!query) {
        return view.render('pages/search', {
          query: '',
          users: [],
          tweets: [],
          hasResults: false,
          currentUser: currentUser?.toJSON() || null,
          suggestedUsers: suggestedUsers.map((user) => user.toJSON()),
        })
      }

      // Recherche d'utilisateurs
      const users = await User.query()
        .where((builder) => {
          builder
            .whereILike('username', `%${query}%`)
            .orWhereILike('full_name', `%${query}%`)
            .orWhereILike('bio', `%${query}%`)
        })
        .orderBy('followers_count', 'desc')
        .limit(10)

      // Recherche de tweets
      const tweets = await Tweet.query()
        .preload('user')
        .preload('likes', (likesQuery) => {
          likesQuery.preload('user')
        })
        .preload('retweets', (retweetsQuery) => {
          retweetsQuery.preload('user')
        })
        .where((builder) => {
          builder.whereILike('content', `%${query}%`)
        })
        .orderBy('created_at', 'desc')
        .limit(20)

      // Ajouter les informations d'interaction pour l'utilisateur connecté
      const tweetsWithInteractions = await Promise.all(
        tweets.map(async (tweet) => {
          let hasLiked = false
          let hasRetweeted = false

          if (currentUser) {
            const existingLike = await Database.from('likes')
              .where('user_id', currentUser.id)
              .where('tweet_id', tweet.id)
              .first()

            const existingRetweet = await Database.from('retweets')
              .where('user_id', currentUser.id)
              .where('tweet_id', tweet.id)
              .first()

            hasLiked = !!existingLike
            hasRetweeted = !!existingRetweet
          }

          return {
            ...tweet.toJSON(),
            hasLiked,
            hasRetweeted,
            likesCount: tweet.likes.length,
            retweetsCount: tweet.retweets.length,
          }
        })
      )

      return view.render('pages/search', {
        query,
        users: users.map((user) => user.toJSON()),
        tweets: tweetsWithInteractions,
        hasResults: users.length > 0 || tweets.length > 0,
        currentUser: currentUser?.toJSON() || null,
        suggestedUsers: suggestedUsers.map((user) => user.toJSON()),
      })
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * API de recherche pour les requêtes AJAX
   */
  async searchApi({ request, response, auth }: HttpContext) {
    try {
      const query = request.input('q', '').trim()

      if (!query) {
        return response.json({
          query: '',
          users: [],
          tweets: [],
          hasResults: false,
        })
      }

      // Recherche d'utilisateurs
      const users = await User.query()
        .where((builder) => {
          builder
            .whereILike('username', `%${query}%`)
            .orWhereILike('full_name', `%${query}%`)
            .orWhereILike('bio', `%${query}%`)
        })
        .orderBy('followers_count', 'desc')
        .limit(10)

      // Recherche de tweets
      const tweets = await Tweet.query()
        .preload('user')
        .preload('likes')
        .preload('retweets')
        .where((builder) => {
          builder.whereILike('content', `%${query}%`)
        })
        .orderBy('created_at', 'desc')
        .limit(20)

      // Ajouter les informations d'interaction pour l'utilisateur connecté
      let currentUser = null
      try {
        currentUser = await auth.authenticate()
      } catch (error) {
        // Utilisateur non connecté
      }

      const tweetsWithInteractions = await Promise.all(
        tweets.map(async (tweet) => {
          let hasLiked = false
          let hasRetweeted = false

          if (currentUser) {
            const existingLike = await Database.from('likes')
              .where('user_id', currentUser.id)
              .where('tweet_id', tweet.id)
              .first()

            const existingRetweet = await Database.from('retweets')
              .where('user_id', currentUser.id)
              .where('tweet_id', tweet.id)
              .first()

            hasLiked = !!existingLike
            hasRetweeted = !!existingRetweet
          }

          return {
            ...tweet.toJSON(),
            hasLiked,
            hasRetweeted,
            likesCount: tweet.likes.length,
            retweetsCount: tweet.retweets.length,
          }
        })
      )

      return response.json({
        query,
        users: users.map((user) => user.toJSON()),
        tweets: tweetsWithInteractions,
        hasResults: users.length > 0 || tweets.length > 0,
      })
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }
}
