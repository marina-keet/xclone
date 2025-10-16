import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Follow from '#models/follow'
import Notification from '#models/notification'

export default class FollowsController {
  /**
   * Suivre ou ne plus suivre un utilisateur
   */
  async toggle({ params, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()
      const targetUserId = params.id

      // Vérifier que l'utilisateur cible existe
      const targetUser = await User.findOrFail(targetUserId)

      // Ne pas se suivre soi-même
      if (currentUser.id === targetUser.id) {
        return response.status(400).json({ error: 'Vous ne pouvez pas vous suivre vous-même' })
      }

      // Vérifier si on suit déjà cet utilisateur
      const existingFollow = await Follow.query()
        .where('follower_id', currentUser.id)
        .where('following_id', targetUserId)
        .first()

      if (existingFollow) {
        // Unfollow
        await existingFollow.delete()

        // Mettre à jour les compteurs
        currentUser.followingCount = Math.max(0, currentUser.followingCount - 1)
        targetUser.followersCount = Math.max(0, targetUser.followersCount - 1)
        await currentUser.save()
        await targetUser.save()

        return response.json({
          status: 'unfollowed',
          message: `Vous ne suivez plus @${targetUser.username}`,
        })
      } else {
        // Follow
        await Follow.create({
          followerId: currentUser.id,
          followingId: targetUserId,
        })

        // Mettre à jour les compteurs
        currentUser.followingCount = currentUser.followingCount + 1
        targetUser.followersCount = targetUser.followersCount + 1
        await currentUser.save()
        await targetUser.save()

        // Créer une notification pour l'utilisateur suivi
        await Notification.create({
          userId: targetUserId,
          fromUserId: currentUser.id,
          type: 'follow',
          message: `@${currentUser.username} s'est abonné à vous`,
          isRead: false,
        })

        console.log(`✅ ${currentUser.username} suit maintenant ${targetUser.username}`)
        console.log(`📧 Notification envoyée à ${targetUser.username}`)

        return response.json({
          status: 'followed',
          message: `Vous suivez maintenant @${targetUser.username}`,
        })
      }
    } catch (error) {
      console.error('Erreur lors du suivi:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  async getNotifications({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const notifications = await Notification.query()
        .where('user_id', user.id)
        .preload('fromUser')
        .orderBy('created_at', 'desc')
        .limit(20)

      return response.json({ notifications })
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Marquer les notifications comme lues
   */
  async markAsRead({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const notificationId = params.id

      const notification = await Notification.query()
        .where('id', notificationId)
        .where('user_id', user.id)
        .firstOrFail()

      notification.isRead = true
      await notification.save()

      return response.json({ success: true })
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }
}
