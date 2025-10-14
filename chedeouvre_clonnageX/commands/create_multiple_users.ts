import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class CreateMultipleUsers extends BaseCommand {
  static commandName = 'create:multiple:users'
  static description =
    'Créer plusieurs utilisateurs pour démontrer que le système fonctionne pour tous'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  async run() {
    try {
      // Créer plusieurs utilisateurs différents
      const users = [
        {
          username: 'alice2024',
          email: 'alice@example.com',
          fullName: 'Alice Dupont',
          password: 'alice123',
          bio: 'Développeuse passionnée',
        },
        {
          username: 'bob_dev',
          email: 'bob@test.fr',
          fullName: 'Bob Martin',
          password: 'bob456',
          bio: 'Designer créatif',
        },
        {
          username: 'clara',
          email: 'clara@gmail.com',
          fullName: 'Clara Moreau',
          password: 'clara789',
          bio: 'Entrepreneure innovante',
        },
      ]

      for (const userData of users) {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findBy('email', userData.email)
        if (existingUser) {
          await existingUser.delete()
          this.logger.info(`Utilisateur existant supprimé: ${userData.email}`)
        }

        // Créer le nouvel utilisateur
        await User.create({
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          password: userData.password,
          bio: userData.bio,
          followersCount: 0,
          followingCount: 0,
          tweetsCount: 0,
        })

        this.logger.success(
          `✅ Créé: ${userData.fullName} (${userData.email}) - Password: ${userData.password}`
        )
      }

      this.logger.info('🎉 Tous les utilisateurs de test ont été créés !')
    } catch (error) {
      this.logger.error(`Erreur: ${error.message}`)
    }
  }
}
