import Database from '@ioc:Adonis/Lucid/Database'
import { ExtractModelRelations } from '@ioc:Adonis/Lucid/Orm'
import StoreUser from 'App/Actions/People/StoreUser'
import { preloadRelations } from 'App/Helpers/Model'
import User from 'App/Models/People/User'
import Epo from 'App/Services/Epo'
import Sinon from 'sinon'

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

export const testSetup = async () => {
  await Database.beginGlobalTransaction()
  await registerUser()
  return () => Database.rollbackGlobalTransaction()
}

export const getUser = async (relations?: ExtractModelRelations<User>[]) => {
  const query = User.query().where('email', TEST_USER_EMAIL)
  preloadRelations(query, relations)
  return await query.firstOrFail()
}

export const TEST_PATENT_NUMBER = '2023099570'

export const makeEpoMock = () => {
  const epoMock = Sinon.mock(Epo)
  epoMock
    .expects('search')
    .once()
    .withArgs(TEST_PATENT_NUMBER, ['publicationnumber'], [1, 2])
    .resolves({
      data: [
        {
          title: 'SYSTEMS AND METHODS FOR ARTIFICIAL INTELLIGENCE (AI) ERGONOMIC POSITIONING',
          patentNumber: '2023099570',
          abstract: 'An Artificial Intelligence (AI)...',
          applicant: 'TRAVELERS INDEMNITY CO [US], The Travelers Indemnity Company',
          inventor: 'BOBERT TYLER S [US], GRANT CHRISTIAN P [US]...',
          publicationDate: '2023-03-30'
        }
      ]
    })
  return epoMock
}
