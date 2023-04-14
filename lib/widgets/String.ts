import { ShaclFormField } from '../ShaclFormField'
import { xsd } from '../namespaces'
import { GrapoiPointer } from '../types'
import { scorer } from '../Scorer'
import type { Literal } from 'n3'
import { html, render } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.

export default class String extends ShaclFormField<typeof String> {

  static elementName = 'string'

  static score(shaclPointer: GrapoiPointer) {
    return scorer(shaclPointer)
      .datatypes([xsd('langString'), xsd('string')])
      .toNumber()
  }

  async connectedCallback () {
    this.render()
  }

  render () {
    render(this, html`<input onChange=${(event: Event) => {
      const { predicate, object } = this.value
      const language = (object as Literal).language
      const newObject = this.df.literal((event.target as HTMLInputElement).value, language)

      // const inLanguageList = this.shaclPointer.out([sh('languageIn')]).list()
      // const languages = [...inLanguageList ?? []].map((shaclPointer: any) => shaclPointer.term.value)

      this.dataPointer
        .deleteOut([predicate], [object])
        .addOut([predicate], [newObject])

    }} type="text" value=${this.value?.object.value} />`)
  }

}