import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Tweet from './tweet.js'
import Like from './like.js'
import Retweet from './retweet.js'
import Block from './block.js'
import Follow from './follow.js'
import FollowRequest from './follow_request.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare avatar: string | null

  @column()
  declare bio: string | null

  @column()
  declare location: string | null

  @column()
  declare website: string | null

  @column.date()
  declare birthDate: DateTime | null

  @column()
  declare verified: boolean

  @column()
  declare privateAccount: boolean

  @column()
  declare followersCount: number

  @column()
  declare followingCount: number

  @column()
  declare tweetsCount: number

  @hasMany(() => Tweet)
  declare tweets: HasMany<typeof Tweet>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @hasMany(() => Retweet)
  declare retweets: HasMany<typeof Retweet>

  // Relations de blocage
  @hasMany(() => Block, {
    foreignKey: 'blockerId',
  })
  declare blockedUsers: HasMany<typeof Block>

  @hasMany(() => Block, {
    foreignKey: 'blockedId',
  })
  declare blockers: HasMany<typeof Block>

  // Relations pour les demandes d'abonnement
  @hasMany(() => FollowRequest, {
    foreignKey: 'requesterId',
  })
  declare sentFollowRequests: HasMany<typeof FollowRequest>

  @hasMany(() => FollowRequest, {
    foreignKey: 'requestedId',
  })
  declare receivedFollowRequests: HasMany<typeof FollowRequest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /**
   * Obtenir les IDs des utilisateurs bloqués par cet utilisateur
   */
  async getBlockedUserIds(): Promise<number[]> {
    const blocks = await Block.query().where('blocker_id', this.id).select('blocked_id')

    return blocks.map((block) => block.blockedId)
  }

  /**
   * Obtenir les IDs des utilisateurs qui ont bloqué cet utilisateur
   */
  async getBlockingUserIds(): Promise<number[]> {
    const blocks = await Block.query().where('blocked_id', this.id).select('blocker_id')

    return blocks.map((block) => block.blockerId)
  }

  /**
   * Vérifier si l'email est vérifié (simplifié - toujours true pour ce projet)
   */
  isEmailVerified(): boolean {
    return true // Pour ce projet, on considère tous les emails comme vérifiés
  }

  /**
   * Vérifier si un utilisateur peut voir le contenu de ce profil
   * @param viewerId - ID de l'utilisateur qui veut voir le contenu
   * @returns true si le contenu est visible, false sinon
   */
  async canViewContent(viewerId?: number): Promise<boolean> {
    // Si le compte n'est pas privé, tout le monde peut voir
    if (!this.privateAccount) {
      return true
    }

    // Le propriétaire du compte peut toujours voir son propre contenu
    if (viewerId === this.id) {
      return true
    }

    // Si pas d'utilisateur connecté et compte privé, interdire
    if (!viewerId) {
      return false
    }

    // Vérifier si l'utilisateur suit ce compte
    const existingFollow = await Follow.query()
      .where('follower_id', viewerId)
      .where('following_id', this.id)
      .first()

    return !!existingFollow
  }
}
