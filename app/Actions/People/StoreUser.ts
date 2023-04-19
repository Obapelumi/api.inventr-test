import { preloadRelations } from 'App/Helpers/Model'
import User from 'App/Models/People/User'
import Company from 'App/Models/Portfolio/Company'
import StoreUserValidator from 'App/Validators/People/StoreUserValidator'

export default class StoreUser {
  public static async handle({
    name,
    email,
    password,
    companyName,
    relations
  }: StoreUserValidator['schema']['props']) {
    const company = await Company.create({ name: companyName })
    const user = await User.create({ name, email, password, companyId: company.id })
    const userQuery = User.query().where('id', user.id)
    if (relations) {
      preloadRelations(userQuery, relations)
    }
    return userQuery.firstOrFail()
  }
}
