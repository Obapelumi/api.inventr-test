import User from 'App/Models/People/User'
import Company from 'App/Models/Portfolio/Company'
import StoreUserValidator from 'App/Validators/People/StoreUserValidator'

export default class StoreUser {
  public static async handle({
    name,
    email,
    password,
    companyName
  }: StoreUserValidator['schema']['props']) {
    const company = await Company.create({ name: companyName })
    const user = await User.create({ name, email, password, companyId: company.id })
    return user.refresh()
  }
}
