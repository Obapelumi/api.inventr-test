import { args, BaseCommand } from '@adonisjs/core/build/standalone'
import { join } from 'path'

export default class MakeEnum extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'make:enum'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Make a new Lucid enum'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: false
  }

  /**
   * The name of the model file.
   */
  @args.string({ description: 'Name of the enum' })
  public name: string

  public async run() {
    const stub = join(__dirname, 'templates', 'enum.txt')

    const path = this.application.resolveNamespaceDirectory('models')

    this.generator
      .addFile(this.name, { pattern: 'pascalcase', form: 'singular' })
      .stub(stub)
      .destinationDir(path || 'app/Models')
      .useMustache()
      .appRoot(this.application.cliCwd || this.application.appRoot)

    await this.generator.run()
  }
}
