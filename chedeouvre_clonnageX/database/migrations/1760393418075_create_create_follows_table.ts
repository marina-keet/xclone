import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'follows'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('follower_id').unsigned().notNullable() // Celui qui suit
      table.integer('following_id').unsigned().notNullable() // Celui qui est suivi
      table.boolean('accepted').defaultTo(true) // Pour les comptes privés

      table.foreign('follower_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('following_id').references('id').inTable('users').onDelete('CASCADE')

      // Un utilisateur ne peut suivre qu'une fois le même utilisateur
      table.unique(['follower_id', 'following_id'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
