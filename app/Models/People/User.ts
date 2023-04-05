import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, BelongsTo, belongsTo, scope } from '@ioc:Adonis/Lucid/Orm'
import Company from '../Portfolio/Company'
import { search } from 'adosearch'

export default class User extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column({ serializeAs: 'id' })
  public uuid: string

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  public companyId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  /**
   * Relationships
   */
  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  /**
   * Scopes
   */
  public static byUser = scope((query, user?: User) => {
    query.where('company_id', user?.companyId ?? 0)
  })

  public static search = search(this, ['name', 'email', 'company.name'])
}
