import { rdf, sh } from '../../../helpers/namespaces'
import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'
import { LanguageSelector } from '../../../components/LanguageSelector'
import TextareaAutosize from 'react-textarea-autosize';

export default class Text extends ShaclFormSingleEditorReact<typeof Text> {
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