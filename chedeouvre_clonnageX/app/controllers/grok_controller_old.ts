import { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import GrokService from '#services/grok_service'
import grokConfig from '#config/grok'

export default class GrokController {
  private grokService = new GrokService()

  /**
   * Génère du contenu de tweet avec Grok AI
   */
  async generateContent({ request, response, auth }: HttpContext) {
    try {
      // Vérifier que l'utilisateur est connecté
      await auth.check()
      const user = auth.user!

      // Vérifier que la fonctionnalité est activée
      if (!grokConfig.features.contentGeneration) {
        return response.badRequest({
          success: false,
          error: 'Génération de contenu désactivée'
        })
      }

      const { prompt, tone = 'casual', maxLength = 280 } = request.only(['prompt', 'tone', 'maxLength'])

      if (!prompt || prompt.trim().length === 0) {
        return response.badRequest({
          success: false,
          error: 'Le prompt est requis'
        })
      }

      console.log(`🤖 Génération de contenu Grok pour ${user.username}: "${prompt}" (tone: ${tone})`)

      const result = await this.grokService.generateTweetContent(prompt, tone, maxLength)

      if (result.success) {
        console.log(`✅ Contenu généré avec succès: ${result.data.length} suggestions`)
        return response.ok(result)
      } else {
        console.log(`❌ Échec génération: ${result.error}`)
        return response.internalServerError(result)
      }

    } catch (error) {
      console.error('Erreur génération contenu Grok:', error)
      return response.internalServerError({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }

  /**
   * Suggère des hashtags pour un contenu donné
   */
  async suggestHashtags({ request, response, auth }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      if (!grokConfig.features.hashtagSuggestions) {
        return response.badRequest({
          success: false,
          error: 'Suggestions de hashtags désactivées'
        })
      }

      const { content, maxSuggestions = 5 } = request.only(['content', 'maxSuggestions'])

      if (!content || content.trim().length === 0) {
        return response.badRequest({
          success: false,
          error: 'Le contenu est requis'
        })
      }

      console.log(`🏷️ Suggestions hashtags Grok pour ${user.username}: "${content.substring(0, 50)}..."`)

      const result = await this.grokService.suggestHashtags(content, maxSuggestions)

      if (result.success) {
        console.log(`✅ Hashtags suggérés: ${result.data.length} suggestions`)
        return response.ok(result)
      } else {
        return response.internalServerError(result)
      }

    } catch (error) {
      console.error('Erreur suggestions hashtags Grok:', error)
      return response.internalServerError({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }

  /**
   * Analyse un tweet avec Grok AI
   */
  async analyzeTweet({ request, response, auth }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      if (!grokConfig.features.tweetAnalysis) {
        return response.badRequest({
          success: false,
          error: 'Analyse de tweets désactivée'
        })
      }

      const { content, tweetId } = request.only(['content', 'tweetId'])

      let tweetContent = content

      // Si un ID de tweet est fourni, récupérer le contenu du tweet
      if (tweetId && !content) {
        const tweet = await Tweet.find(tweetId)
        if (!tweet) {
          return response.notFound({
            success: false,
            error: 'Tweet non trouvé'
          })
        }
        tweetContent = tweet.content
      }

      if (!tweetContent || tweetContent.trim().length === 0) {
        return response.badRequest({
          success: false,
          error: 'Le contenu du tweet est requis'
        })
      }

      console.log(`📊 Analyse tweet Grok pour ${user.username}: "${tweetContent.substring(0, 50)}..."`)

      const result = await this.grokService.analyzeTweet(tweetContent, { user })

      if (result.success) {
        console.log(`✅ Analyse terminée: sentiment ${result.data.sentiment}, score ${result.data.engagement_score}`)
        return response.ok(result)
      } else {
        return response.internalServerError(result)
      }

    } catch (error) {
      console.error('Erreur analyse tweet Grok:', error)
      return response.internalServerError({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }

  /**
   * Analyse globale des tweets de l'utilisateur
   */
  async analyzeUserTweets({ response, auth }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      if (!grokConfig.features.userAnalysis) {
        return response.badRequest({
          success: false,
          error: 'Analyse utilisateur désactivée'
        })
      }

      console.log(`📈 Analyse globale Grok pour ${user.username}`)

      // Récupérer les tweets de l'utilisateur
      const tweets = await Tweet.query()
        .where('user_id', user.id)
        .orderBy('created_at', 'desc')
        .limit(50) // Analyser les 50 derniers tweets
        .select(['id', 'content', 'created_at', 'likes_count', 'retweets_count'])

      if (tweets.length === 0) {
        return response.ok({
          success: true,
          data: {
            message: 'Aucun tweet à analyser',
            recommendations: ['Commencez à tweeter pour obtenir des analyses !']
          }
        })
      }

      const result = await this.grokService.analyzeUserTweets(tweets)

      if (result.success) {
        console.log(`✅ Analyse utilisateur terminée: ${tweets.length} tweets analysés`)
        return response.ok(result)
      } else {
        return response.internalServerError(result)
      }

    } catch (error) {
      console.error('Erreur analyse utilisateur Grok:', error)
      return response.internalServerError({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }

  /**
   * Optimise un tweet existant avec des suggestions d'amélioration
   */
  async optimizeTweet({ request, response, auth }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      const { content } = request.only(['content'])

      if (!content || content.trim().length === 0) {
        return response.badRequest({
          success: false,
          error: 'Le contenu est requis'
        })
      }

      console.log(`🚀 Optimisation tweet Grok pour ${user.username}`)

      // Analyser d'abord le tweet
      const analysis = await this.grokService.analyzeTweet(content, { user })
      
      if (!analysis.success) {
        return response.internalServerError(analysis)
      }

      // Générer du contenu amélioré basé sur l'analyse
      const improvements = await this.grokService.generateTweetContent(
        `Améliore ce tweet: "${content}"`,
        'professional',
        280
      )

      // Suggérer des hashtags
      const hashtags = await this.grokService.suggestHashtags(content, 5)

      const result = {
        success: true,
        data: {
          original: content,
          analysis: analysis.data,
          improved_suggestions: improvements.success ? improvements.data : [],
          hashtag_suggestions: hashtags.success ? hashtags.data : [],
          optimization_tips: [
            'Ajoutez des questions pour encourager l\'engagement',
            'Utilisez des emojis pour plus de visibilité',
            'Incluez des hashtags pertinents',
            'Postez aux heures de forte audience'
          ]
        }
      }

      console.log(`✅ Optimisation terminée avec ${result.data.improved_suggestions.length} suggestions`)
      return response.ok(result)

    } catch (error) {
      console.error('Erreur optimisation tweet Grok:', error)
      return response.internalServerError({
        success: false,
        error: 'Erreur interne du serveur'
      })
    }
  }

  /**
   * Endpoint pour tester la connexion Grok
   */
  async testConnection({ response, auth }: HttpContext) {
    try {
      await auth.check()
      
      const testResult = {
        success: true,
        data: {
          status: 'Grok AI service opérationnel',
          features: grokConfig.features,
          config: {
            maxContentSuggestions: grokConfig.maxContentSuggestions,
            maxHashtagSuggestions: grokConfig.maxHashtagSuggestions,
            maxTweetLength: grokConfig.maxTweetLength
          },
          timestamp: new Date().toISOString()
        }
      }

      console.log('✅ Test connexion Grok réussi')
      return response.ok(testResult)

    } catch (error) {
      console.error('Erreur test connexion Grok:', error)
      return response.internalServerError({
        success: false,
        error: 'Service Grok non disponible'
      })
    }
  }
}