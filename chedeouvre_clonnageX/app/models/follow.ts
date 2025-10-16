import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Follow extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'follower_id' })
  declare followerId: number

  @column({ columnName: 'following_id' })
  declare followingId: number

  @column()
  declare accepted: boolean

  @belongsTo(() => User, { foreignKey: 'followerId' })
  declare follower: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'followingId' })
  declare following: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
