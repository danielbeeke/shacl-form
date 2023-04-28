import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { GrapoiPointer } from '../types'
import { scorer } from '../core/Scorer'
import { schema, rdfs, sh } from '../helpers/namespaces'
import factory from 'rdf-ext'
import { bestLanguage } from '../helpers/bestLanguage'

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
    const namesPointer = this.dataPointer().out([this.predicate])

    const indexSpecificNamesPointer = namesPointer.clone({
      ptrs: [namesPointer.ptrs[this.index]].filter(Boolean)
    }).trim().out([schema('name'), rdfs('label')])

    const name = bestLanguage(indexSpecificNamesPointer, this.uiLanguagePriorities)

    // TODO make it possible to give the blankNode a name so that we are able to not use blankNodes.
    this.innerHTML = `<h2>${name ?? this.value?.value} <em>(blank node)</em></h2>`
  }

}