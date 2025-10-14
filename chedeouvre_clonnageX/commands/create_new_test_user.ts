import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class CreateNewTestUser extends BaseCommand {
  static commandName = 'create:new-test-user'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Hello world from "CreateNewTestUser"')
  }
}