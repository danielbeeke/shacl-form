import { ShaclFormSingleEditor } from '../../core/ShaclFormSingleEditor'
import { xsd } from '../../helpers/namespaces'
import { GrapoiPointer, Literal } from '../../types'
import { scorer } from '../../core/Scorer'
import factory from 'rdf-ext'
import { html, render } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.

export default class String extends ShaclFormSingleEditor<typeof String> {

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .datatype([xsd('string')], 2)
      .toNumber()
  }

  static createNewObject () {
    return factory.literal('')
  }

  render () {
    render(this, html`
      <input onChange=${(event: Event) => {
        const language = (this.value as Literal).language ? (this.value as Literal).language : undefined
        this.value = this.df.literal((event.target as HTMLInputElement).value, language)
      }} type="text" .value=${this.value?.value ?? ''} />
    `)
  }

}