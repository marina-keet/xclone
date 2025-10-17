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
const ProfilesController = () => import('#controllers/profiles_controller')
const RepliesController = () => import('#controllers/replies_controller')

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

// Routes pour les notifications
router.get('/notifications', [FollowsController, 'getNotifications']).as('notifications.index')
router.post('/notifications/:id/read', [FollowsController, 'markAsRead']).as('notifications.read')

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

// Route de test
router.on('/test').render('pages/home')
