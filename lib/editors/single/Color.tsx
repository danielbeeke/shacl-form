import { shFrm } from '../../helpers/namespaces'
import factory from 'rdf-ext'
import { ShaclFormSingleEditorReact } from '../../core/ShaclFormSingleEditorReact'

export default class Color extends ShaclFormSingleEditorReact<typeof Color> {

  static iri = shFrm('Color').value

  static createNewObject () {
    return factory.literal('')
  }

  template () {

    return <div className='d-flex'>
      {!this.value.value ? <label className='empty-label'>No color added</label> : null}
      <input className="form-control" onChange={(event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value)
      }} type="color" defaultValue={this.value?.value ?? ''} />

    </div>
  }

}