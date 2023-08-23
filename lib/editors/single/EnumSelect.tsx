import { sh, dash } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { scorer } from '../../core/Scorer'
import factory from 'rdf-ext'
import { ShaclFormSingleEditorReact } from '../../core/ShaclFormSingleEditorReact'

export default class EnumSelect extends ShaclFormSingleEditorReact<typeof EnumSelect> {

  static iri = dash('EnumSelectEditor').value

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .has(sh('in'), 10)
      .toNumber()
  }

  static createNewObject () {
    return factory.literal('')
  }

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