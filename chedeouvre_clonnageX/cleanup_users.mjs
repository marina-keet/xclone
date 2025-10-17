import User from '#models/user'

console.log('📋 Utilisateurs dans la base de données:')

try {
  const users = await User.all()
  
  users.forEach(user => {
    console.log(`- ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Nom: ${user.fullName}`)
  })

  console.log('\n🗑️ Recherche des utilisateurs de test à supprimer...')
  
  const testPatterns = ['demo', 'test', 'administrator', 'admin']
  
  for (const user of users) {
    const shouldDelete = testPatterns.some(pattern => 
      user.username?.toLowerCase().includes(pattern.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(pattern.toLowerCase()) ||
      user.email?.toLowerCase().includes(pattern.toLowerCase())
    )

    if (shouldDelete) {
      console.log(`❌ Suppression de l'utilisateur: ${user.email} (${user.fullName})`)
      
      // Supprimer les données liées d'abord
      await user.related('notifications').query().delete()
      await user.related('sentNotifications').query().delete()
      await user.related('followers').query().delete()
      await user.related('following').query().delete()
      await user.related('likes').query().delete()
      await user.related('retweets').query().delete()
      await user.related('tweets').query().delete()
      
      // Supprimer l'utilisateur
      await user.delete()
      console.log(`✅ Utilisateur ${user.email} supprimé`)
    }
  }

  console.log('\n📋 Utilisateurs restants:')
  const remainingUsers = await User.all()
  remainingUsers.forEach(user => {
    console.log(`- ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Nom: ${user.fullName}`)
  })

} catch (error) {
  console.error('❌ Erreur:', error)
}

console.log('✅ Nettoyage terminé!')