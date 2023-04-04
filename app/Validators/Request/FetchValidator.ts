import { HttpContext } from '@adonisjs/http-server/build/standalone'
import { rules, schema, ParsedTypedSchema } from '@ioc:Adonis/Core/Validator'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { listColumns, listRelations } from 'App/Helpers/Model'
import { EntityKey } from 'App/Models/Base/Entity'

export type FetchType = FetchValidator['validators']

export const fetchValidator = async <T = Record<string, any>>(
  request: HttpContext['request'],
  model: LucidModel
) => {
  return (await request.validate(new FetchValidator(model))) as ParsedTypedSchema<
    FetchType['common'] & T
  >['props']
}

export default class FetchValidator {
  constructor(
    protected model: LucidModel,
    protected options?: {
      entity?: EntityKey
      relations?: string[]
      sortColumns?: string[]
    }
  ) {}

  private get validators() {
    return {
      common: {
        active: schema.boolean.optional(),
        companyIds: schema.array.optional().members(schema.number()),
        counts: schema.enumSet.optional(listRelations(this.model)),
        sums: schema.array.optional().members(schema.string()),
        isDeleted: schema.boolean.optional(),
        page: schema.number.optional(),
        perPage: schema.number.optional(),
        range: schema.array
          .optional([rules.minLength(2), rules.maxLength(2), rules.requiredIfExists('rangeBy')])
          .anyMembers(),
        rangeBy: schema.enum.optional(listColumns(this.model), [rules.requiredIfExists('range')]),
        relations: schema.enumSet.optional(listRelations(this.model)),
        search: schema.string.optional(),
        sortBy: schema.enum.optional(listColumns(this.model), [
          rules.requiredIfExists('sortOrder')
        ]),
        sortOrder: schema.enum.optional(['asc', 'desc'] as const, [
          rules.requiredIfExists('sortBy')
        ])
      },
      companies: {},
      ip_portfolios: {},
      patent_costs: { patentIds: schema.array.optional().members(schema.string()) },
      patents: { ipPortfolioIds: schema.array.optional().members(schema.string()) },
      users: {}
    }
  }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   */
  public schema = schema.create({
    ...this.validators.common,
    ...(this.validators[this.options?.entity || this.model.table] || {})
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {}
}
