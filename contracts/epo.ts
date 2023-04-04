export const EPO_SEARCH_PARAMS = [
  'publicationnumber',
  'inventorandapplicant',
  'titleandabstract'
] as const
export type EpoSearchParams = typeof EPO_SEARCH_PARAMS[number]

export type EpoAuthResponse = {
  'refresh_token_expires_in': string
  'api_product_list': string
  'api_product_list_json': string[]
  'organization_name': 'epo'
  'developer.email': string
  'token_type': 'BearerToken'
  'issued_at': string
  'client_id': string
  'access_token': string
  'application_name': string
  'scope': 'core'
  'expires_in': string
  'refresh_count': string
  'status': 'approved'
}

export type EpoDataFormat = 'docdb' | 'epodoc'

export type EpoDucumentID = { '@document-id-type': EpoDataFormat } & Record<string, { $: string }>

export type EpoTitle = { '$': string; '@lang': string }

export type EpoAbstract = { '@lang': 'en'; 'p': { $: string } }

export type EpoExchangeDocument = {
  'exchange-document': {
    '@system': 'ops.epo.org'
    '@family-id': string
    '@country': string
    '@doc-number': string
    '@kind': string
    'bibliographic-data': {
      'publication-reference': {
        'document-id': EpoDucumentID[]
      }
      'classifications-ipcr': {
        'classification-ipcr': {
          '@sequence': string
          'text': { $: string }
        }
      }
      'patent-classifications': {
        'patent-classification': {
          '@sequence': string
          'classification-scheme': { '@office': string; '@scheme': string }
          'section': { $: string }
          'class': { $: string }
          'subclass': { $: string }
          'main-group': { $: string }
          'subgroup': { $: string }
          'classification-value': { $: string }
          'generating-office': { $: string }
        }[]
      }
      'application-reference': {
        '@doc-id': string
        'document-id': EpoDucumentID[]
      }
      'priority-claims': {
        'priority-claim': {
          '@sequence': string
          '@kind': string
          'document-id': EpoDucumentID[]
        }
      }
      'parties': {
        applicants: {
          applicant: EpoApplicant | EpoApplicant[]
        }
        inventors: {
          inventor: EpoInventor | EpoInventor[]
        }
      }
      'invention-title': EpoTitle | EpoTitle[]
    }
    'abstract': EpoAbstract | EpoAbstract[]
  }
}

export type EpoApplicant = {
  '@sequence': string
  '@data-format': EpoDataFormat
  'applicant-name': { name: { $: string } }
}

export type EpoInventor = {
  '@sequence': string
  '@data-format': EpoDataFormat
  'inventor-name': { name: { $: string } }
}

export type EpoSearchResponse = {
  'ops:world-patent-data': {
    '@xmlns': {
      ops: 'http://ops.epo.org'
      $: 'http://www.epo.org/exchange'
      xlink: 'http://www.w3.org/1999/xlink'
    }
    'ops:biblio-search': {
      '@total-result-count': string
      'ops:query': { '$': string; '@syntax': 'CQL' }
      'ops:range': { '@begin': string; '@end': string }
      'ops:search-result': {
        'exchange-documents': EpoExchangeDocument | EpoExchangeDocument[]
      }
    }
  }
}
