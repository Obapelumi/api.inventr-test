/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

/**
 * Auth
 */
Route.group(() => {
  Route.get('/', 'AuthController.index')
  Route.get('me', 'AuthController.me').middleware(['auth'])
  Route.post('auth/login', 'AuthController.userLogin')
  Route.post('auth/logout', 'AuthController.userLogout').middleware(['auth'])
}).namespace('App/Controllers/Http/Auth')

/**
 * People
 */
Route.resource('users', 'People/UsersController')
  .apiOnly()
  .middleware({
    index: ['auth'],
    create: [],
    update: ['auth'],
    destroy: ['auth']
  })

/**
 * Portfolio
 */

Route.group(() => {
  Route.resource('companies', 'CompaniesController').only(['index', 'show'])
  Route.resource('ip-portfolios', 'IpPortfoliosController').apiOnly()
  Route.get('patent-search', 'PatentsController.search').as('patents.search')
  Route.resource('patents', 'PatentsController').only(['index', 'store', 'show', 'destroy'])
  Route.resource('patent-costs', 'PatentCostsController').only(['index', 'store', 'show'])
})
  .namespace('App/Controllers/Http/Portfolio')
  .middleware(['auth'])
