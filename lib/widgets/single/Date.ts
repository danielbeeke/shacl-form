import { ShaclFormWidgetSingle } from '../../core/ShaclFormWidgetSingle'
import { xsd } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { scorer } from '../../core/Scorer'
import factory from 'rdf-ext'
import { html, render } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.

export default class Date extends ShaclFormWidgetSingle<typeof Date> {

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .datatype([xsd('date')], 2)
      .toNumber()
  }

  static createNewObject () {
    return factory.literal('', xsd('date'))
  }

  async connectedCallback () {
    this.render()
  }

  render () {
    render(this, html`
      <input type="date" onChange=${(event: Event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value, xsd('date'))
      }} type="text" .value=${this.value?.value ?? ''} />
    `)
  }

}