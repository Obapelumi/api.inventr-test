import TestUtils from '@ioc:Adonis/Core/TestUtils'
import { test } from '@japa/runner'
import Company from 'App/Models/Portfolio/Company'
import { getUser, registerUser } from '../base'

test.group('Portfolio -> companies', (group) => {
  group.setup(registerUser)
  group.teardown(TestUtils.db().truncate)

  test('list companies', async ({ client }) => {
    const user = await getUser(['company'])
    const response = await client.get('companies').loginAs(user).qs({ perPage: 10 })
    const data = await Company.query().paginate(1, 10)
    response.assertBody(data.serialize())
  })

  test('show comapny', async ({ client }) => {
    const user = await getUser(['company'])
    const response = await client.get(`companies/${user.company.uuid}`).loginAs(user)
    response.assertBody({ status: true, data: user.company.serialize() })
  })
})
