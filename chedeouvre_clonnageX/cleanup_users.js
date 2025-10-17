const { Database } = require('@adonisjs/lucid/database')

async function cleanupUsers() {
  try {
    // D'abord, lister tous les utilisateurs
    console.log('📋 Liste des utilisateurs actuels:')
    const users = await Database.from('users').select('id', 'email', 'username', 'full_name')
    
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Nom: ${user.full_name}`)
    })

    // Utilisateurs à supprimer (basé sur les noms ou emails de test)
    const testUserPatterns = [
      'demo',
      'test',
      'administrator',
      'admin',
      'Demo User',
      'Test User',
      'Administrator'
    ]

    console.log('\n🗑️ Recherche des utilisateurs de test à supprimer...')
    
    for (const user of users) {
      const shouldDelete = testUserPatterns.some(pattern => 
        user.username?.toLowerCase().includes(pattern.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(pattern.toLowerCase()) ||
        user.email?.toLowerCase().includes(pattern.toLowerCase())
      )

      if (shouldDelete) {
        console.log(`❌ Suppression de l'utilisateur: ${user.email} (${user.full_name})`)
        
        // Supprimer les données liées en premier (pour éviter les erreurs de clés étrangères)
        await Database.from('notifications').where('user_id', user.id).delete()
        await Database.from('notifications').where('from_user_id', user.id).delete()
        await Database.from('follows').where('follower_id', user.id).delete()
        await Database.from('follows').where('followed_id', user.id).delete()
        await Database.from('likes').where('user_id', user.id).delete()
        await Database.from('retweets').where('user_id', user.id).delete()
        await Database.from('replies').where('user_id', user.id).delete()
        await Database.from('tweets').where('user_id', user.id).delete()
        
        // Enfin supprimer l'utilisateur
        await Database.from('users').where('id', user.id).delete()
        console.log(`✅ Utilisateur ${user.email} supprimé avec succès`)
      }
    }

    console.log('\n📋 Liste des utilisateurs restants:')
    const remainingUsers = await Database.from('users').select('id', 'email', 'username', 'full_name')
    
    remainingUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Nom: ${user.full_name}`)
    })

    console.log('\n✅ Nettoyage terminé!')

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

cleanupUsers()