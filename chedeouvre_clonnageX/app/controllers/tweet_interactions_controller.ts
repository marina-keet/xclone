import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import Like from '#models/like'
import Retweet from '#models/retweet'
import Notification from '#models/notification'
import { inject } from '@adonisjs/core'

@inject()
export default class TweetInteractionsController {
  /**
   * Liker ou unliker un tweet
   */
  async toggleLike({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tweetId = params.id

      // Vérifier que le tweet existe
      const tweet = await Tweet.findOrFail(tweetId)

      // Vérifier si l'utilisateur a déjà liké ce tweet
      const existingLike = await Like.query()
        .where('user_id', user.id)
        .where('tweet_id', tweetId)
        .first()

      if (existingLike) {
        // Retirer le like
        await existingLike.delete()
        tweet.likesCount = Math.max(0, tweet.likesCount - 1)
        await tweet.save()

        return response.json({
          status: 'unliked',
          likesCount: tweet.likesCount,
        })
      } else {
        // Ajouter le like
        await Like.create({
          userId: user.id,
          tweetId: tweetId,
        })
        tweet.likesCount = tweet.likesCount + 1
        await tweet.save()

        // Précharger l'utilisateur du tweet pour les notifications
        await tweet.load('user')

        // Créer une notification pour l'auteur du tweet (sauf si c'est son propre tweet)
        if (tweet.userId !== user.id) {
          await Notification.create({
            userId: tweet.userId,
            fromUserId: user.id,
            type: 'like',
            tweetId: tweetId,
            message: `@${user.username} a aimé votre tweet`,
            isRead: false,
          })

          console.log(`❤️ ${user.username} a liké le tweet de ${tweet.user.username}`)
        }

        return response.json({
          status: 'liked',
          likesCount: tweet.likesCount,
        })
      }
    } catch (error) {
      console.error('Erreur lors du toggle like:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Retweeter un tweet
   */
  async retweet({ params, auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tweetId = params.id
      const comment = request.input('comment', null)

      // Vérifier que le tweet existe
      const tweet = await Tweet.findOrFail(tweetId)

      // Vérifier si l'utilisateur a déjà retweeté ce tweet
      const existingRetweet = await Retweet.query()
        .where('user_id', user.id)
        .where('tweet_id', tweetId)
        .first()

      if (existingRetweet) {
        return response.status(400).json({
          error: 'Vous avez déjà retweeté ce tweet',
        })
      }

      // Créer le retweet
      await Retweet.create({
        userId: user.id,
        tweetId: tweetId,
        comment: comment,
      })

      tweet.retweetsCount = tweet.retweetsCount + 1
      await tweet.save()

      return response.json({
        status: 'retweeted',
        retweetsCount: tweet.retweetsCount,
      })
    } catch (error) {
      console.error('Erreur lors du retweet:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Annuler un retweet
   */
  async unretweet({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tweetId = params.id

      // Trouver le retweet existant
      const existingRetweet = await Retweet.query()
        .where('user_id', user.id)
        .where('tweet_id', tweetId)
        .first()

      if (!existingRetweet) {
        return response.status(404).json({
          error: 'Retweet non trouvé',
        })
      }

      // Supprimer le retweet
      await existingRetweet.delete()

      // Mettre à jour le compteur
      const tweet = await Tweet.findOrFail(tweetId)
      tweet.retweetsCount = Math.max(0, tweet.retweetsCount - 1)
      await tweet.save()

      return response.json({
        status: 'unretweeted',
        retweetsCount: tweet.retweetsCount,
      })
    } catch (error) {
      console.error("Erreur lors de l'annulation du retweet:", error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Obtenir les interactions d'un utilisateur pour un tweet
   */
  async getInteractions({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tweetId = params.id

      const tweet = await Tweet.findOrFail(tweetId)

      const userLike = await Like.query()
        .where('user_id', user.id)
        .where('tweet_id', tweetId)
        .first()

      const userRetweet = await Retweet.query()
        .where('user_id', user.id)
        .where('tweet_id', tweetId)
        .first()

      return response.json({
        hasLiked: !!userLike,
        hasRetweeted: !!userRetweet,
        likesCount: tweet.likesCount,
        retweetsCount: tweet.retweetsCount,
        repliesCount: tweet.repliesCount,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des interactions:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }
}
