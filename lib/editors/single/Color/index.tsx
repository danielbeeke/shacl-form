import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'

export default class Color extends ShaclFormSingleEditorReact<typeof Color> {
  template () {
    return <div className='d-flex'>
      {!this.value.value ? <label className='empty-label'>No color added</label> : null}
      <input className="form-control" onChange={(event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value)
      }} type="color" defaultValue={this.value?.value ?? ''} />

    </div>
  }

}