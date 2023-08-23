import { sh, rdf } from '../helpers/namespaces'
import { ShaclFormSingleEditor } from '../core/ShaclFormSingleEditor'

export function LanguageSelector ({ field }: { field: ShaclFormSingleEditor<any> }) {
  const isMultiLingual = field.shaclPointer.out([sh('datatype')]).terms.some(term => term.equals(rdf('langString')))
  const language = isMultiLingual ? field.form.activeContentLanguage : undefined

  return isMultiLingual && field.form.activeContentLanguages.length > 1 ? (
    <select value={language} onChange={(event) => {
      field.value = field.df.literal(field.value.value, event.target.value)
    }}>
      {field.form.activeContentLanguages.map((languageCode: string) => (<option key={languageCode} value={languageCode}>{languageCode}</option>))}
    </select>
  ) : <div></div>
}