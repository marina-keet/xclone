import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('username', 50).notNullable().unique()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('avatar').nullable()
      table.text('bio').nullable()
      table.string('location').nullable()
      table.string('website').nullable()
      table.date('birth_date').nullable()
      table.boolean('verified').defaultTo(false)
      table.boolean('private_account').defaultTo(false)
      table.integer('followers_count').defaultTo(0)
      table.integer('following_count').defaultTo(0)
      table.integer('tweets_count').defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
