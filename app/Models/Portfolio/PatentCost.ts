import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, scope } from '@ioc:Adonis/Lucid/Orm'
import PatentCostType from './PatentCostType'
import Company from './Company'
import User from '../People/User'
import Patent from './Patent'
import { search } from 'adosearch'
import { string } from '@ioc:Adonis/Core/Helpers'

export default class PatentCost extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column({ serializeAs: 'id' })
  public uuid: string

  @column({ serialize: (v) => PatentCostType[v] })
  public type: PatentCostType

  @column()
  public amount: number

  @column({ serializeAs: null })
  public patentId: number

  @column({ serializeAs: null })
  public ipPortfolioId: number

  @column({ serializeAs: null })
  public companyId: number

  @column({ serializeAs: null })
  public createdBy: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  /**
   * Relationships
   */
  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  public creator: BelongsTo<typeof User>

  @belongsTo(() => Patent)
  public patent: BelongsTo<typeof Patent>

  /**
   * Scopes
   */
  public static byUser = scope((query, user?: User) => {
    query.where('company_id', user?.companyId ?? 0)
  })

  public static byPatent = scope((query, patentIds) => {
    const patentsQuery = Patent.query().whereIn('uuid', patentIds).select('id')
    query.whereIn('patent_id', patentsQuery)
  })

  public static search = search(
    this,
    ['patent.title', 'patent.applicant', 'patent.inventor', 'type'],
    { type: (cT: string) => PatentCostType[string.snakeCase(cT.toLowerCase())] }
  )
}
