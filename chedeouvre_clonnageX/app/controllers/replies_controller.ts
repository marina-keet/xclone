import type { HttpContext } from '@adonisjs/core/http'
import Reply from '#models/reply'
import Tweet from '#models/tweet'
import Notification from '#models/notification'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class RepliesController {
  async store({ request, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const content = request.input('content')
    const tweetId = request.input('tweet_id')
    const image = request.file('image')

    let imagePath = null
    if (image) {
      const imageName = `${cuid()}.${image.extname}`
      await image.move(app.makePath('uploads/replies'), {
        name: imageName,
      })
      imagePath = imageName
    }

    const reply = await Reply.create({
      content,
      userId: user.id,
      tweetId,
      image: imagePath,
    })

    // Incrémenter le compteur de réponses du tweet
    const tweet = await Tweet.findOrFail(tweetId)
    tweet.repliesCount = tweet.repliesCount + 1
    await tweet.save()

    await reply.load('user')

    // Créer une notification pour l'auteur du tweet (sauf si c'est son propre tweet)
    await tweet.load('user')
    if (tweet.userId !== user.id) {
      console.log(`💬 Création de notification comment: ${user.username} -> ${tweet.user.username}`)
      const commentNotification = await Notification.create({
        userId: tweet.userId,
        fromUserId: user.id,
        type: 'comment',
        tweetId: tweetId,
        message: `@${user.username} a commenté votre tweet`,
        isRead: false,
      })
      console.log(`✅ Notification comment créée:`, commentNotification.toJSON())
      console.log(`💬 ${user.username} a commenté le tweet de ${tweet.user.username}`)
    } else {
      console.log(`👤 ${user.username} a commenté son propre tweet - pas de notification`)
    }

    if (request.accepts(['json'])) {
      return response.json({
        success: true,
        reply: {
          id: reply.id,
          content: reply.content,
          image: reply.image,
          createdAt: reply.createdAt,
          user: {
            id: reply.user.id,
            username: reply.user.username,
            fullName: reply.user.fullName,
            avatar: reply.user.avatar,
          },
        },
      })
    }

    return response.redirect().back()
  }

  async getReplies({ params, response }: HttpContext) {
    const tweetId = params.id

    const replies = await Reply.query()
      .where('tweet_id', tweetId)
      .preload('user')
      .orderBy('created_at', 'desc')

    return response.json({
      replies: replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        image: reply.image,
        createdAt: reply.createdAt,
        user: {
          id: reply.user.id,
          username: reply.user.username,
          fullName: reply.user.fullName,
          avatar: reply.user.avatar,
        },
      })),
    })
  }
}
