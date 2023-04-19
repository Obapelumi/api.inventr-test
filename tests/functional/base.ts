import { ExtractModelRelations } from '@ioc:Adonis/Lucid/Orm'
import StoreUser from 'App/Actions/People/StoreUser'
import { preloadRelations } from 'App/Helpers/Model'
import User from 'App/Models/People/User'

export type Auth = { token: string; user: User }

export const TEST_USER_EMAIL = 'test@inventr.co'

export const registerUser = async () => {
  return await StoreUser.handle({
    name: 'Inventr Test',
    email: TEST_USER_EMAIL,
    password: '123456',
    companyName: 'Inventr',
    relations: undefined
  })
}

export const getUser = async (relations?: ExtractModelRelations<User>[]) => {
  const query = User.query().where('email', TEST_USER_EMAIL)
  preloadRelations(query, relations)
  return await query.firstOrFail()
}
