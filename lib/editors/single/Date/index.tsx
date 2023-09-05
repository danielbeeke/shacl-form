import { xsd } from '../../../helpers/namespaces'
import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'
import { InputProps } from '../../../types'

export default class Date extends ShaclFormSingleEditorReact<typeof Date> {
  template ({ value }: InputProps) {
    return <div className='d-flex'>
      {!value ? <label className='empty-label'>No color added</label> : null}
      <input className="form-control" onChange={(event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value, xsd('date'))
      }} type="date" defaultValue={value ?? ''} />

    </div>
  }

}