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

// Page d'accueil (connexion/inscription)
router.get('/', [AuthController, 'showHome'])

// Routes d'authentification
router.post('/register', [AuthController, 'register']).as('auth.register')
router.post('/login', [AuthController, 'login']).as('auth.login')
router.post('/logout', [AuthController, 'logout']).as('auth.logout')

// Routes protégées (après connexion)
router.get('/dashboard', [AuthController, 'dashboard']).as('dashboard')
router.get('/profile', [AuthController, 'profile']).as('profile')

// Route de test
router.on('/test').render('pages/home')
