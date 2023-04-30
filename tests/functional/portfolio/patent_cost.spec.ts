import { test } from '@japa/runner'
import { sumRelations } from 'App/Helpers/Model'
import Company from 'App/Models/Portfolio/Company'
import IpPortfolio from 'App/Models/Portfolio/IpPortfolio'
import Patent from 'App/Models/Portfolio/Patent'
import { getUser, makeEpoMock, testSetup, TEST_PATENT_NUMBER } from '../base'

test.group('Portfolio -> Patent Costs', (group) => {
  group.setup(testSetup)

  test('store patent cost', async ({ client, assert }) => {
    const epoMock = makeEpoMock()
    const user = await getUser(['company'])
    const portfolioResponse = await client
      .post('ip-portfolios')
      .json({ name: 'New portfolio', budget: 5000_000 })
      .loginAs(user)
    const ipPortfolioId = portfolioResponse.body().data.id
    await client
      .post('patents')
      .json({ patentNumber: TEST_PATENT_NUMBER, ipPortfolioId })
      .loginAs(user)
    const patentQuery = Patent.query().where('patentNumber', TEST_PATENT_NUMBER)
    sumRelations(patentQuery, ['costs.amount'])
    let patent = await patentQuery.firstOrFail()
    const response = await client.post('patent-costs').loginAs(user).json({
      amount: 10_000,
      type: 'attorney',
      transactionDate: '2023-03-30',
      patentId: patent.uuid
    })
    const body = response.body()
    assert.containsSubset(body.data, {
      amount: 10_000,
      type: 'attorney',
      transactionDate: '2023-03-30'
    })
    patent = await patentQuery.firstOrFail()
    const portfolioQuery = IpPortfolio.query().where('id', patent.ipPortfolioId)
    sumRelations(portfolioQuery, ['patentCosts.amount'])
    const ipPortfolio = await portfolioQuery.firstOrFail()
    const companyQuery = Company.query().where('id', user.companyId)
    sumRelations(companyQuery, ['patentCosts.amount'])
    const company = await companyQuery.firstOrFail()
    assert.containsSubset(patent.serialize(), { meta: { costsAmountSum: 10_000 } })
    assert.containsSubset(ipPortfolio.serialize(), { meta: { patentCostsAmountSum: 10_000 } })
    assert.containsSubset(company.serialize(), { meta: { patentCostsAmountSum: 10_000 } })

    epoMock.verify()
    epoMock.restore()
  })

  test('list patent costs', async ({ client, assert }) => {
    const user = await getUser(['company'])
    const response = await client.get('patent-costs').loginAs(user).qs({ perPage: 10 })
    const body = response.body()
    assert.isAtMost(body.data.length, 10)
  })
})
