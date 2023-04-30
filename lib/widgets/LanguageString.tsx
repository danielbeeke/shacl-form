import { ShaclFormWidgetReact } from '../core/ShaclFormWidgetReact'
import { xsd } from '../helpers/namespaces'
import { GrapoiPointer, Literal } from '../types'
import { scorer } from '../core/Scorer'
import factory from 'rdf-ext'

export default class LanguageString extends ShaclFormWidgetReact<typeof LanguageString> {

  static elementName = 'language-string'

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .datatype([xsd('langString')])
      .toNumber()
  }

  static createNewObject () {
    return factory.literal('', 'en')
  }

  template () {
    const language = (this.value as Literal).language ? (this.value as Literal).language : undefined

    return (
    <>
      <input defaultValue={this.value.value ?? ''} onBlur={(event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value, language)
      }} />
      {this.form.activeContentLanguages.length > 1 ? (
        <select value={language} onChange={(event) => {
          this.value = this.df.literal(this.value.value, event.target.value)
        }}>
          {this.form.activeContentLanguages.map(languageCode => (<option key={languageCode} value={languageCode}>{languageCode}</option>))}
        </select>
      ) : (this.form.activeContentLanguages[0])}
    </>
    )
  }

}