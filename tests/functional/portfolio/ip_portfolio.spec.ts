import TestUtils from '@ioc:Adonis/Core/TestUtils'
import { test } from '@japa/runner'
import IpPortfolio from 'App/Models/Portfolio/IpPortfolio'
import { getUser, registerUser } from '../base'

test.group('Portfolio -> ip portfolios', (group) => {
  group.setup(registerUser)
  group.teardown(TestUtils.db().truncate)

  test('list ip portfolios', async ({ client, assert }) => {
    const user = await getUser(['company'])
    await client
      .post('ip-portfolios')
      .json({ name: 'New portfolio', budget: 5000_000 })
      .loginAs(user)
    const response = await client.get('ip-portfolios').loginAs(user).qs({ perPage: 10 })
    const data = await IpPortfolio.query().paginate(1, 10)
    assert.equal(data.length, 1)
    response.assertBody(data.serialize())
  })

  test('store ip portfolio', async ({ client, assert }) => {
    const user = await getUser(['company'])
    const response = await client
      .post('ip-portfolios')
      .json({ name: 'New portfolio', budget: 5000_000 })
      .loginAs(user)
    const body = response.body()
    assert.containsSubset(body.data, { name: 'New portfolio', budget: 5000_000 })
  })

  test('show ip portfolio', async ({ client }) => {
    const user = await getUser(['company'])
    const portfolioResponse = await client
      .post('ip-portfolios')
      .json({ name: 'New portfolio', budget: 5000_000 })
      .loginAs(user)
    const portfolioBody = portfolioResponse.body()
    const response = await client.get(`ip-portfolios/${portfolioBody.data.id}`).loginAs(user)

    response.assertBody(portfolioBody)
  })

  test('update ip portfolio', async ({ client }) => {
    const user = await getUser(['company'])
    const portfolioResponse = await client
      .post('ip-portfolios')
      .json({ name: 'New portfolio', budget: 5000_000 })
      .loginAs(user)
    const portfolioBody = portfolioResponse.body()
    const response = await client
      .put(`ip-portfolios/${portfolioBody.data.id}`)
      .loginAs(user)
      .json({ name: 'Updated Portfolio' })

    response.assertBody({
      ...portfolioBody,
      data: { ...portfolioBody.data, name: 'Updated Portfolio' }
    })
  })
})
