import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/People/User'
import { schema } from '@ioc:Adonis/Core/Validator'
import { listRelations, preloadRelations } from 'App/Helpers/Model'
import { fetchValidator } from 'App/Validators/Request/FetchValidator'

export default class AuthController {
  public async index({ response }: HttpContextContract) {
    return response.json({ message: 'Hi! Spread Innovation :)' })
  }

  public async userLogin({ auth, request, response }: HttpContextContract) {
    const { username, relations, password } = await request.validate({
      schema: schema.create({
        username: schema.string(),
        password: schema.string(),
        relations: schema.enumSet.optional(listRelations(User))
      })
    })
    const token = await auth.attempt(username, password)
    const userQuery = User.query().where((query) => {
      query.where('email', username)
    })
    preloadRelations(userQuery, relations)
    const user = await userQuery.firstOrFail()
    return response.json({ token, user })
  }

  public async userLogout({ auth, response }: HttpContextContract) {
    await auth.logout()
    return response.json({ message: 'user logged out' })
  }

  public async me({ request, response, auth }: HttpContextContract) {
    const { relations } = await fetchValidator(request, User)
    let query = User.query().where('id', auth.user ? auth.user.id : 0)
    preloadRelations(query, relations)
    const data = await query.firstOrFail()
    return response.json({ data })
  }
}
