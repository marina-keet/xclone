import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'likes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable()
      table.integer('tweet_id').unsigned().notNullable()

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('tweet_id').references('id').inTable('tweets').onDelete('CASCADE')

      // Un utilisateur ne peut liker qu'une fois le même tweet
      table.unique(['user_id', 'tweet_id'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
