import { rdf, sh } from '../../../helpers/namespaces'
import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'
import { LanguageSelector } from '../../../components/LanguageSelector'

export default class String extends ShaclFormSingleEditorReact<typeof String> {
  template ({ value, language }: { value: string, language: string}) {
    const isMultiLingual = this.shaclPointer.out([sh('datatype')]).terms.some(term => term.equals(rdf('langString')))
    if (!language && isMultiLingual) language = this.form.activeContentLanguage

    console.log(value, this.index)

    return <div className='d-flex'>
      <input className="form-control" onBlur={(event) => {
        this.value = this.df.literal(event.target.value, language)
      }} type="text" defaultValue={value} />

      <LanguageSelector field={this} />
    </div>
  }

}