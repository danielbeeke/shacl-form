import { ShaclFormSingleEditorUhtml } from '../../core/ShaclFormSingleEditorUhtml'
import { GrapoiPointer, BlankNode } from '../../types'
import { scorer } from '../../core/Scorer'
import { schema, rdfs, sh, dash } from '../../helpers/namespaces'
import factory from 'rdf-ext'
import { bestLanguage } from '../../helpers/bestLanguage'
import { html } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.
import { swapSubject } from '../../helpers/swapSubject'


/**
 * TODO add support for: dash:stem and / or dash:uriStart
 * TODO Add edit mode
 */
export default class BlankNodeOrIri extends ShaclFormSingleEditorUhtml<typeof BlankNodeOrIri> {

  public showIdentifier = false
  public identifierSuggestion = ''

  static iri = dash('BlankNodeEditor').value

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .node()
      .nodeKind([sh('IRI'), sh('BlankNode'), sh('BlankNodeOrIRI')], 3)
      .toNumber()
  }

  static createNewObject () {
    return factory.blankNode()
  }

  template () {
    const namesPointer = this.dataPointer().out([this.predicate])
    const indexSpecificNamesPointer = namesPointer.clone({
      ptrs: [namesPointer.ptrs[this.index]].filter(Boolean)
    }).trim().out([schema('name'), rdfs('label')])

    const name = bestLanguage(indexSpecificNamesPointer, this.uiLanguagePriorities)
    const nodeKind = this.shaclPointer.out([sh('nodeKind')]).term
    const enforceIri = nodeKind?.equals(sh('IRI'))

    return html`
      <span class="d-flex align-items-center">
        <h4 class="me-2 mb-0">${name ?? this.value?.value}</h4>
        <em class="me-2">${this.value?.value} (${this.value?.termType})</em>

        ${this.value?.termType === 'BlankNode' && !this.showIdentifier && !enforceIri ? html`
        <button class="btn-secondary btn btn-sm" onClick=${() => {
          this.showIdentifier = true
          this.render()
        }}>Add identifier</button>
        ` : null}
        
        ${this.value?.termType === 'NamedNode' && !this.showIdentifier && !enforceIri ? html`
        <button class="btn-secondary btn btn-sm" onClick=${() => {
          const store = this.dataPointer().ptrs[0].dataset
          const newSubject = factory.blankNode()
          swapSubject(store, namesPointer.terms[this.index] as BlankNode, newSubject)
  
          this.renderAll()
        }}>Remove identifier</button>
        ` : null}

      </span>

      ${this.showIdentifier || enforceIri && this.value?.termType === 'BlankNode' ? html`
        <input class="" type="url" required placeholder="https://example.com" onChange=${(event: any) => {
          this.identifierSuggestion = event.target.value
        }} />
        <button class="btn-secondary btn btn-sm" onClick=${() => {
          if (!this.identifierSuggestion) return
          
          const store = this.dataPointer().ptrs[0].dataset
          const newSubject = factory.namedNode(this.identifierSuggestion)
          swapSubject(store, namesPointer.terms[this.index] as BlankNode, newSubject)
          this.showIdentifier = false
          this.renderAll()
        }}>Save identifier</button>
        ${!enforceIri ? html`
        <button class="btn-secondary btn btn-sm" onClick=${() => {
          this.showIdentifier = false
          this.render()
        }}>Cancel</button>
        ` : null}

      ` : null}
    `
  }

}