import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'ethereal',

  /**
   * Configuration pour les différents services d'email
   */
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', 'smtp.gmail.com'),
      port: env.get('SMTP_PORT', 587),
      secure: false, // true pour 465, false pour 587
      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME', ''),
        pass: env.get('SMTP_PASSWORD', ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
    }),

    // Configuration Gmail avec authentification sécurisée
    gmail: transports.smtp({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        type: 'login',
        user: env.get('GMAIL_USERNAME', 'marinakeet34@gmail.com'),
        pass: env.get('GMAIL_APP_PASSWORD', ''), // MOT DE PASSE D'APPLICATION (16 caractères)
      },
      tls: {
        rejectUnauthorized: false,
      },
    }),

    // Configuration Mailtrap (service de test gratuit)
    mailtrap: transports.smtp({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        type: 'login',
        user: env.get('MAILTRAP_USERNAME', ''),
        pass: env.get('MAILTRAP_PASSWORD', ''),
      },
    }),

    // Configuration alternative avec Ethereal (pour tests)
    ethereal: transports.smtp({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        type: 'login',
        user: env.get('ETHEREAL_USERNAME', ''),
        pass: env.get('ETHEREAL_PASSWORD', ''),
      },
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
