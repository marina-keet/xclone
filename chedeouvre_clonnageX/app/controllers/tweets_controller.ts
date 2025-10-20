import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import User from '#models/user'
import Hashtag from '#models/hashtag'
import { HashtagService } from '#services/hashtag_service'

export default class TweetsController {
  /**
   * Créer un nouveau tweet
   */
  async store({ request, auth, response, session }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.getUserOrFail()

      const { content } = request.only(['content'])

      // Validation basique
      if (!content || content.trim().length === 0) {
        session.flash('error', 'Le contenu du tweet ne peut pas être vide')
        return response.redirect().back()
      }

      if (content.length > 280) {
        session.flash('error', 'Le tweet ne peut pas dépasser 280 caractères')
        return response.redirect().back()
      }

      // Gérer l'upload d'image
      let imageFileName = null
      const image = request.file('image')

      if (image) {
        // Vérifier que c'est bien une image
        if (!image.isValid) {
          session.flash('error', "Le fichier image n'est pas valide")
          return response.redirect().back()
        }

        // Vérifier le type de fichier
        const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        if (!allowedTypes.includes(image.extname || '')) {
          session.flash('error', 'Seules les images JPG, PNG, GIF et WebP sont autorisées')
          return response.redirect().back()
        }

        // Vérifier la taille (max 5MB)
        if (image.size > 5 * 1024 * 1024) {
          session.flash('error', "L'image est trop volumineuse (maximum 5MB)")
          return response.redirect().back()
        }

        // Générer un nom simple pour le fichier (comme les images de test)
        const timestamp = Date.now()
        imageFileName = `user_${user.id}_${timestamp}.${image.extname}`

        // Déplacer le fichier vers le dossier public/uploads
        await image.move('./public/uploads', {
          name: imageFileName,
        })

        console.log(`✅ Image uploadée: ${imageFileName}`)
      }

      // Créer le tweet
      const tweet = await Tweet.create({
        userId: user.id,
        content: content.trim(),
        imageUrl: imageFileName,
        likesCount: 0,
        retweetsCount: 0,
        repliesCount: 0,
      })

      // Extraire et gérer les hashtags
      const hashtagNames = HashtagService.extractHashtags(content)

      if (hashtagNames.length > 0) {
        const hashtagIds = []

        for (const hashtagName of hashtagNames) {
          const slug = HashtagService.createSlug(hashtagName)

          // Créer ou récupérer le hashtag
          let hashtag = await Hashtag.query().where('slug', slug).first()

          if (!hashtag) {
            hashtag = await Hashtag.create({
              name: hashtagName,
              slug: slug,
              tweetCount: 1,
            })
          } else {
            // Incrémenter le compteur de tweets pour ce hashtag
            await hashtag.merge({ tweetCount: hashtag.tweetCount + 1 }).save()
          }

          hashtagIds.push(hashtag.id)
        }

        // Associer les hashtags au tweet
        await tweet.related('hashtags').attach(hashtagIds)
      }

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
  async getUserTweets({ params }: HttpContext) {
    try {
      const userId = params.userId

      const tweets = await Tweet.query()
        .where('user_id', userId)
        .preload('user')
        .preload('hashtags')
        .orderBy('created_at', 'desc')
        .limit(20)

      return tweets
    } catch (error) {
      console.error('Erreur lors de la récupération des tweets:', error)
      return []
    }
  }

  /**
   * Récupérer les tweets des utilisateurs suivis pour le feed
   */
  async getFeed({ auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      // Récupérer les IDs des utilisateurs suivis
      const db = await import('@adonisjs/lucid/services/db')
      const followedUserIds = await db.default
        .from('follows')
        .select('followed_id')
        .where('follower_id', user.id)

      const followedIds = followedUserIds.map((follow: any) => follow.followed_id)

      // Inclure aussi les propres tweets de l'utilisateur
      followedIds.push(user.id)

      // Récupérer les tweets des utilisateurs suivis + ses propres tweets
      const tweets = await Tweet.query()
        .whereIn('user_id', followedIds)
        .preload('user')
        .preload('hashtags')
        .orderBy('created_at', 'desc')
        .limit(50)

      return tweets
    } catch (error) {
      console.error('Erreur lors de la récupération du feed:', error)
      return []
    }
  }

  /**
   * Supprimer un tweet (seulement le propriétaire peut supprimer)
   */
  async delete({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tweetId = params.id

      const tweet = await Tweet.findOrFail(tweetId)

      // Vérifier que l'utilisateur est le propriétaire du tweet
      if (tweet.userId !== user.id) {
        return response.status(403).json({
          error: 'Vous ne pouvez supprimer que vos propres tweets',
        })
      }

      await tweet.delete()

      // Décrémenter le compteur de tweets de l'utilisateur
      user.tweetsCount = Math.max(0, user.tweetsCount - 1)
      await user.save()

      return response.json({
        success: true,
        message: 'Tweet supprimé avec succès',
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du tweet:', error)
      return response.status(500).json({
        error: 'Erreur lors de la suppression du tweet',
      })
    }
  }
}
