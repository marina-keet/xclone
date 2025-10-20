/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import Notification from '#models/notification'
const AuthController = () => import('#controllers/auth_controller')
const TweetsController = () => import('#controllers/tweets_controller')
const TweetInteractionsController = () => import('#controllers/tweet_interactions_controller')
const FollowsController = () => import('#controllers/follows_controller')
const FollowRequestsController = () => import('#controllers/follow_requests_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const RepliesController = () => import('#controllers/replies_controller')
const SearchController = () => import('#controllers/search_controller')
const BlocksController = () => import('#controllers/blocks_controller')
const HashtagsController = () => import('#controllers/hashtags_controller')
const GrokController = () => import('#controllers/grok_controller')

// Route pour servir les fichiers uploadés
router.get('/uploads/*', ({ response, request }) => {
  const filePath = request.url().replace('/uploads/', '')
  return response.download(`uploads/${filePath}`)
})

// Page d'accueil (connexion/inscription)
router.get('/', [AuthController, 'showHome'])

// Routes d'authentification
router.post('/register', [AuthController, 'register']).as('auth.register')
router.post('/login', [AuthController, 'login']).as('auth.login')
router.post('/logout', [AuthController, 'logout']).as('auth.logout')

// Routes protégées (après connexion)
router.get('/dashboard', [AuthController, 'dashboard']).as('dashboard')
router.get('/profile', [AuthController, 'profile']).as('profile')
router
  .get('/privacy-settings', async ({ view, auth }) => {
    const user = await auth.authenticate()
    return view.render('pages/privacy-settings', { user })
  })
  .as('privacy.settings')

// Routes pour les tweets
router.post('/tweets', [TweetsController, 'store']).as('tweets.store')
router.get('/tweets/user/:id', [TweetsController, 'getUserTweets']).as('tweets.user')
router.get('/feed', [TweetsController, 'getFeed']).as('tweets.feed')
router.delete('/tweets/:id', [TweetsController, 'delete']).as('tweets.delete')

// Routes pour les interactions des tweets
router.post('/tweets/:id/like', [TweetInteractionsController, 'toggleLike']).as('tweets.like')
router.post('/tweets/:id/retweet', [TweetInteractionsController, 'retweet']).as('tweets.retweet')
router
  .delete('/tweets/:id/retweet', [TweetInteractionsController, 'unretweet'])
  .as('tweets.unretweet')
router
  .get('/tweets/:id/interactions', [TweetInteractionsController, 'getInteractions'])
  .as('tweets.interactions')

// Routes pour les réponses
router.post('/tweets/:id/replies', [RepliesController, 'store']).as('replies.store')
router.get('/tweets/:id/replies', [RepliesController, 'getReplies']).as('replies.get')

// Routes pour le suivi
router.post('/users/:id/follow', [FollowsController, 'toggle']).as('users.follow')
router
  .get('/users/:id/follow-status', [FollowsController, 'checkFollowStatus'])
  .as('users.followStatus')
router.get('/users/:id/following', [FollowsController, 'getFollowing']).as('users.following')
router.get('/users/:id/followers', [FollowsController, 'getFollowers']).as('users.followers')

// Routes pour les blocages
router.post('/users/:id/block', [BlocksController, 'toggle']).as('users.block')
router.get('/users/:id/block-status', [BlocksController, 'isBlocked']).as('users.blockStatus')
router.get('/blocked-users', [BlocksController, 'index']).as('blocked.index')

// Routes pour les demandes d'abonnement
router
  .post('/users/:id/follow-request', [FollowRequestsController, 'createFollowRequest'])
  .as('followRequests.create')
router
  .post('/follow-requests/:id/accept', [FollowRequestsController, 'acceptRequest'])
  .as('followRequests.accept')
router
  .post('/follow-requests/:id/reject', [FollowRequestsController, 'rejectRequest'])
  .as('followRequests.reject')
router
  .get('/follow-requests/pending', [FollowRequestsController, 'getPendingRequests'])
  .as('followRequests.pending')
router
  .post('/account/toggle-private', [FollowRequestsController, 'togglePrivateAccount'])
  .as('account.togglePrivate')

// Routes pour les notifications
router.get('/notifications', [FollowsController, 'getNotifications']).as('notifications.index')
router.post('/notifications/:id/read', [FollowsController, 'markAsRead']).as('notifications.read')

// Routes pour la recherche
router.get('/search', [SearchController, 'search']).as('search.index')
router.get('/search/api', [SearchController, 'searchApi']).as('search.api')

// Routes pour les profils
router.post('/profile/update', [ProfilesController, 'update']).as('profile.update')
router
  .post('/profile/change-password', [ProfilesController, 'changePassword'])
  .as('profile.changePassword')

// Route de test pour les notifications (temporaire)
router
  .get('/test-notifications', async ({ auth, response }) => {
    try {
      const user = await auth.authenticate()

      const notifications = await Notification.query()
        .where('user_id', user.id)
        .preload('fromUser')
        .orderBy('created_at', 'desc')
        .limit(10)

      return response.json({
        userId: user.id,
        username: user.username,
        notificationsCount: notifications.length,
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          message: n.message,
          fromUser: n.fromUser.username,
          isRead: n.isRead,
          createdAt: n.createdAt.toFormat('dd/MM/yyyy HH:mm'),
        })),
      })
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  })
  .as('test.notifications')

// Route pour marquer toutes les notifications comme lues
router
  .post('/notifications/mark-all-read', [FollowsController, 'markAllAsRead'])
  .as('notifications.markAllRead')

// Routes pour les hashtags
router.get('/hashtag/:slug', [HashtagsController, 'show']).as('hashtag.show')
router.get('/hashtags/search', [HashtagsController, 'search']).as('hashtags.search')
router.get('/trending-hashtags', [HashtagsController, 'trending']).as('hashtags.trending')

// Routes pour Grok AI
router
  .group(() => {
    // Génération de contenu
    router.post('/generate-content', [GrokController, 'generateContent']).as('grok.generateContent')

    // Suggestions de hashtags
    router.post('/suggest-hashtags', [GrokController, 'suggestHashtags']).as('grok.suggestHashtags')

    // Analyse de tweets
    router.post('/analyze-tweet', [GrokController, 'analyzeTweet']).as('grok.analyzeTweet')

    // Analyse globale utilisateur
    router.get('/analyze-user', [GrokController, 'analyzeUserTweets']).as('grok.analyzeUser')

    // Optimisation de tweet
    router.post('/optimize-tweet', [GrokController, 'optimizeTweet']).as('grok.optimizeTweet')

    // Test de connexion
    router.get('/test', [GrokController, 'testConnection']).as('grok.test')
  })
  .prefix('/grok')
  .as('grok')
