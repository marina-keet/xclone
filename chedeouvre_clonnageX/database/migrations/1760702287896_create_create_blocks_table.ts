import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('blocker_id').unsigned().notNullable()
      table.integer('blocked_id').unsigned().notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Clés étrangères
      table.foreign('blocker_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('blocked_id').references('id').inTable('users').onDelete('CASCADE')

      // Index unique pour éviter les doublons
      table.unique(['blocker_id', 'blocked_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
