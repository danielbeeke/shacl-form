import { UnifiedGeoSearch } from '../../types'

export abstract class GeocoderBase {

  abstract search (searchTerm: string): Promise<UnifiedGeoSearch | void>

}