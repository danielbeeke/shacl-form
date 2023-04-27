import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { GrapoiPointer } from '../types'
import { scorer } from '../core/Scorer'
import { sh } from '../helpers/namespaces'
import factory from 'rdf-ext'

export default class BlankNodeOrIri extends ShaclFormWidget<typeof BlankNodeOrIri> {

  static elementName = 'blank-node'

  static score(shaclPointer: GrapoiPointer) {
    return scorer(shaclPointer)
      .datatypes([sh('BlankNodeOrIRI')])
      .toNumber()
  }

  static createNewObject () {
    return factory.blankNode()
  }

  async connectedCallback () {
    this.render()
  }

  render () {
    console.log(this.value)
    // TODO make it possible to give the blankNode a name so that we are able to not use blankNodes.
    this.innerHTML = '<em>Blank Node</em>'
  }

}