import { args, BaseCommand, flags } from '@adonisjs/core/build/standalone'
import { join } from 'path'

export default class MakeAction extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'make:action'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Make a new Action'

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
  @args.string({ description: 'Name of the action class' })
  public name: string

  /**
   * Defines if we generate the controller for the model.
   */
  @flags.string({
    name: 'validator',
    alias: 'vd',
    description: 'Import the validator for this action'
  })
  public validator: string

  public async run() {
    const stub = join(__dirname, 'templates', 'action.txt')
    const validator = this.validator ?? this.name
    const validatorFile = this.generator.addFile(validator).toJSON()
    const actionDir = this.name.split('/').slice(0, -1).join('/')
    this.generator.clear()

    this.generator
      .addFile(this.name, { pattern: 'pascalcase', form: 'singular' })
      .stub(stub)
      .destinationDir('app/Actions')
      .useMustache()
      .apply({
        validatorName: validatorFile.filename,
        validatorPath() {
          return function () {
            return `App/Validators/${actionDir}/${validatorFile.filename}Validator`
          }
        }
      })
      .appRoot(this.application.cliCwd || this.application.appRoot)

    await this.generator.run()
  }
}
