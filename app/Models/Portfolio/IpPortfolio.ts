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
import Patent from './Patent'
import PatentCost from './PatentCost'
import User from '../People/User'
import { search } from 'adosearch'

export default class IpPortfolio extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column({ serializeAs: 'id' })
  public uuid: string

  @column()
  public name: string

  @column()
  public budget: number

  @column()
  public lockBudget: boolean

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

  @hasMany(() => Patent)
  public patents: HasMany<typeof Patent>

  @hasMany(() => PatentCost)
  public patentCosts: HasMany<typeof PatentCost>

  /**
   * Scopes
   */
  public static byUser = scope((query, user?: User) => {
    query.where('company_id', user?.companyId ?? 0)
  })

  public static search = search(this, ['name'])
}
