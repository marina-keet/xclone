import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class ProfilesController {
  /**
   * Mettre à jour le profil de l'utilisateur
   */
  async update({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const { username, fullName, bio, location, website } = request.only([
        'username',
        'fullName',
        'bio',
        'location',
        'website',
      ])

      console.log('📝 Mise à jour du profil pour:', user.username)
      console.log('📋 Données reçues:', { username, fullName, bio, location, website })

      // Gérer l'upload de la photo de profil
      let avatarPath = null
      const avatar = request.file('avatar', {
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      })

      if (avatar) {
        console.log('📸 Traitement de la photo de profil...')
        const fileName = `avatar_${user.id}_${Date.now()}.${avatar.extname}`
        await avatar.move('uploads/avatars', {
          name: fileName,
        })

        if (avatar.state === 'moved') {
          avatarPath = `/uploads/avatars/${fileName}`
          console.log('✅ Photo de profil sauvegardée:', avatarPath)
        } else {
          console.error("❌ Erreur lors de l'upload:", avatar.errors)
          return response.status(400).json({
            error: "Erreur lors de l'upload de la photo de profil",
          })
        }
      }

      // Vérifier si le nom d'utilisateur est déjà pris (sauf par l'utilisateur actuel)
      if (username && username !== user.username) {
        const existingUser = await User.query()
          .where('username', username)
          .where('id', '!=', user.id)
          .first()

        if (existingUser) {
          return response.status(400).json({
            error: "Ce nom d'utilisateur est déjà pris",
          })
        }
      }

      // Mettre à jour les champs
      if (username) user.username = username
      if (fullName !== undefined) user.fullName = fullName || null
      if (bio !== undefined) user.bio = bio || null
      if (location !== undefined) user.location = location || null
      if (website !== undefined) user.website = website || null
      if (avatarPath) user.avatar = avatarPath

      await user.save()

      console.log('✅ Profil mis à jour avec succès pour:', user.username)

      return response.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          bio: user.bio,
          location: user.location,
          website: user.website,
        },
      })
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error)
      return response.status(500).json({
        error: 'Erreur lors de la mise à jour du profil',
      })
    }
  }

  /**
   * Changer le mot de passe de l'utilisateur
   */
  async changePassword({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const { currentPassword, newPassword, confirmPassword } = request.only([
        'currentPassword',
        'newPassword',
        'confirmPassword',
      ])

      console.log('🔒 Tentative de changement de mot de passe pour:', user.username)

      // Vérifications
      if (!currentPassword || !newPassword || !confirmPassword) {
        return response.status(400).json({
          error: 'Tous les champs sont requis',
        })
      }

      if (newPassword !== confirmPassword) {
        return response.status(400).json({
          error: 'Les nouveaux mots de passe ne correspondent pas',
        })
      }

      if (newPassword.length < 6) {
        return response.status(400).json({
          error: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        })
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await hash.verify(user.password, currentPassword)
      if (!isCurrentPasswordValid) {
        return response.status(400).json({
          error: 'Le mot de passe actuel est incorrect',
        })
      }

      // Hasher le nouveau mot de passe
      user.password = await hash.make(newPassword)
      await user.save()

      console.log('✅ Mot de passe changé avec succès pour:', user.username)

      return response.json({
        success: true,
        message: 'Mot de passe changé avec succès',
      })
    } catch (error) {
      console.error('❌ Erreur lors du changement de mot de passe:', error)
      return response.status(500).json({
        error: 'Erreur lors du changement de mot de passe',
      })
    }
  }
}
