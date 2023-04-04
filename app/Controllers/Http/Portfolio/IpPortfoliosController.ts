import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StoreIpPortfolio from 'App/Actions/Portfolio/IpPortfolio/StoreIpPortfolio'
import UpdateIpPortfolio from 'App/Actions/Portfolio/IpPortfolio/UpdateIpPortfolio'
import { countRelations, preloadRelations, sumRelations } from 'App/Helpers/Model'
import IpPortfolio from 'App/Models/Portfolio/IpPortfolio'
import StoreIpPortfolioValidator from 'App/Validators/Portfolio/IpPortfolio/StoreIpPortfolioValidator'
import UpdateIpPortfolioValidator from 'App/Validators/Portfolio/IpPortfolio/UpdateIpPortfolioValidator'
import { FetchType, fetchValidator } from 'App/Validators/Request/FetchValidator'

export default class IpPortfoliosController {
  public async index({ auth, request, response }: HttpContextContract) {
    const {
      page = 1,
      perPage = 100,
      relations,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      counts,
      sums
    } = await fetchValidator<FetchType['ip_portfolios']>(request, IpPortfolio)
    const query = IpPortfolio.query().orderBy(sortBy, sortOrder)
    preloadRelations(query, relations)
    countRelations(query, counts)
    sumRelations(query, sums)
    search && query.apply((scopes) => scopes.search(search))
    const results = await query.apply((scopes) => scopes.byUser(auth.user)).paginate(page, perPage)
    return response.json(results)
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const body = await request.validate(StoreIpPortfolioValidator)
    const data = await StoreIpPortfolio.handle(body, auth)
    return response.json({ status: true, data })
  }

  public async show({ auth, params, request, response }: HttpContextContract) {
    const { relations, sums, counts } = await fetchValidator<FetchType['ip_portfolios']>(
      request,
      IpPortfolio
    )
    const query = IpPortfolio.query()
      .where('uuid', params.id)
      .apply((s) => s.byUser(auth.user))
    preloadRelations(query, relations)
    sumRelations(query, sums)
    countRelations(query, counts)
    const data = await query.firstOrFail()
    return response.json({ status: true, data })
  }

  public async update({ auth, params, request, response }: HttpContextContract) {
    const body = await request.validate(UpdateIpPortfolioValidator)
    const data = await UpdateIpPortfolio.handle(params.id, body, auth)
    return response.json({ status: true, data })
  }
}
