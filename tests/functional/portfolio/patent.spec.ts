import TestUtils from '@ioc:Adonis/Core/TestUtils'
import { test } from '@japa/runner'
import Patent from 'App/Models/Portfolio/Patent'
import { getUser, registerUser } from '../base'

const TEST_PATENT_NUMBER = '2023099570'

test.group('Portfolio -> Patents', (group) => {
  group.setup(registerUser)
  group.teardown(TestUtils.db().truncate)

  test('store patent', async ({ client, assert }) => {
    const user = await getUser(['company'])
    const portfolioResponse = await client
      .post('ip-portfolios')
      .json({ name: 'New portfolio', budget: 5000_000 })
      .loginAs(user)
    const ipPortfolioId = portfolioResponse.body().data.id
    const response = await client
      .post('patents')
      .json({ patentNumber: TEST_PATENT_NUMBER, ipPortfolioId })
      .loginAs(user)
    const body = response.body()
    assert.containsSubset(body.data, {
      title: 'SYSTEMS AND METHODS FOR ARTIFICIAL INTELLIGENCE (AI) ERGONOMIC POSITIONING',
      patentNumber: TEST_PATENT_NUMBER
    })
  })

  test('list patents', async ({ client }) => {
    const user = await getUser(['company'])
    const response = await client.get('patents').loginAs(user).qs({ perPage: 10 })
    const data = await Patent.query().paginate(1, 10)
    response.assertBody(data.serialize())
  })

  test('show patent', async ({ client }) => {
    const user = await getUser(['company'])
    const patent = await Patent.findByOrFail('patent_number', TEST_PATENT_NUMBER)
    const response = await client.get(`patents/${patent.uuid}`).loginAs(user)
    response.assertBody({ status: true, data: patent.serialize() })
  })
})
