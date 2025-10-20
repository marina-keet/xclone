import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'follow_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('requester_id').unsigned().notNullable() // Utilisateur qui fait la demande
      table.integer('requested_id').unsigned().notNullable() // Utilisateur à qui on demande
      table.enum('status', ['pending', 'accepted', 'rejected']).defaultTo('pending')

      table.foreign('requester_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('requested_id').references('id').inTable('users').onDelete('CASCADE')

      // Empêcher les doublons
      table.unique(['requester_id', 'requested_id'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
