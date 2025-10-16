import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Like from './like.js'
import Retweet from './retweet.js'

export default class Tweet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare content: string

  @column({ columnName: 'image' })
  declare imageUrl: string | null

  @column()
  declare likesCount: number

  @column()
  declare retweetsCount: number

  @column()
  declare repliesCount: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @hasMany(() => Retweet)
  declare retweets: HasMany<typeof Retweet>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
