import { rdf } from '../../../helpers/namespaces'
import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'

export default class Number extends ShaclFormSingleEditorReact<typeof Number> {
  template () {
    return <div className='d-flex'>
      <input className="form-control" onBlur={(event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value, rdf('number'))
      }} type="number" defaultValue={this.value?.value ?? ''} />

    </div>
  }

}