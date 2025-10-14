// Quick script to create test users
import './start/env.js'
import app from '@adonisjs/core/services/app'
import { BaseModel } from '@adonisjs/lucid/orm'
import db from '@adonisjs/lucid/services/db'

// Boot the app
await app.booted()

// Use the User model to create a test user
const { default: User } = await import('#models/user')
const hash = (await import('@adonisjs/core/services/hash')).default

try {
  // Clear existing users (optional)
  console.log('🗑️  Clearing existing users...')
  await User.query().delete()

  // Create test users
  console.log('👤 Creating test users...')

  const testUser = await User.create({
    email: 'test@example.com',
    username: 'testuser',
    password: await hash.make('password123'),
    fullName: 'Test User'
  })

  const adminUser = await User.create({
    email: 'admin@example.com', 
    username: 'admin',
    password: await hash.make('admin123'),
    fullName: 'Administrator'
  })

  console.log('✅ Users created successfully!')
  console.log('🔑 Test credentials:')
  console.log('  Email: test@example.com | Password: password123')
  console.log('  Email: admin@example.com | Password: admin123')
  console.log('')
  console.log('🌐 You can now login at: http://localhost:3333/login')

} catch (error) {
  console.error('❌ Error creating users:', error)
} finally {
  await db.manager.closeAll()
  process.exit(0)
}