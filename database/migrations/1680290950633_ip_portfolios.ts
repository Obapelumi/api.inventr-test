import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'ip_portfolios'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('uuid').unique().defaultTo(this.raw('(UUID())'))
      table.string('name', 255).nullable()
      table.float('budget', 20, 2).nullable()
      table.boolean('lock_budget').defaultTo(false)
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
