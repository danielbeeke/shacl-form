import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { xsd } from '../helpers/namespaces'
import { GrapoiPointer, Literal } from '../types'
import { scorer } from '../core/Scorer'
import factory from 'rdf-ext'
import { html, render } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.

export default class Date extends ShaclFormWidget<typeof Date> {

  static elementName = 'date'

  static score(shaclPointer: GrapoiPointer) {
    return scorer(shaclPointer)
      .datatypes([xsd('date')])
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
        const language = (this.value as Literal).language ? (this.value as Literal).language : undefined
        this.value = this.df.literal((event.target as HTMLInputElement).value, language)
      }} type="text" .value=${this.value?.value ?? ''} />
    `)
  }

}