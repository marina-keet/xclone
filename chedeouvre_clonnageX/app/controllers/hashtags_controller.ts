import type { HttpContext } from '@adonisjs/core/http'
import Hashtag from '#models/hashtag'
import Tweet from '#models/tweet'
import { HashtagService } from '#services/hashtag_service'

export default class HashtagsController {
  /**
   * Afficher tous les tweets d'un hashtag spécifique
   */
  async show({ params, view, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const hashtagSlug = params.slug

      // Rechercher le hashtag par slug
      const hashtag = await Hashtag.query()
        .where('slug', hashtagSlug)
        .preload('tweets', (query) => {
          query.preload('user').preload('hashtags').orderBy('created_at', 'desc').limit(50)
        })
        .first()

      if (!hashtag) {
        return view.render('errors/not_found', {
          message: "Ce hashtag n'existe pas",
        })
      }

      // Formater les tweets avec les hashtags cliquables
      const formattedTweets = hashtag.tweets.map((tweet) => {
        const serialized = tweet.serialize()
        return {
          ...serialized,
          createdAt: tweet.createdAt, // Préserver l'objet DateTime original
          updatedAt: tweet.updatedAt, // Préserver l'objet DateTime original
          formattedContent: HashtagService.formatTextWithHashtags(tweet.content),
        }
      })

      return view.render('pages/hashtag', {
        user,
        hashtag,
        tweets: formattedTweets,
      })
    } catch (error) {
      console.error("Erreur lors de l'affichage du hashtag:", error)
      return view.render('errors/server_error')
    }
  }

  /**
   * Rechercher des hashtags (pour l'autocomplétion)
   */
  async search({ request, response }: HttpContext) {
    try {
      const query = request.input('q', '').toLowerCase()

      if (query.length < 2) {
        return response.json({ hashtags: [] })
      }

      const hashtags = await Hashtag.query()
        .where('name', 'like', `%${query}%`)
        .orderBy('tweet_count', 'desc')
        .limit(10)

      return response.json({
        hashtags: hashtags.map((hashtag) => ({
          name: hashtag.name,
          slug: hashtag.slug,
          tweetCount: hashtag.tweetCount,
        })),
      })
    } catch (error) {
      console.error('Erreur lors de la recherche de hashtags:', error)
      return response.json({ hashtags: [] })
    }
  }

  /**
   * Afficher les hashtags tendances
   */
  async trending({ view, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const trendingHashtags = await Hashtag.query()
        .where('tweet_count', '>', 0)
        .orderBy('tweet_count', 'desc')
        .limit(20)

      return view.render('pages/trending-hashtags', {
        user,
        hashtags: trendingHashtags,
      })
    } catch (error) {
      console.error("Erreur lors de l'affichage des hashtags tendances:", error)
      return view.render('errors/server_error')
    }
  }
}
