import { UnifiedGeoSearch } from '../../types'
import { GeocoderBase } from './GeoCoderBase'
import { iso31661 } from 'iso-3166'

export class PositionstackGeocoder extends GeocoderBase {

  private apiKey: string
  private useHttps: boolean
  private proxy: string

  constructor (apiKey: string, proxy: string = '', useHttps: boolean = false) {
    super()
    this.apiKey = apiKey
    this.useHttps = useHttps
    this.proxy = proxy
  }

  async search(searchTerm: string): Promise<UnifiedGeoSearch | void> {
    try {
      const response = await fetch(`${this.proxy}http${this.useHttps ? 's' : ''}://api.positionstack.com/v1/forward?access_key=${this.apiKey}&query=${searchTerm}`)
      const { data: [ item ] } = await response.json()
  
      const { locality, latitude, longitude, number, country_code: country, region, postal_code: postalCode, street } = item

      const countryObject = iso31661.find(item => item.alpha3 === country)

      return {
        locality,
        latitude,
        longitude,
        number,
        region,
        country: countryObject?.alpha2 ?? countryObject?.alpha3 ?? country,
        postalCode,
        street
      }
    }
    catch (exception) {
      console.log(exception)
    }
  }

}