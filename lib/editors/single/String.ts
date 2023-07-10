import { xsd } from '../../helpers/namespaces'
import { GrapoiPointer, Literal } from '../../types'
import { scorer } from '../../core/Scorer'
import factory from 'rdf-ext'
import { html } from 'uhtml'
import { ShaclFormSingleEditorUhtml } from '../../core/ShaclFormSingleEditorUhtml'

export default class String extends ShaclFormSingleEditorUhtml<typeof String> {

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .datatype([xsd('string')], 2)
      .toNumber()
  }

  static createNewObject () {
    return factory.literal('')
  }

  template (inputProps: any) {

    console.log(inputProps)

    return html`
      <input class="form-control" onChange=${(event: Event) => {
        const language = (this.value as Literal).language ? (this.value as Literal).language : undefined
        this.value = this.df.literal((event.target as HTMLInputElement).value, language)
      }} type="text" .value=${this.value?.value ?? ''} />
    `
  }

}