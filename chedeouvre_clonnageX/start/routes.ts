/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const TweetsController = () => import('#controllers/tweets_controller')
const TweetInteractionsController = () => import('#controllers/tweet_interactions_controller')
const FollowsController = () => import('#controllers/follows_controller')

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

// Routes pour les interactions des tweets
router.post('/tweets/:id/like', [TweetInteractionsController, 'toggleLike']).as('tweets.like')
router.post('/tweets/:id/retweet', [TweetInteractionsController, 'retweet']).as('tweets.retweet')
router
  .delete('/tweets/:id/retweet', [TweetInteractionsController, 'unretweet'])
  .as('tweets.unretweet')
router
  .get('/tweets/:id/interactions', [TweetInteractionsController, 'getInteractions'])
  .as('tweets.interactions')

// Routes pour le suivi
router.post('/users/:id/follow', [FollowsController, 'toggle']).as('users.follow')

// Routes pour les notifications
router.get('/notifications', [FollowsController, 'getNotifications']).as('notifications.index')
router.post('/notifications/:id/read', [FollowsController, 'markAsRead']).as('notifications.read')

// Route de test
router.on('/test').render('pages/home')
