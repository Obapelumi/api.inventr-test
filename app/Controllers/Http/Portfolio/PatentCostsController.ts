import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StorePatentCost from 'App/Actions/Portfolio/PatentCost/StorePatentCost'
import { preloadRelations } from 'App/Helpers/Model'
import PatentCost from 'App/Models/Portfolio/PatentCost'
import StorePatentCostValidator from 'App/Validators/Portfolio/PatentCost/StorePatentCostValidator'
import { FetchType, fetchValidator } from 'App/Validators/Request/FetchValidator'

export default class PatentCostsController {
  public async index({ auth, request, response }: HttpContextContract) {
    const {
      patentIds,
      page = 1,
      perPage = 100,
      relations,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = await fetchValidator<FetchType['patent_costs']>(request, PatentCost)
    const query = PatentCost.query().orderBy(sortBy, sortOrder)
    preloadRelations(query, relations)
    patentIds && query.apply((scopes) => scopes.byPatent(patentIds))
    search && query.apply((scopes) => scopes.search(search))
    const results = await query.apply((scopes) => scopes.byUser(auth.user)).paginate(page, perPage)
    return response.json(results)
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const body = await request.validate(StorePatentCostValidator)
    const data = await StorePatentCost.handle(body, auth)
    return response.json({ status: true, data })
  }

  public async show({ auth, params, request, response }: HttpContextContract) {
    const { relations } = await fetchValidator<FetchType['ip_portfolios']>(request, PatentCost)
    const query = PatentCost.query()
      .where('uuid', params.id)
      .apply((s) => s.byUser(auth.user))
    preloadRelations(query, relations)
    const data = await query.firstOrFail()
    return response.json({ status: true, data })
  }
}
