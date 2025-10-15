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
        content: 'Mon premier tweet avec emoji ! 🎉✨ #test',
        image: null,
        likesCount: 5,
        retweetsCount: 2,
        repliesCount: 1,
      },
      {
        userId: user.id,
        content:
          "Un autre tweet avec du contenu plus long pour tester l'affichage. #exemple #photo",
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
        likesCount: 12,
        retweetsCount: 3,
        repliesCount: 7,
      },
      {
        userId: user.id,
        content: 'Tweet court 🚀',
        image: null,
        likesCount: 8,
        retweetsCount: 1,
        repliesCount: 0,
      },
    ])

    // Mettre à jour le compteur de tweets de l'utilisateur
    await user.merge({ tweetsCount: (user.tweetsCount || 0) + 3 }).save()

    console.log('✅ Tweets de test créés avec succès!')
    console.log(`   - Utilisateur: ${user.username} (${user.fullName})`)
    console.log(`   - Tweets créés: 3`)
    console.log('   - Un tweet contient une image test')
  }
}
