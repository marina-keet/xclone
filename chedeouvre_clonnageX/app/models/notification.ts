import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number // Utilisateur qui reçoit la notification

  @column({ columnName: 'from_user_id' })
  declare fromUserId: number // Utilisateur qui déclenche la notification

  @column()
  declare type: string // 'follow', 'like', 'retweet', 'mention', etc.

  @column({ columnName: 'tweet_id' })
  declare tweetId: number | null // Tweet concerné (si applicable)

  @column()
  declare message: string

  @column({ columnName: 'read' })
  declare isRead: boolean

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'fromUserId' })
  declare fromUser: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
