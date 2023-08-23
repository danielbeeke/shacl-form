import { xsd, dash, rdf, sh } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { scorer } from '../../core/Scorer'
import factory from 'rdf-ext'
import { ShaclFormSingleEditorReact } from '../../core/ShaclFormSingleEditorReact'
import { LanguageSelector } from '../../components/LanguageSelector'
import TextareaAutosize from 'react-textarea-autosize';

export default class Text extends ShaclFormSingleEditorReact<typeof Text> {

  static iri = dash('TextAreaEditor').value

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .datatype([xsd('string'), rdf('langString')])
      .has(dash('singleLine'), factory.literal('false', xsd('boolean')))
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
      <TextareaAutosize minRows={3} className="form-control" onBlur={(event) => {
        this.value = this.df.literal((event.target as HTMLTextAreaElement).value, language)
      }} defaultValue={this.value?.value ?? ''} />

    <LanguageSelector field={this} />

    </div>
  }

}