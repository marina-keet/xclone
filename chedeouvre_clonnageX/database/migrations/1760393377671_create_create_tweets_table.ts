import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tweets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable()
      table.text('content').notNullable()
      table.string('image').nullable()
      table.integer('replies_count').defaultTo(0)
      table.integer('retweets_count').defaultTo(0)
      table.integer('likes_count').defaultTo(0)
      table.integer('parent_tweet_id').unsigned().nullable() // Pour les réponses
      table.boolean('is_retweet').defaultTo(false)
      table.integer('original_tweet_id').unsigned().nullable() // Pour les retweets

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('parent_tweet_id').references('id').inTable('tweets').onDelete('CASCADE')
      table.foreign('original_tweet_id').references('id').inTable('tweets').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
