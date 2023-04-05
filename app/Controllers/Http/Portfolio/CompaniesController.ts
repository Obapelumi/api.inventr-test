import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { countRelations, preloadRelations, sumRelations } from 'App/Helpers/Model'
import Company from 'App/Models/Portfolio/Company'
import { FetchType, fetchValidator } from 'App/Validators/Request/FetchValidator'

export default class CompaniesController {
  public async index({ request, response }: HttpContextContract) {
    const {
      page = 1,
      perPage = 100,
      relations,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      counts,
      sums
    } = await fetchValidator<FetchType['companies']>(request, Company)
    const query = Company.query().orderBy(sortBy, sortOrder)
    preloadRelations(query, relations)
    countRelations(query, counts)
    sumRelations(query, sums)
    search && query.apply((scopes) => scopes.search(search))
    const results = await query.paginate(page, perPage)
    return response.json(results)
  }

  public async store({}: HttpContextContract) {}

  public async show({ params, request, response }: HttpContextContract) {
    const { relations, sums, counts } = await fetchValidator<FetchType['companies']>(
      request,
      Company
    )
    const query = Company.query().where('uuid', params.id)
    preloadRelations(query, relations)
    sumRelations(query, sums)
    countRelations(query, counts)
    const data = await query.firstOrFail()
    return response.json({ status: true, data })
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
