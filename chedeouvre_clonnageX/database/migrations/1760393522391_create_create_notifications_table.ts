import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable() // Utilisateur qui reçoit la notif
      table.integer('from_user_id').unsigned().notNullable() // Utilisateur qui a fait l'action
      table.string('type').notNullable() // like, retweet, follow, comment, etc.
      table.integer('tweet_id').unsigned().nullable() // Tweet concerné (si applicable)
      table.text('message').notNullable()
      table.boolean('read').defaultTo(false)

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('from_user_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('tweet_id').references('id').inTable('tweets').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
