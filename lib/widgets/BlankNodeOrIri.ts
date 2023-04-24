import { ShaclFormField } from '../ShaclFormField'
import { GrapoiPointer } from '../types'
import { scorer } from '../Scorer'
import { sh } from '../namespaces'

export default class BlankNodeOrIri extends ShaclFormField<typeof BlankNodeOrIri> {

  static elementName = 'blank-node'

  static score(shaclPointer: GrapoiPointer) {
    return scorer(shaclPointer)
      .datatypes([sh('BlankNodeOrIRI')])
      .toNumber()
  }

  async connectedCallback () {
    this.render()
  }

  render () {
    // TODO make it possible to give the blankNode a name so that we are able to not use blankNodes.
    this.innerHTML = '<em>Blank Nodes</em>'
  }

}