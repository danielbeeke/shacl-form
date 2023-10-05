import { rdf, sh } from '../../../helpers/namespaces'
import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'
import { LanguageSelector } from '../../../components/LanguageSelector'
import { InputProps } from '../../../types'

export default class String extends ShaclFormSingleEditorReact<typeof String> {
  template ({ value, language }: InputProps) {
    const isMultiLingual = this.shaclPointer.out([sh('datatype')]).terms.some(term => term.equals(rdf('langString')))
    if (!language && isMultiLingual) language = this.form.activeContentLanguage

    console.log(value)

    return <div className='d-flex'>
      <input className="form-control" onBlur={(event) => {
        this.value = this.df.literal(event.target.value, language)
      }} type="text" defaultValue={value} />

      <LanguageSelector field={this} />
    </div>
  }

}