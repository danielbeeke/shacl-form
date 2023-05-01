import { ShaclFormWidgetSingleReact } from '../../core/ShaclFormWidgetSingleReact'
import { xsd } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { scorer } from '../../core/Scorer'
import factory from 'rdf-ext'

export default class LanguageString extends ShaclFormWidgetSingleReact<typeof LanguageString> {

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .datatype([xsd('langString')])
      .toNumber()
  }

  static createNewObject (form: any) {
    return factory.literal('', form.activeContentLanguage)
  }

  template () {
    const language = this.form.activeContentLanguage

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
      ) : null}
    </>
    )
  }

}