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
}
