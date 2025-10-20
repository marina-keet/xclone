const grokConfig = {
  /**
   * API Key pour Grok AI
   * Obtenir depuis https://api.x.ai
   */
  apiKey: process.env.GROK_API_KEY || 'demo-key',

  /**
   * URL de base de l'API Grok
   */
  baseUrl: process.env.GROK_API_URL || 'https://api.x.ai/v1',

  /**
   * Timeout pour les requêtes API (en millisecondes)
   */
  timeout: Number.parseInt(process.env.GROK_TIMEOUT || '30000'),

  /**
   * Nombre maximum de suggestions de contenu
   */
  maxContentSuggestions: Number.parseInt(process.env.GROK_MAX_CONTENT_SUGGESTIONS || '3'),

  /**
   * Nombre maximum de suggestions de hashtags
   */
  maxHashtagSuggestions: Number.parseInt(process.env.GROK_MAX_HASHTAG_SUGGESTIONS || '5'),

  /**
   * Longueur maximum des tweets générés
   */
  maxTweetLength: Number.parseInt(process.env.GROK_MAX_TWEET_LENGTH || '280'),

  /**
   * Paramètres par défaut pour la génération de contenu
   */
  defaultTone: process.env.GROK_DEFAULT_TONE || 'casual',

  /**
   * Activation/désactivation des fonctionnalités Grok
   */
  features: {
    contentGeneration: process.env.GROK_FEATURE_CONTENT_GENERATION !== 'false',
    hashtagSuggestions: process.env.GROK_FEATURE_HASHTAG_SUGGESTIONS !== 'false',
    tweetAnalysis: process.env.GROK_FEATURE_TWEET_ANALYSIS !== 'false',
    userAnalysis: process.env.GROK_FEATURE_USER_ANALYSIS !== 'false',
  },

  /**
   * Paramètres de cache pour les réponses Grok
   */
  cache: {
    enabled: process.env.GROK_CACHE_ENABLED !== 'false',
    ttl: Number.parseInt(process.env.GROK_CACHE_TTL || '3600'), // 1 heure en secondes
  },

  /**
   * Paramètres de rate limiting
   */
  rateLimit: {
    requestsPerMinute: Number.parseInt(process.env.GROK_RATE_LIMIT_PER_MINUTE || '60'),
    requestsPerHour: Number.parseInt(process.env.GROK_RATE_LIMIT_PER_HOUR || '1000'),
  },
}

export default grokConfig
