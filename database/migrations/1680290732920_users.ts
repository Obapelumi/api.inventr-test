import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('uuid').unique().defaultTo(this.raw('(UUID())'))
      table.string('name', 255).nullable()
      table.string('email', 255).nullable()
      table.string('password', 180).nullable()
      table.integer('company_id').unsigned().references('id').inTable('companies')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
