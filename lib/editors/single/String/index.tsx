import { rdf, sh } from '../../../helpers/namespaces'
import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'
import { LanguageSelector } from '../../../components/LanguageSelector'

export default class String extends ShaclFormSingleEditorReact<typeof String> {
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