import { DateTime } from 'luxon'
import { BaseModel, column, computed, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from '../People/User'
import IpPortfolio from './IpPortfolio'
import Patent from './Patent'
import PatentCost from './PatentCost'

export default class Company extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column({ serializeAs: 'id' })
  public uuid: string

  @column()
  public name: string

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
  @hasMany(() => IpPortfolio)
  public ipPortfolios: HasMany<typeof IpPortfolio>

  @hasMany(() => Patent)
  public patents: HasMany<typeof Patent>

  @hasMany(() => PatentCost)
  public patentCosts: HasMany<typeof PatentCost>

  @hasMany(() => User)
  public users: HasMany<typeof User>
}
