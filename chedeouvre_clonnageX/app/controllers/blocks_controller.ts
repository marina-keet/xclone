import type { HttpContext } from '@adonisjs/core/http'
import Block from '#models/block'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export default class BlocksController {
  /**
   * Bloquer ou débloquer un utilisateur
   */
  async toggle({ params, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()
      const targetUserId = params.id

      // Vérifier que l'utilisateur existe
      const targetUser = await User.findOrFail(targetUserId)

      // Empêcher de se bloquer soi-même
      if (currentUser.id === targetUser.id) {
        return response.badRequest({ error: 'Vous ne pouvez pas vous bloquer vous-même' })
      }

      // Vérifier si le blocage existe déjà
      const existingBlock = await Block.query()
        .where('blocker_id', currentUser.id)
        .where('blocked_id', targetUser.id)
        .first()

      if (existingBlock) {
        // Débloquer
        await existingBlock.delete()

        return response.json({
          status: 'unblocked',
          message: `Vous avez débloqué @${targetUser.username}`,
        })
      } else {
        // Bloquer
        await Block.create({
          blockerId: currentUser.id,
          blockedId: targetUser.id,
        })

        // Supprimer les relations de suivi mutuelles si elles existent
        await this.removeFollowRelations(currentUser.id, targetUser.id)

        return response.json({
          status: 'blocked',
          message: `Vous avez bloqué @${targetUser.username}`,
        })
      }
    } catch (error) {
      console.error('Erreur lors du blocage:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }

  /**
   * Obtenir la liste des utilisateurs bloqués
   */
  async index({ auth, view }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()

      const blocks = await Block.query()
        .where('blocker_id', currentUser.id)
        .preload('blocked')
        .orderBy('created_at', 'desc')

      return view.render('pages/blocked_users', {
        blocks: blocks.map((block) => ({
          ...block.toJSON(),
          blocked: block.blocked.toJSON(),
        })),
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des blocages:', error)
      throw error
    }
  }

  /**
   * Supprimer les relations de suivi entre deux utilisateurs
   */
  private async removeFollowRelations(userId1: number, userId2: number) {
    // Supprimer les follows dans les deux sens
    await db
      .from('follows')
      .where((builder) => {
        builder.where('follower_id', userId1).where('following_id', userId2)
      })
      .orWhere((builder) => {
        builder.where('follower_id', userId2).where('following_id', userId1)
      })
      .delete()
  }

  /**
   * Vérifier si un utilisateur est bloqué
   */
  async isBlocked({ params, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()
      const targetUserId = params.id

      const isBlocked = await Block.query()
        .where('blocker_id', currentUser.id)
        .where('blocked_id', targetUserId)
        .first()

      const isBlockedBy = await Block.query()
        .where('blocker_id', targetUserId)
        .where('blocked_id', currentUser.id)
        .first()

      return response.json({
        isBlocked: !!isBlocked,
        isBlockedBy: !!isBlockedBy,
      })
    } catch (error) {
      console.error('Erreur lors de la vérification du blocage:', error)
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }
}
