import { NamedNode } from '../../../types'
import { schema, shFrm } from '../../../helpers/namespaces'

export const iri = shFrm('Address').value

export const supportedCombinations: Array<{ [key: string]: NamedNode }> = [
  {
    street: schema('streetAddress'),
    postalCode: schema('postalCode'),
    locality: schema('addressLocality'),
    'latitude?': schema('latitude'),
    'longitude?': schema('longitude'),
    'region?': schema('addressRegion'),
    'country?': schema('addressCountry')
  }
]