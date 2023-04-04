import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patents'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('uuid').unique().defaultTo(this.raw('(UUID())'))
      table.string('title', 255).nullable()
      table.string('patent_number', 255).nullable()
      table.text('abstract').nullable()
      table.string('applicant', 255).nullable()
      table.string('inventor', 255).nullable()
      table.dateTime('publication_date').nullable()
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
