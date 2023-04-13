import type { Literal } from 'n3'
import { ShaclFormField } from '../ShaclFormField'
import { xsd, sh } from '../namespaces'
import { GrapoiPointer } from '../types'

// Just here for a quick example.
// You could use React, Vue, Angular, basically anything and export it to a customElement.
import { html, render } from 'uhtml'

export default class String extends ShaclFormField<typeof String> {

  static elementName = 'field-string'

  static applies(shaclPointer: GrapoiPointer): boolean {
    const datatypes = shaclPointer.out([sh('datatype')]).values

    console.log([...shaclPointer.out().quads()])

    return datatypes.some(datatype => [
      xsd('langString').value,
      xsd('string').value
    ].includes(datatype))
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