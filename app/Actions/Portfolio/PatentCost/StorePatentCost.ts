import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import Patent from 'App/Models/Portfolio/Patent'
import PatentCost from 'App/Models/Portfolio/PatentCost'
import PatentCostType from 'App/Models/Portfolio/PatentCostType'
import StorePatentCostValidator from 'App/Validators/Portfolio/PatentCost/StorePatentCostValidator'

export default class StorePatentCost {
  public static async handle(
    { type, amount, patentId, transactionDate }: StorePatentCostValidator['schema']['props'],
    auth: AuthContract
  ) {
    const patent = await Patent.findByOrFail('uuid', patentId)
    const patentCost = await PatentCost.create({
      amount,
      type: PatentCostType[type],
      transactionDate,
      patentId: patent.id,
      ipPortfolioId: patent.ipPortfolioId,
      companyId: patent.companyId,
      createdBy: auth.user?.id
    })
    return patentCost.refresh()
  }
}
