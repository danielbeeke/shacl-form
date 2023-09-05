import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'
import { InputProps } from '../../../types'

export default class Color extends ShaclFormSingleEditorReact<typeof Color> {
  template ({ value }: InputProps) {
    return <div className='d-flex'>
      {!value ? <label className='empty-label'>No color added</label> : null}
      <input className="form-control" onChange={(event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value)
      }} type="color" defaultValue={value ?? ''} />

    </div>
  }

}