import User from '#models/user'

async function deleteUsers() {
  try {
    console.log('🗑️  Début de la suppression des utilisateurs...')
    
    // Liste des emails à supprimer
    const emailsToDelete = [
      'marinakeet34@gmail.com',
      'marinakeet08@gmail.com'
    ]
    
    for (const email of emailsToDelete) {
      console.log(`\n🔍 Recherche de l'utilisateur avec l'email: ${email}`)
      
      // Chercher l'utilisateur
      const user = await User.query().where('email', email).first()
      
      if (user) {
        console.log(`👤 Utilisateur trouvé:`)
        console.log(`   - ID: ${user.id}`)
        console.log(`   - Username: ${user.username}`)
        console.log(`   - Nom complet: ${user.fullName}`)
        console.log(`   - Email: ${user.email}`)
        console.log(`   - Créé le: ${user.createdAt}`)
        
        // Supprimer l'utilisateur
        await user.delete()
        
        console.log(`✅ Utilisateur supprimé avec succès: ${email}`)
      } else {
        console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`)
      }
    }
    
    console.log('\n✨ Suppression terminée !')
    
    // Afficher le nombre d'utilisateurs restants
    const remainingUsers = await User.query().count('* as total')
    console.log(`📊 Nombre d'utilisateurs restants dans la base: ${remainingUsers[0].total}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
  }
}

// Exécuter la suppression
deleteUsers()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error)
    process.exit(1)
  })