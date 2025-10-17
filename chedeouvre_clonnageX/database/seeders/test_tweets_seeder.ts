import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Tweet from '#models/tweet'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Trouver un utilisateur existant
    const user = await User.firstOrFail()

    // S'assurer que l'utilisateur a un fullName
    if (!user.fullName) {
      await user.merge({ fullName: 'Lydie Martinez' }).save()
      console.log("✅ Nom complet ajouté à l'utilisateur")
    }

    // Supprimer les anciens tweets de cet utilisateur
    await Tweet.query().where('userId', user.id).delete()

    // Créer quelques tweets de test
    await Tweet.createMany([
      {
        userId: user.id,
        content: 'hi',
        imageUrl: null,
        likesCount: 5,
        retweetsCount: 2,
        repliesCount: 1,
      },
      {
        userId: user.id,
        content: 'nature et photographie 📷🌿 re',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300',
        likesCount: 12,
        retweetsCount: 3,
        repliesCount: 7,
      },
      {
        userId: user.id,
        content: 'jou jou',
        imageUrl: 'test1.jpg',
        likesCount: 8,
        retweetsCount: 1,
        repliesCount: 0,
      },
      {
        userId: user.id,
        content: 'Magnifique photo',
        imageUrl: 'test2.jpg',
        likesCount: 25,
        retweetsCount: 8,
        repliesCount: 3,
      },
    ])

    // Mettre à jour le compteur de tweets de l'utilisateur
    await user.merge({ tweetsCount: (user.tweetsCount || 0) + 4 }).save()

    console.log('✅ Tweets  créés avec succès!')
    console.log(`   - Utilisateur: ${user.username} (${user.fullName})`)
    console.log(`   - Tweets créés: 4`)
    console.log('   - Deux tweets contiennent des images test')
  }
}
