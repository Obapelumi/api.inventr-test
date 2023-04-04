import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import IpPortfolio from 'App/Models/Portfolio/IpPortfolio'
import StoreIpPortfolioValidator from 'App/Validators/Portfolio/IpPortfolio/StoreIpPortfolioValidator'

export default class StoreIpPortfolio {
  public static async handle(
    { name, budget, lockBudget }: StoreIpPortfolioValidator['schema']['props'],
    auth: AuthContract
  ) {
    const ipPortfolio = await IpPortfolio.create({
      name,
      budget,
      lockBudget,
      companyId: auth.user?.companyId,
      createdBy: auth.user?.id
    })
    return ipPortfolio.refresh()
  }
}
