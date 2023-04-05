import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  computed,
  hasMany,
  HasMany,
  scope
} from '@ioc:Adonis/Lucid/Orm'
import Company from './Company'
import User from '../People/User'
import PatentCost from './PatentCost'
import { search } from 'adosearch'
import IpPortfolio from './IpPortfolio'

export default class Patent extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column({ serializeAs: 'id' })
  public uuid: string

  @column()
  public title: string

  @column()
  public patentNumber: string

  @column()
  public abstract: string

  @column()
  public applicant: string

  @column()
  public inventor: string

  @column.date()
  public publicationDate: DateTime

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
   * Computed
   */
  @computed()
  public get meta() {
    return this.$extras
  }

  /**
   * Relationships
   */
  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  public creator: BelongsTo<typeof User>

  @hasMany(() => PatentCost, { onQuery: (q) => q.orderBy('transaction_date', 'desc') })
  public costs: HasMany<typeof PatentCost>

  /**
   * Scopes
   */
  public static byUser = scope((query, user?: User) => {
    query.where('company_id', user?.companyId ?? 0)
  })

  public static byPortfolio = scope((query, ipPortfolioIds) => {
    const ipPortfolioQuery = IpPortfolio.query().whereIn('uuid', ipPortfolioIds).select('id')
    query.whereIn('ip_portfolio_id', ipPortfolioQuery)
  })

  public static search = search(this, [
    'title',
    'patentNumber',
    'abstract',
    'applicant',
    'inventor'
  ])
}
