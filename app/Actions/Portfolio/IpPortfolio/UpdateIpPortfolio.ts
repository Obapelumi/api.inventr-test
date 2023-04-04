import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import IpPortfolio from 'App/Models/Portfolio/IpPortfolio'
import UpdateIpPortfolioValidator from 'App/Validators/Portfolio/IpPortfolio/UpdateIpPortfolioValidator'

export default class UpdateIpPortfolio {
  public static async handle(
    id: string,
    { name, budget, lockBudget }: UpdateIpPortfolioValidator['schema']['props'],
    auth: AuthContract
  ) {
    const ipPortfolio = await IpPortfolio.query()
      .where('uuid', id)
      .apply((s) => s.byUser(auth.user))
      .firstOrFail()

    ipPortfolio.merge({ name, budget, lockBudget })
    await ipPortfolio.save()
    return ipPortfolio.refresh()
  }
}
