import { NamedNode } from '../../types'
import { schema, xsd } from '../../helpers/namespaces'
import { html, render } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.
import factory from 'rdf-ext'
import { iso31661 } from 'iso-3166'

import { ShaclFormWidgetMerged } from '../../core/ShaclFormWidgetMerged'

export default class Address extends ShaclFormWidgetMerged<typeof Address> {

  static supportedCombinations: Array<{ [key: string]: NamedNode }> = [
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

  public showAdvanced = false

  render () {

    const labelsAndValues = this.getValuesWithLabels()

    render(this, html`

      <p>
        ${labelsAndValues.map(({ label, value, key }) => {
          let valueText = value.value

          // Display ISO country codes as labels.
          if (key === 'country') {
            const valueTextReplacement = iso31661.find(item => valueText.length === 2 ? item.alpha2 === valueText : item.alpha3 === valueText)
            if (valueTextReplacement) valueText = valueTextReplacement.name
          }

          return html`<label>${label}</label>: ${valueText}<br />`
        })}
      </p>

      ${this.showAdvanced ? this.combinedFields : html`
        <input type="search" onChange=${async (event: InputEvent) => {
          const results = await this.form.options.plugins.geocoder.search((event.target as HTMLInputElement).value)
          if (results) {
            const street = `${results.street ?? ''} ${results.number ?? ''}`.trim()

            this.setValues({
              street: street ? factory.literal(street) : undefined,
              postalCode: results.postalCode ? factory.literal(results.postalCode) : undefined,
              locality: results.locality ? factory.literal(results.locality) : undefined,
              region: results.region ? factory.literal(results.region) : undefined,
              country: results.country ? factory.literal(results.country) : undefined,
              latitude: results.latitude ? factory.literal(results.latitude.toString(), xsd('double')) : undefined,
              longitude: results.longitude ? factory.literal(results.longitude.toString(), xsd('double')) : undefined
            })
          }
        }} />      
      `}

      <button onClick=${() => {
        this.showAdvanced = !this.showAdvanced
        this.render()
      }}>${this.showAdvanced ? 'Hide advanced' : 'Show advanced'}</button>

    `)
  } 
}