import EpoAccessToken from 'App/Models/Epo/EpoAccessToken'
import { DateTime } from 'luxon'
import Axios, { AxiosError } from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import { Buffer } from 'buffer'
import { Exception } from '@adonisjs/core/build/standalone'
import {
  EpoAuthResponse,
  EpoExchangeDocument,
  EpoSearchParams,
  EpoSearchResponse
} from 'Contracts/epo'

const BASE_URL = 'https://ops.epo.org'

export default class Epo {
  public static async request() {
    return new Epo().axios()
  }

  public static handleAxiosError(error: AxiosError) {
    throw new Exception(`EPO Error: ${error.message}`, error.response?.status)
  }

  public static async search(
    text: string,
    searchParams: EpoSearchParams[],
    [start, end]: [number, number],
    savedPatents?: Set<string>
  ) {
    const epoRequest = await Epo.request()
    const queries: string[] = searchParams.map((param) => {
      switch (param) {
        case 'publicationnumber':
          return `${param}=${text}`
        default:
          return `${param} all "${text}"`
      }
    })
    const response = await epoRequest
      .get<EpoSearchResponse>('rest-services/published-data/search/full-cycle', {
        params: { q: queries.join(' or '), Range: `${start}-${end}` }
      })
      .catch(Epo.handleAxiosError)

    const responseData = response!.data

    const totalResultsCount = Number(
      responseData['ops:world-patent-data']['ops:biblio-search']['@total-result-count']
    )
    const currentRangeEnd = Number(
      responseData['ops:world-patent-data']['ops:biblio-search']['ops:range']['@end']
    )
    const hasMore = Math.min(2_000, totalResultsCount) > currentRangeEnd
    const results =
      responseData['ops:world-patent-data']['ops:biblio-search']['ops:search-result'][
        'exchange-documents'
      ]

    if (!Array.isArray(results)) {
      return { hasMore, data: [Epo.mapSearchResult(results)] }
    }

    const data = results.map((result) => Epo.mapSearchResult(result, savedPatents))

    return { hasMore, data }
  }

  public static mapSearchResult(result: EpoExchangeDocument, savedPatents?: Set<string>) {
    const titleArray = result['exchange-document']['bibliographic-data']?.['invention-title']
    const title = Array.isArray(titleArray)
      ? titleArray.find((t) => t['@lang']?.toLowerCase() === 'en')?.$
      : titleArray?.$
    const abstractArray = result['exchange-document']?.abstract
    const abstract = Array.isArray(abstractArray) ? abstractArray[0]?.p?.$ : abstractArray?.p?.$
    const publicationDate = DateTime.fromFormat(
      result['exchange-document']['bibliographic-data']?.['publication-reference']?.[
        'document-id'
      ]?.find(Boolean)?.date?.$ ?? '',
      'yyyyMMdd'
    )
    const patentNumber =
      result['exchange-document']['@country'] + result['exchange-document']['@doc-number']
    const applicantArray =
      result['exchange-document']['bibliographic-data']?.parties?.applicants?.applicant
    const applicant = Array.isArray(applicantArray)
      ? applicantArray
          .map((a) => a['applicant-name']?.name?.$)
          .join(', ')
          .substring(0, 250)
      : applicantArray?.['applicant-name']?.name?.$
    const inventorArray =
      result['exchange-document']['bibliographic-data']?.parties?.inventors?.inventor
    const inventor = Array.isArray(inventorArray)
      ? inventorArray
          .map((i) => i['inventor-name']?.name?.$)
          .join(', ')
          .substring(0, 250)
      : inventorArray?.['inventor-name']?.name?.$
    const saved = savedPatents?.has(patentNumber) ?? false
    return { title, abstract, patentNumber, applicant, inventor, publicationDate, saved }
  }

  private get encodedCredentials() {
    return Buffer.from(`${Env.get('EPO_CLIENT_KEY')}:${Env.get('EPO_SECRET_KEY')}`).toString(
      'base64'
    )
  }

  private async axios() {
    const epoAccessToken = await this.getAccessToken()
    return Axios.create({
      baseURL: BASE_URL,
      headers: {
        Authorization: `Bearer ${epoAccessToken.accessToken}`,
        Accept: 'application/json'
      }
    })
  }

  private async getAccessToken() {
    let epoAccessToken = await EpoAccessToken.query()
      .where('created_at', '>', DateTime.now().minus({ minutes: 20 }).toSQL())
      .first()

    if (!epoAccessToken) {
      const accessToken = await this.fetchAccessToken()
      await EpoAccessToken.query().delete()
      epoAccessToken = await EpoAccessToken.create({ accessToken })
    }
    return epoAccessToken
  }

  private async fetchAccessToken() {
    const axios = Axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Basic ${this.encodedCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const response = await axios
      .post<EpoAuthResponse>(
        'auth/accesstoken',
        new URLSearchParams({ grant_type: 'client_credentials' })
      )
      .catch(Epo.handleAxiosError)
    return response?.data.access_token
  }
}
