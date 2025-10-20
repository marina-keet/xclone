import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Champs pour la vérification d'email
      table.timestamp('email_verified_at').nullable()
      table.string('email_verification_token').nullable()

      // Champs pour la réinitialisation de mot de passe
      table.string('password_reset_token').nullable()
      table.timestamp('password_reset_expires_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_verified_at')
      table.dropColumn('email_verification_token')
      table.dropColumn('password_reset_token')
      table.dropColumn('password_reset_expires_at')
    })
  }
}
