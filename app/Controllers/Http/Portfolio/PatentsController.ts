import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StorePatent from 'App/Actions/Portfolio/Patent/StorePatent'
import { preloadRelations, sumRelations } from 'App/Helpers/Model'
import { toSet } from 'App/Helpers/Utility'
import Patent from 'App/Models/Portfolio/Patent'
import Epo from 'App/Services/Epo'
import PatentSearchValidator from 'App/Validators/Portfolio/Patent/PatentSearchValidator'
import StorePatentValidator from 'App/Validators/Portfolio/Patent/StorePatentValidator'
import { FetchType, fetchValidator } from 'App/Validators/Request/FetchValidator'

export default class PatentsController {
  public async index({ auth, request, response }: HttpContextContract) {
    const {
      ipPortfolioIds,
      page = 1,
      perPage = 100,
      relations,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      sums
    } = await fetchValidator<FetchType['patents']>(request, Patent)
    const query = Patent.query().orderBy(sortBy, sortOrder)
    preloadRelations(query, relations)
    sumRelations(query, sums)
    search && query.apply((scopes) => scopes.search(search))
    ipPortfolioIds && query.apply((s) => s.byPortfolio(ipPortfolioIds))
    const results = await query.apply((scopes) => scopes.byUser(auth.user)).paginate(page, perPage)
    return response.json(results)
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const body = await request.validate(StorePatentValidator)
    const data = await StorePatent.handle(body, auth)
    return response.json({ status: true, data })
  }

  public async show({ auth, params, request, response }: HttpContextContract) {
    const { relations, sums } = await fetchValidator<FetchType['ip_portfolios']>(request, Patent)
    const query = Patent.query()
      .where('uuid', params.id)
      .apply((s) => s.byUser(auth.user))
    preloadRelations(query, relations)
    sumRelations(query, sums)
    const data = await query.firstOrFail()
    return response.json({ status: true, data })
  }

  public async search({ auth, request, response }: HttpContextContract) {
    const { text, searchBy, start = 1, end = 10 } = await request.validate(PatentSearchValidator)
    const savedPatents = await Patent.query().apply((s) => s.byUser(auth.user))
    const data = await Epo.search(
      text,
      searchBy,
      [start, end],
      toSet(savedPatents, (patent) => patent.patentNumber)
    )
    return response.json({ status: true, data })
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    const patent = await Patent.query()
      .where('uuid', params.id)
      .orWhere('patent_number', params.id)
      .apply((s) => s.byUser(auth.user))
      .firstOrFail()

    await patent.related('costs').query().delete()
    await patent.delete()

    return response.json({ status: true, data: patent })
  }
}
