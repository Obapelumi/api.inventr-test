import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StoreUser from 'App/Actions/People/StoreUser'
import { preloadRelations } from 'App/Helpers/Model'
import User from 'App/Models/People/User'
import StoreUserValidator from 'App/Validators/People/StoreUserValidator'
import { FetchType, fetchValidator } from 'App/Validators/Request/FetchValidator'

export default class UsersController {
  public async index({ auth, request, response }: HttpContextContract) {
    const {
      page = 1,
      perPage = 100,
      relations,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = await fetchValidator<FetchType['users']>(request, User)
    const query = User.query().orderBy(sortBy, sortOrder)
    preloadRelations(query, relations)
    search && query.apply((scopes) => scopes.search(search))
    const results = await query.apply((scopes) => scopes.byUser(auth.user)).paginate(page, perPage)
    return response.json(results)
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const body = await request.validate(StoreUserValidator)
    const user = await StoreUser.handle(body)
    const token = await auth.login(user)
    return response.json({ token, user })
  }

  public async show({ request, response, params }: HttpContextContract) {
    const { relations } = await fetchValidator<FetchType['users']>(request, User)
    const query = User.query().where('uuid', params.id)
    preloadRelations(query, relations)
    const data = await query.firstOrFail()
    return response.json({ status: true, data })
  }

  public async update({ response }: HttpContextContract) {
    return response.json({ status: true, data: 'Not yet' })
  }

  public async destroy({ response }: HttpContextContract) {
    return response.json({ status: true, data: 'Not yet' })
  }
}
