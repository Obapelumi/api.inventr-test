import { args, BaseCommand } from '@adonisjs/core/build/standalone'
import { join } from 'path'
import { string } from '@poppinss/utils/build/helpers'

export default class SetupSeeder extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'setup:seeder'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Make a new Seeder file'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: false
  }

  /**
   * The name of the seeder file.
   */
  @args.string({ description: 'Name of the seeder class' })
  public name: string

  public async run() {
    const stub = join(__dirname, 'templates', 'seeder.txt')

    this.generator
      .addFile(`${this.name}Seeder`, { pattern: 'pascalcase', form: 'singular' })
      .stub(stub)
      .destinationDir('database/setup')
      .useMustache()
      .apply({
        seedingText: string.snakeCase(this.name).replace('_', ' ')
      })
      .appRoot(this.application.cliCwd || this.application.appRoot)

    await this.generator.run()
  }
}
