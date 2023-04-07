import { ShaclFormField } from '../ShaclFormField'
import { xsd, sh } from '../namespaces'
import { GrapoiPointer, Quad } from '../types'

export default class BlankNode extends ShaclFormField<typeof BlankNode> {

  static elementName = 'field-blank-node'

  static applies(shaclPointer: GrapoiPointer): boolean {
    const datatypes = shaclPointer.in([sh('datatype')]).values
    return datatypes.includes(xsd('string').value)
  }

  async connectedCallback () {
    this.render()
  }

  render () {

  }

}