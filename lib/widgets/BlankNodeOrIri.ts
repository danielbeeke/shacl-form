import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { GrapoiPointer, BlankNode } from '../types'
import { scorer } from '../core/Scorer'
import { schema, rdfs, sh } from '../helpers/namespaces'
import factory from 'rdf-ext'
import { bestLanguage } from '../helpers/bestLanguage'
import { html, render } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.
import { swapSubject } from '../helpers/swapSubject'

export default class BlankNodeOrIri extends ShaclFormWidget<typeof BlankNodeOrIri> {

  public showIdentifier = false
  public identifierSuggestion = ''

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

    render(this, html`
      <h2>${name ?? this.value?.value} <em>(${this.value?.termType})</em></h2>

      ${this.showIdentifier ? html`
        <input type="url" placeholder="https://example.com" onChange=${(event: any) => {
          this.identifierSuggestion = event.target.value
        }} />
        <button onClick=${() => {
          const store = this.dataPointer().ptrs[0].dataset
          const newSubject = factory.namedNode(this.identifierSuggestion)
          swapSubject(store, namesPointer.term as BlankNode, newSubject)
          this.showIdentifier = false
          this.renderAll()
        }}>Save identifier</button>
        <button onClick=${() => {
          this.showIdentifier = false
          this.render()
        }}>Cancel</button>
      ` : null}

      ${this.value?.termType === 'BlankNode' && !this.showIdentifier ? html`
      <button onClick=${() => {
        this.showIdentifier = true
        this.render()
      }}>Add identifier</button>
      ` : null}


      ${this.value?.termType === 'NamedNode' && !this.showIdentifier ? html`
      <button onClick=${() => {
        const store = this.dataPointer().ptrs[0].dataset
        const newSubject = factory.blankNode()
        swapSubject(store, namesPointer.term as BlankNode, newSubject)

        this.renderAll()
      }}>Remove identifier</button>
      ` : null}

    `)
  }

}