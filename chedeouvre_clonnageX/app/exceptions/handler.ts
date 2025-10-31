import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  protected renderStatusPages = app.inProduction

  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { view }) => {
      return view.render('errors/not_found', {
        error,
        statusCode: 404,
        title: 'Page non trouvée',
        message: "Désolé, la page que vous recherchez n'existe pas.",
      })
    },
    '403': (error, { view }) => {
      return view.render('errors/unauthorized', {
        error,
        statusCode: 403,
        title: 'Accès non autorisé',
        message: "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
      })
    },
    '500..599': (error, { view }) => {
      return view.render('errors/server_error', {
        error,
        statusCode: error.status || 500,
        title: 'Erreur interne du serveur',
        message: "Une erreur inattendue s'est produite. Nos équipes ont été notifiées.",
      })
    },
  }

  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
