import { xsd, dash, rdf, sh } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { scorer } from '../../core/Scorer'
import factory from 'rdf-ext'
import { ShaclFormSingleEditorReact } from '../../core/ShaclFormSingleEditorReact'
import { LanguageSelector } from '../../components/LanguageSelector'

export default class String extends ShaclFormSingleEditorReact<typeof String> {

  static iri = dash('TextFieldEditor').value

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .datatype([xsd('string'), rdf('langString')])
      .toNumber()
  }

  static createNewObject (form: any, shaclPointer: GrapoiPointer) {
    const isMultiLingual = shaclPointer.out([sh('datatype')]).terms.some(term => term.equals(rdf('langString')))
    return factory.literal('', isMultiLingual ? form.activeContentLanguage : undefined)
  }

  template () {
    const isMultiLingual = this.shaclPointer.out([sh('datatype')]).terms.some(term => term.equals(rdf('langString')))
    const language = isMultiLingual ? this.form.activeContentLanguage : undefined

    return <div className='d-flex'>
      <input className="form-control" onBlur={(event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value, language)
      }} type="text" defaultValue={this.value?.value ?? ''} />

      <LanguageSelector field={this} />

    </div>
  }

}