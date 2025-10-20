import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class FollowRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'requester_id' })
  declare requesterId: number // Utilisateur qui fait la demande

  @column({ columnName: 'requested_id' })
  declare requestedId: number // Utilisateur à qui on demande de suivre

  @column()
  declare status: 'pending' | 'accepted' | 'rejected' // Statut de la demande

  @belongsTo(() => User, { foreignKey: 'requesterId' })
  declare requester: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'requestedId' })
  declare requested: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
