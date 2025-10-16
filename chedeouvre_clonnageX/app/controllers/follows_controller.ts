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
        console.log(`👤 Tentative de suivi: ${currentUser.username} -> ${targetUser.username}`)

        const newFollow = await Follow.create({
          followerId: currentUser.id,
          followingId: targetUserId,
          accepted: true,
        })
        console.log(`✅ Follow créé:`, newFollow.toJSON())

        // Mettre à jour les compteurs
        currentUser.followingCount = currentUser.followingCount + 1
        targetUser.followersCount = targetUser.followersCount + 1
        await currentUser.save()
        await targetUser.save()
        console.log(
          `📊 Compteurs mis à jour: ${currentUser.username} suit ${currentUser.followingCount}, ${targetUser.username} a ${targetUser.followersCount} followers`
        )

        // Créer une notification pour l'utilisateur suivi
        console.log(`🔔 Création de notification pour ${targetUser.username}`)
        const notification = await Notification.create({
          userId: targetUserId,
          fromUserId: currentUser.id,
          type: 'follow',
          tweetId: null,
          message: `@${currentUser.username} s'est abonné à vous`,
          isRead: false,
        })
        console.log(`✅ Notification créée:`, notification.toJSON())

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

      // Formater les notifications pour s'assurer que fromUser est inclus
      const formattedNotifications = notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toFormat('dd/MM/yyyy HH:mm'),
        fromUser: notification.fromUser
          ? {
              id: notification.fromUser.id,
              username: notification.fromUser.username,
              fullName: notification.fromUser.fullName,
            }
          : null,
      }))

      console.log(
        `📧 Notifications récupérées pour ${user.username}:`,
        formattedNotifications.length
      )
      if (formattedNotifications.length > 0) {
        console.log(`   - Première notification: ${formattedNotifications[0].message}`)
        console.log(`   - De: ${formattedNotifications[0].fromUser?.username || 'Unknown'}`)
      }

      return response.json({ notifications: formattedNotifications })
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

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()

      await Notification.query()
        .where('user_id', user.id)
        .where('read', false)
        .update({ read: true })

      return response.json({
        success: true,
        message: 'Toutes les notifications marquées comme lues',
      })
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }
}
