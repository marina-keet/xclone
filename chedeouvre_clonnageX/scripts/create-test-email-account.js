import nodemailer from 'nodemailer'

async function createTestAccount() {
  try {
    console.log('🔧 Génération d\'un compte de test Ethereal Email...')
    
    // Créer un compte de test Ethereal
    const testAccount = await nodemailer.createTestAccount()
    
    console.log('\n📧 Compte de test Ethereal généré:')
    console.log('='.repeat(50))
    console.log(`Email: ${testAccount.user}`)
    console.log(`Mot de passe: ${testAccount.pass}`)
    console.log(`SMTP Host: ${testAccount.smtp.host}`)
    console.log(`SMTP Port: ${testAccount.smtp.port}`)
    console.log('='.repeat(50))
    
    console.log('\n📝 Ajoutez ces variables à votre fichier .env:')
    console.log('='.repeat(50))
    console.log(`ETHEREAL_USERNAME=${testAccount.user}`)
    console.log(`ETHEREAL_PASSWORD=${testAccount.pass}`)
    console.log('='.repeat(50))
    
    console.log('\n🌐 Interface web Ethereal:')
    console.log('URL: https://ethereal.email/')
    console.log(`Login: ${testAccount.user}`)
    console.log(`Pass: ${testAccount.pass}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte:', error)
  }
}

createTestAccount()