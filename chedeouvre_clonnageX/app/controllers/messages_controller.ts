import type { HttpContext } from '@adonisjs/core/http'
import Message from '#models/message'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class MessagesController {
  /**
   * Afficher la liste des conversations
   */
  async index({ auth, view }: HttpContext) {
    const user = await auth.authenticate()

    // Récupérer les conversations (messages groupés par utilisateur)
    const conversations = await Message.query()
      .where('sender_id', user.id)
      .orWhere('receiver_id', user.id)
      .preload('sender')
      .preload('receiver')
      .orderBy('created_at', 'desc')

    // Grouper par conversation
    const conversationsMap = new Map()

    conversations.forEach((message) => {
      const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId
      const otherUser = message.senderId === user.id ? message.receiver : message.sender

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        })
      }

      // Compter les messages non lus
      if (message.receiverId === user.id && !message.readAt) {
        conversationsMap.get(otherUserId).unreadCount++
      }
    })

    const conversationsList = Array.from(conversationsMap.values())
    const totalUnreadCount = conversationsList.reduce(
      (total, conversation) => total + conversation.unreadCount,
      0
    )

    return view.render('pages/messages', {
      conversations: conversationsList,
      currentUser: user,
      totalUnreadCount: totalUnreadCount,
    })
  }

  /**
   * Afficher une conversation spécifique
   */
  async show({ params, auth, view }: HttpContext) {
    const user = await auth.authenticate()
    const otherUserId = params.userId

    // Récupérer l'autre utilisateur
    const otherUser = await User.findOrFail(otherUserId)

    // Récupérer tous les messages de la conversation
    const messages = await Message.query()
      .where((query) => {
        query.where('sender_id', user.id).andWhere('receiver_id', otherUserId)
      })
      .orWhere((query) => {
        query.where('sender_id', otherUserId).andWhere('receiver_id', user.id)
      })
      .preload('sender')
      .preload('receiver')
      .orderBy('created_at', 'asc')

    // Marquer les messages reçus comme lus
    await Message.query()
      .where('sender_id', otherUserId)
      .where('receiver_id', user.id)
      .whereNull('read_at')
      .update({ read_at: DateTime.now() })

    return view.render('pages/conversation', {
      messages,
      otherUser,
      currentUser: user,
    })
  }

  /**
   * Envoyer un nouveau message
   */
  async store({ request, auth, response, session }: HttpContext) {
    const user = await auth.authenticate()
    const { receiver_id: receiverId, content } = request.only(['receiver_id', 'content'])

    // Vérifier que le destinataire existe
    await User.findOrFail(receiverId)

    // Créer le message
    await Message.create({
      senderId: user.id,
      receiverId,
      content: content.trim(),
    })

    session.flash('success', 'Message envoyé avec succès!')
    return response.redirect().back()
  }

  /**
   * API pour envoyer un message (AJAX)
   */
  async apiStore({ request, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const { receiver_id: receiverId, content } = request.only(['receiver_id', 'content'])

    // Vérifier que le destinataire existe
    const receiver = await User.findOrFail(receiverId)

    // Créer le message
    const message = await Message.create({
      senderId: user.id,
      receiverId,
      content: content.trim(),
    })

    // Charger les relations
    await message.load('sender')
    await message.load('receiver')

    return response.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        created_at: message.createdAt,
        sender: {
          id: message.sender.id,
          username: message.sender.username,
        },
      },
    })
  }

  /**
   * Rechercher des utilisateurs pour démarrer une conversation
   */
  async searchUsers({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const { q: query } = request.qs()

    if (!query || query.length < 2) {
      return response.json([])
    }

    // Rechercher des utilisateurs par nom d'utilisateur ou nom complet
    const users = await User.query()
      .where('id', '!=', user.id) // Exclure l'utilisateur actuel
      .where((builder) => {
        builder.whereILike('username', `%${query}%`).orWhereILike('full_name', `%${query}%`)
      })
      .select('id', 'username', 'full_name as fullName', 'avatar')
      .limit(10)

    return response.json(users)
  }

  /**
   * API pour récupérer les nouveaux messages d'une conversation
   */
  async getNewMessages({ params, request, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const otherUserId = params.userId
    const { lastId = 0 } = request.qs()

    // Récupérer les nouveaux messages depuis le dernier ID
    const newMessages = await Message.query()
      .where((query) => {
        query.where('sender_id', otherUserId).andWhere('receiver_id', user.id)
      })
      .where('id', '>', lastId)
      .preload('sender')
      .orderBy('created_at', 'asc')
      .limit(50)

    // Marquer les nouveaux messages comme lus
    if (newMessages.length > 0) {
      await Message.query()
        .where('sender_id', otherUserId)
        .where('receiver_id', user.id)
        .where('id', '>', lastId)
        .whereNull('read_at')
        .update({ read_at: DateTime.now() })
    }

    // Formater les messages pour l'API
    const formattedMessages = newMessages.map((message) => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt,
    }))

    return response.json({
      messages: formattedMessages,
      senderName: newMessages.length > 0 ? newMessages[0].sender.username : null,
    })
  }
}
