import { dash, xsd } from '../../../helpers/namespaces'
import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'

export default class Switch extends ShaclFormSingleEditorReact<typeof Switch> {

  static iri = dash('BooleanSelectEditor').value

  template () {
    const id = this.predicate.value + this.index
    const checked = this.value?.value === 'true'

    return <div className="form-check form-switch" style={{fontSize: 24}}>
      <input className="form-check-input" onChange={(event) => {
        this.value = this.df.literal(event.target.checked.toString(), xsd('boolean'))
      }} type="checkbox" role="switch" checked={checked} id={id} />
      <label className="form-check-label" htmlFor={id}>
      </label>
    </div>
  }

  static showRemove = false
}