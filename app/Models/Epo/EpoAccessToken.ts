import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class EpoAccessToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public accessToken: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
