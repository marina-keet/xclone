import GrokService from '#services/grok_service'

console.log('🤖 Test du service Grok...')

const grokService = new GrokService()

// Test 1: Génération de contenu
grokService.generateTweetContent('intelligence artificielle', 'casual', 280)
  .then(result => {
    console.log('✅ Génération de contenu:', result.success ? 'SUCCÈS' : 'ÉCHEC')
    if (result.success) {
      console.log('   Suggestions:', result.data?.length || 0)
    } else {
      console.log('   Erreur:', result.error)
    }
  })
  .catch(err => {
    console.log('❌ Erreur génération:', err.message)
  })

// Test 2: Suggestions de hashtags
grokService.suggestHashtags('Je code avec JavaScript et React', 5)
  .then(result => {
    console.log('✅ Suggestions hashtags:', result.success ? 'SUCCÈS' : 'ÉCHEC')
    if (result.success) {
      console.log('   Hashtags:', result.data?.length || 0)
    } else {
      console.log('   Erreur:', result.error)
    }
  })
  .catch(err => {
    console.log('❌ Erreur hashtags:', err.message)
  })

console.log('🤖 Tests lancés...')