import { test } from '@japa/runner'
import User from 'App/Models/People/User'
import { Auth, getUser, testSetup } from '../base'

test.group('People -> Users', (group) => {
  group.setup(testSetup)

  test('list users', async ({ client }) => {
    const user = await getUser(['company'])
    const response = await client.get('users').loginAs(user).qs({ perPage: 10 })
    const data = await User.query().paginate(1, 10)
    response.assertBody(data.serialize())
  })

  test('store user', async ({ client, assert }) => {
    const response = await client.post('users').json({
      name: 'test user',
      email: 'anothertest@inventr.co',
      password: '123456',
      companyName: 'New company',
      relations: ['company']
    })

    const body: Auth = response.body()
    assert.onlyProperties(body, ['token', 'user'])
    assert.containsSubset(body.user, {
      name: 'test user',
      email: 'anothertest@inventr.co'
    })
    assert.equal(body.user.company.name, 'New company')
  })

  test('show user', async ({ client }) => {
    const user = await getUser(['company'])
    const response = await client
      .get(`users/${user.uuid}`)
      .loginAs(user)
      .qs({ 'relations[]': 'company' })
    response.assertBody({ status: true, data: user.serialize() })
  })
})
