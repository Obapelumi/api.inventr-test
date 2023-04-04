import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patent_costs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('uuid').unique().defaultTo(this.raw('(UUID())'))
      table.tinyint('type', 10).nullable()
      table.float('amount', 20, 2).nullable()
      table.integer('patent_id').unsigned().references('id').inTable('patents')
      table.integer('ip_portfolio_id').unsigned().references('id').inTable('ip_portfolios')
      table.integer('company_id').unsigned().references('id').inTable('companies')
      table.integer('created_by').unsigned().references('id').inTable('users')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
