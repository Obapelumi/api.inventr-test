import { Exception } from '@adonisjs/core/build/standalone'
import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import IpPortfolio from 'App/Models/Portfolio/IpPortfolio'
import Patent from 'App/Models/Portfolio/Patent'
import Epo from 'App/Services/Epo'
import StorePatentValidator from 'App/Validators/Portfolio/Patent/StorePatentValidator'

export default class StorePatent {
  public static async handle(
    { patentNumber, ipPortfolioId }: StorePatentValidator['schema']['props'],
    auth: AuthContract
  ) {
    let patent = await Patent.query()
      .where('patentNumber', patentNumber)
      .apply((s) => s.byUser(auth.user))
      .first()
    if (patent) {
      return patent
    }
    const epoPatent = await Epo.search(patentNumber, ['publicationnumber'], [1, 2]).then((r) =>
      r.data.find(Boolean)
    )
    if (!epoPatent) {
      throw new Exception('patent not found', 404)
    }
    const { title, abstract, applicant, inventor, publicationDate } = epoPatent
    const ipPortfolio = await IpPortfolio.query()
      .apply((s) => s.byUser(auth.user))
      .where('uuid', ipPortfolioId)
      .firstOrFail()
    patent = await Patent.create({
      patentNumber,
      title,
      abstract,
      applicant,
      inventor,
      publicationDate,
      ipPortfolioId: ipPortfolio.id,
      companyId: auth.user?.companyId,
      createdBy: auth.user?.id
    })
    return patent.refresh()
  }
}
