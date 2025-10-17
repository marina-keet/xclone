import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    // Clear existing users
    await User.query().delete()

    // Create test users
    const users = [
      {
        email: 'test@example.com',
        username: 'testuser',
        password: await hash.make('password123'),
        fullName: 'Test User',
        bio: 'Utilisateur de test',
        location: 'Paris, France',
        website: 'https://example.com',
        verified: false,
        followersCount: 0,
        followingCount: 0,
        tweetsCount: 0,
      },
      {
        email: 'admin@example.com',
        username: 'admin',
        password: await hash.make('admin123'),
        fullName: 'Administrateur',
        bio: 'Compte administrateur',
        location: 'France',
        website: 'https://admin.example.com',
        verified: true,
        followersCount: 100,
        followingCount: 50,
        tweetsCount: 25,
      },
      {
        email: 'demo@example.com',
        username: 'demo',
        password: await hash.make('demo123'),
        fullName: 'Démo User',
        bio: 'Compte de démonstration pour le clone X',
        location: 'bascongo, RDC',
        website: null,
        verified: false,
        followersCount: 15,
        followingCount: 30,
        tweetsCount: 8,
      },
      {
        email: 'marina@test.com',
        username: 'mkeet',
        password: await hash.make('123456'),
        fullName: 'Marina Keet',
        bio: 'Développeuse passionnée',
        location: 'Paris, France',
        website: 'https://marina-keet.com',
        verified: true,
        followersCount: 250,
        followingCount: 180,
        tweetsCount: 45,
      },
    ]

    for (const userData of users) {
      await User.create(userData)
    }

    console.log('✅ Utilisateurs  créés avec succès!')
    console.log('🔑 Comptes disponibles:')
    console.log('  - test@example.com / password123')
    console.log('  - admin@example.com / admin123')
    console.log('  - demo@example.com / demo123')
  }
}
