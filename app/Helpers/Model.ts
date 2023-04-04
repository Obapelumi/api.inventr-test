import Database, {
  ChainableContract,
  DatabaseQueryBuilderContract,
  QueryCallback,
  RawBuilderContract,
  RawQuery,
  StrictValues
} from '@ioc:Adonis/Lucid/Database'
import {
  LucidRow,
  LucidModel,
  ModelQueryBuilderContract,
  RelationQueryBuilderContract,
  RelationshipsContract,
  ExtractModelRelations,
  ModelRelations,
  RelationSubQueryBuilderContract
} from '@ioc:Adonis/Lucid/Orm'
import { scope } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import { string } from '@poppinss/utils/build/helpers'

export type Query<Model extends LucidModel> =
  | ModelQueryBuilderContract<Model>
  | DatabaseQueryBuilderContract<Model>
export type RelationshipQuery<Model extends LucidModel> =
  | ModelQueryBuilderContract<Model>
  | RelationQueryBuilderContract<Model, any>
  | RelationSubQueryBuilderContract<Model>
export type Column = null | undefined | string | number | boolean | symbol | bigint | DateTime

export type ExtractModelColumns<Model extends LucidRow> = {
  [Key in keyof Model]: Model[Key] extends Column ? Key : never
}[keyof Omit<Model, keyof LucidRow>]

export type ScopeWhereInQuery =
  | StrictValues[]
  | ChainableContract
  | QueryCallback<ChainableContract>
  | RawBuilderContract
  | RawQuery

export const listRelations = <Model extends LucidModel>(model: Model) =>
  [...model.$relationsDefinitions.keys()] as ExtractModelRelations<InstanceType<Model>>[]

export const listColumns = <Model extends LucidModel>(model: Model) =>
  Array.from(model.$columnsDefinitions.values()).map(
    (column) => column.columnName
  ) as ExtractModelColumns<InstanceType<Model>>[]

export const preloadRelations = <Model extends LucidModel>(
  query: RelationshipQuery<Model>,
  relations?: ExtractModelRelations<InstanceType<Model>>[]
) => relations?.forEach((relationship) => query.preload(relationship))

export const countRelations = <Model extends LucidModel>(
  query: RelationshipQuery<Model>,
  relations?: ExtractModelRelations<InstanceType<Model>>[],
  callbacks?: {
    [P in ExtractModelRelations<InstanceType<Model>>]?: (
      countQuery: InstanceType<Model>[P] extends ModelRelations
        ? InstanceType<Model>[P]['subQuery']
        : never
    ) => void
  }
) =>
  relations?.forEach((relationship: any) => {
    query.withCount(relationship, (countQuery) => {
      const callback = callbacks && callbacks[relationship]
      callback && callback(countQuery)
      countQuery.as(`${relationship}Count`)
    })
  })

export const sumRelations = <Model extends LucidModel>(
  query: RelationshipQuery<Model>,
  sums?: string[],
  callbacks?: {
    [P in ExtractModelRelations<InstanceType<Model>>]?: (
      countQuery: InstanceType<Model>[P] extends ModelRelations
        ? InstanceType<Model>[P]['subQuery']
        : never
    ) => void
  }
) =>
  sums?.forEach((sum: string) => {
    const [relationship, field] = sum.split('.')
    query.withAggregate(relationship as any, (sumQuery) => {
      const callback = callbacks && callbacks[relationship]
      callback && callback(sumQuery)
      const dbField = string.snakeCase(field)
      sumQuery.sum(dbField).as(string.camelCase(`${relationship}_${field}Sum`))
    })
  })

export const nestedOrderBy = scope((query, column: string, order?: 'asc' | 'desc') => {
  const sections = column.split('.')
  column = sections[sections.length - 1]
  sections.splice(sections.length - 1, 1)
  queryNestedRelations(query, query.model, sections, (q) => q.orderBy(column, order))
})

/**
 * Sample Output Query
 * collectors.collections.name generates:
 * subQuery = Database.from('collectors')
 * subquery1 = Database.from('collections').select('collectors.ollector_id').where('name', 'LIKE', `%search%`)
 * subQuery.whereIn('collectors.id', subquery1)
 * subQuery.select('collectors.id')
 * subQuery = Database.from('collector_user').whereIn('collector_id', subQuery).select('user_id')
 * query.whereIn('users.id', subQuery)
 */
export function queryNestedRelations<Model extends LucidModel>(
  query: Query<Model>,
  model: Model,
  sections: string[],
  onSubQuery?: (subQuery: Query<Model>) => any,
  onQuery?: (query: Query<Model>) => (column: any, subQuery: Query<Model>) => any
) {
  if (sections.length < 1) {
    if (onSubQuery) {
      onSubQuery(query)
    }
    return
  }
  const relation: any = sections[0]
  const next: any = sections[1]
  sections.splice(0, 1)
  const relationship: RelationshipsContract = new model().related(relation).relation
  if (!relationship) {
    throw new Error(`${relation} does not exist on model ${model.name}`)
  }
  const relatedTable = relationship.relatedModel().table
  let subQuery = Database.from(relatedTable)
  // if a nested relation exists then recursively modify the subquery otherwise run the specified subQuery
  if (next) {
    queryNestedRelations(subQuery, relationship.relatedModel(), sections, onSubQuery, onQuery)
  } else if (onSubQuery) {
    onSubQuery(subQuery)
  }
  let localKey = 'id'
  if (relationship.type === 'belongsTo') {
    subQuery.select(`${relatedTable}.${relationship.localKey}`)
    localKey = relationship['foreignKeyColumName']
  } else if (relationship.type === 'hasMany' || relationship.type === 'hasOne') {
    subQuery.select(`${relatedTable}.${relationship['foreignKeyColumName']}`)
    localKey = relationship.localKey
  } else if (relationship.type === 'manyToMany') {
    subQuery.select(`${relatedTable}.${relationship.relatedKey}`)
    subQuery = Database.from(relationship.pivotTable)
      .whereIn(`${relationship.pivotTable}.${relationship.pivotRelatedForeignKey}`, subQuery)
      .select(`${relationship.pivotTable}.${relationship.pivotForeignKey}`)
    localKey = relationship.localKey
  }
  const modelColumn: any = `${model.table}.${localKey}`
  if (onQuery) {
    query[onQuery(query).name](modelColumn, subQuery)
  } else {
    query.whereIn(modelColumn, subQuery)
  }
}

export async function restore(model: LucidModel, id: number) {
  await Database.from(model.table).where('id', id).update('deleted_at', null)
  return model.findOrFail(id)
}

export async function softDelete(row: LucidRow) {
  row['deletedAt'] = DateTime.local()
  await row.save()
}

export const softDeleteQuery = (query: ModelQueryBuilderContract<LucidModel>, isDeleted = true) => {
  const column = `${query.model.table}.deleted_at`
  if (isDeleted) {
    query.whereNotNull(column)
  } else {
    query.whereNull(column)
  }
}

export const mapBy = <Row extends LucidRow, V>(rows: Row[], key: (row: Row) => V) =>
  new Map<V | undefined, Row>(rows.map((row) => [key(row), row]))

export const enumKeys = <E extends Record<string, unknown>>(enu: E) =>
  Object.keys(enu) as (keyof E)[]

export const enumSearch =
  <E extends Record<string, unknown>>(enu: E) =>
  (search: string) => {
    const trimmedSearch = search.trim().toLowerCase()
    const key = enumKeys(enu).find((k: string) => k.match(trimmedSearch))
    if (!key) return
    return enu[key]
  }
