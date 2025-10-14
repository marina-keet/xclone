import Database from '@adonisjs/lucid/database'
import hash from '@adonisjs/core/services/hash'

// Create test user
const user = await Database.table('users').insert({
  email: 'test@example.com',
  username: 'testuser',
  password: await hash.make('password123'),
  full_name: 'Test User',
  created_at: new Date(),
  updated_at: new Date()
})

console.log('User created:', user)
