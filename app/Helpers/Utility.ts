import Route from '@ioc:Adonis/Core/Route'
import { RequestContract } from '@ioc:Adonis/Core/Request'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { StrictValues, TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export const getCurrentRoute = (request: RequestContract) => {
  return Route.match(request.url(), request.method())?.route
}

export const toSet = <T, S>(logs: T[], fn: (log: T) => S): Set<S> => new Set(logs.map(fn))

export const toMoney = (value = 0, currency = 'NGN', language = 'en-NG') => {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  }).format(value)
}

export const randomNumber = (length: number) =>
  Math.random()
    .toString()
    .slice(2, length + 2)

export const generateUniqueCodes = async <T extends StrictValues, M extends LucidModel>(options: {
  count: Number
  key: keyof InstanceType<M>
  codeGenFxn: () => T
  model: M
  trx?: TransactionClientContract
}) => {
  let uniqueCodes: T[] = []
  while (uniqueCodes.length < options.count) {
    uniqueCodes.push(options.codeGenFxn())
  }

  // ensure codes are unique
  let takenCodes: T[] = []
  do {
    takenCodes = await options.model
      .query({ client: options.trx })
      .whereIn(options.key as string, uniqueCodes)
      .then((codes) => codes.map((code) => code[options.key as string]))

    for (const index in uniqueCodes) {
      if (takenCodes.indexOf(takenCodes[index]) > -1) {
        takenCodes[index] = options.codeGenFxn()
      }
    }
  } while (takenCodes.length > 0)

  return uniqueCodes
}

export const decimalPlaces = (value: number, decimalPlaces: number) => {
  const denominator = Math.pow(10, decimalPlaces)
  return Math.round(value * denominator) / denominator
}
