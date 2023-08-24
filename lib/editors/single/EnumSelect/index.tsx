import { sh } from '../../../helpers/namespaces'
import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'

export default class EnumSelect extends ShaclFormSingleEditorReact<typeof EnumSelect> {
  template () {
    const options = [
      ...this.shaclPointer
        .out([sh('in')])
        .list()
    ].map(pointer => pointer.value)

    return <div className='d-flex'>
      <select className="form-select" defaultValue={this.value?.value} onChange={(event: any) => {
        this.value = this.df.literal(event.target.value)
      }}>
        {this.value?.value ? null : <option>- Select -</option>}
        {options.map(option => <option value={option} key={option}>{option}</option>)}
      </select>
    </div>
  }

}