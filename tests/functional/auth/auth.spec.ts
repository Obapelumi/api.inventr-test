import TestUtils from '@ioc:Adonis/Core/TestUtils'
import { test } from '@japa/runner'
import { Auth, getUser, registerUser } from '../base'

test('display welcome page', async ({ client }) => {
  const response = await client.get('/')

  response.assertStatus(200)
  response.assertBodyContains({ message: 'Hi! Spread Innovation :)' })
})

test.group('Auth', (group) => {
  group.setup(registerUser)
  group.teardown(TestUtils.db().truncate)

  test('login an existing user', async ({ client, assert }) => {
    const user = await getUser(['company'])
    const response = await client
      .post('/auth/login')
      .json({ username: 'test@inventr.co', password: '123456', relations: ['company'] })

    const body: Auth = response.body()
    assert.onlyProperties(body, ['token', 'user'])
    assert.deepEqual(body.user, user.serialize())
  })

  test('does not login missing user', async ({ client }) => {
    const response = await client
      .post('/auth/login')
      .json({ username: 'missing@inventr.co', password: '123456' })
    response.assertStatus(400)
  })

  test('logout user', async ({ client }) => {
    const user = await getUser(['company'])
    const response = await client.post('auth/logout').loginAs(user)
    response.assertBody({ message: 'user logged out' })
  })

  test('get current user', async ({ client }) => {
    const user = await getUser(['company'])
    const response = await client.get('me').loginAs(user).qs({ 'relations[]': 'company' })
    response.assertBody({ data: user.serialize() })
  })
})
