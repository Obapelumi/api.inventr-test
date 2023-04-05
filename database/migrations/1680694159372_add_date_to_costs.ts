import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patent_costs'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('transaction_date').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('transaction_date')
    })
  }
}
