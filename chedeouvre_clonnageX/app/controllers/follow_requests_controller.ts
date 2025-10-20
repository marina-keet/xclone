import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Follow from '#models/follow'
import FollowRequest from '#models/follow_request'
import Notification from '#models/notification'

export default class FollowRequestsController {
  /**
   * Créer une demande d'abonnement ou suivre directement selon le type de compte
   */
  async createFollowRequest({ params, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()
      const targetUserId = params.id
      const targetUser = await User.findOrFail(targetUserId)

      // Vérifier que l'utilisateur ne se suit pas lui-même
      if (currentUser.id === targetUser.id) {
        return response.status(400).json({ error: 'Vous ne pouvez pas vous suivre vous-même' })
      }

      // Vérifier s'il y a déjà une relation de suivi
      const existingFollow = await Follow.query()
        .where('follower_id', currentUser.id)
        .where('following_id', targetUser.id)
        .first()

      if (existingFollow) {
        return response.status(400).json({ error: 'Vous suivez déjà cet utilisateur' })
      }

      // Vérifier s'il y a déjà une demande en attente
      const existingRequest = await FollowRequest.query()
        .where('requester_id', currentUser.id)
        .where('requested_id', targetUser.id)
        .where('status', 'pending')
        .first()

      if (existingRequest) {
        return response.status(400).json({ error: 'Demande déjà envoyée' })
      }

      // Si le compte est privé, créer une demande
      if (targetUser.privateAccount) {
        const followRequest = await FollowRequest.create({
          requesterId: currentUser.id,
          requestedId: targetUser.id,
          status: 'pending',
        })

        // Créer une notification pour la demande
        await Notification.create({
          userId: targetUser.id,
          fromUserId: currentUser.id,
          type: 'follow_request',
          tweetId: null,
          message: `@${currentUser.username} demande à vous suivre`,
          isRead: false,
        })

        console.log(
          `📨 Demande d'abonnement envoyée: ${currentUser.username} -> ${targetUser.username}`
        )

        return response.json({
          status: 'request_sent',
          message: "Demande d'abonnement envoyée",
          request: followRequest,
        })
      } else {
        // Si le compte est public, suivre directement
        await Follow.create({
          followerId: currentUser.id,
          followingId: targetUser.id,
        })

        // Mettre à jour les compteurs
        currentUser.followingCount = currentUser.followingCount + 1
        targetUser.followersCount = targetUser.followersCount + 1
        await currentUser.save()
        await targetUser.save()

        // Créer une notification
        await Notification.create({
          userId: targetUser.id,
          fromUserId: currentUser.id,
          type: 'follow',
          tweetId: null,
          message: `@${currentUser.username} s'est abonné à vous`,
          isRead: false,
        })

        console.log(`✅ Suivi direct: ${currentUser.username} -> ${targetUser.username}`)

        return response.json({
          status: 'followed',
          message: `Vous suivez maintenant @${targetUser.username}`,
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Accepter une demande d'abonnement
   */
  async acceptRequest({ params, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()
      const requestId = params.id

      const followRequest = await FollowRequest.query()
        .where('id', requestId)
        .where('requested_id', currentUser.id)
        .where('status', 'pending')
        .preload('requester')
        .firstOrFail()

      // Créer la relation de suivi
      await Follow.create({
        followerId: followRequest.requesterId,
        followingId: currentUser.id,
      })

      // Mettre à jour les compteurs
      const requester = followRequest.requester
      requester.followingCount = requester.followingCount + 1
      currentUser.followersCount = currentUser.followersCount + 1
      await requester.save()
      await currentUser.save()

      // Marquer la demande comme acceptée
      followRequest.status = 'accepted'
      await followRequest.save()

      // Créer une notification
      await Notification.create({
        userId: followRequest.requesterId,
        fromUserId: currentUser.id,
        type: 'follow_accepted',
        tweetId: null,
        message: `@${currentUser.username} a accepté votre demande d'abonnement`,
        isRead: false,
      })

      console.log(`✅ Demande acceptée: ${requester.username} -> ${currentUser.username}`)

      return response.json({
        success: true,
        message: 'Demande acceptée',
      })
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Rejeter une demande d'abonnement
   */
  async rejectRequest({ params, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()
      const requestId = params.id

      const followRequest = await FollowRequest.query()
        .where('id', requestId)
        .where('requested_id', currentUser.id)
        .where('status', 'pending')
        .firstOrFail()

      // Marquer la demande comme rejetée
      followRequest.status = 'rejected'
      await followRequest.save()

      console.log(`❌ Demande rejetée: request ID ${requestId}`)

      return response.json({
        success: true,
        message: 'Demande rejetée',
      })
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Obtenir les demandes d'abonnement reçues
   */
  async getPendingRequests({ auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()

      const requests = await FollowRequest.query()
        .where('requested_id', currentUser.id)
        .where('status', 'pending')
        .preload('requester')
        .orderBy('created_at', 'desc')

      const formattedRequests = requests.map((request) => ({
        id: request.id,
        requester: {
          id: request.requester.id,
          username: request.requester.username,
          fullName: request.requester.fullName,
          avatar: request.requester.avatar,
        },
        createdAt: request.createdAt.toFormat('dd/MM/yyyy HH:mm'),
      }))

      return response.json({
        requests: formattedRequests,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Basculer le statut privé/public du compte
   */
  async togglePrivateAccount({ auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()

      currentUser.privateAccount = !currentUser.privateAccount
      await currentUser.save()

      console.log(
        `🔒 Compte ${currentUser.privateAccount ? 'privé' : 'public'}: ${currentUser.username}`
      )

      return response.json({
        success: true,
        isPrivate: currentUser.privateAccount,
        message: `Compte ${currentUser.privateAccount ? 'privé' : 'public'}`,
      })
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }
}
