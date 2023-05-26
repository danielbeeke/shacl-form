import { ShaclFormEditorSingle } from '../../core/ShaclFormEditorSingle'
import { GrapoiPointer, BlankNode } from '../../types'
import { scorer } from '../../core/Scorer'
import { schema, rdfs, sh } from '../../helpers/namespaces'
import factory from 'rdf-ext'
import { bestLanguage } from '../../helpers/bestLanguage'
import { html, render } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.
import { swapSubject } from '../../helpers/swapSubject'

/**
 * TODO add support for: dash:stem and / or dash:uriStart
 * TODO Add edit mode
 */
export default class BlankNodeOrIri extends ShaclFormEditorSingle<typeof BlankNodeOrIri> {

  public showIdentifier = false
  public identifierSuggestion = ''

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .node()
      .nodeKind([sh('IRI'), sh('BlankNode'), sh('BlankNodeOrIRI')], 3)
      .toNumber()
  }

  static createNewObject () {
    return factory.blankNode()
  }

  render () {
    const namesPointer = this.dataPointer().out([this.predicate])
    const indexSpecificNamesPointer = namesPointer.clone({
      ptrs: [namesPointer.ptrs[this.index]].filter(Boolean)
    }).trim().out([schema('name'), rdfs('label')])

    const name = bestLanguage(indexSpecificNamesPointer, this.uiLanguagePriorities)
    const nodeKind = this.shaclPointer.out([sh('nodeKind')]).term

    const enforceIri = nodeKind?.equals(sh('IRI'))
    // const enforceBlankNode = nodeKind?.equals(sh('BlankNode'))
    // const iriAndBlankNodeAllowed = !nodeKind || nodeKind.equals(sh('BlankNodeOrIRI'))

    // console.log({ enforceIri, enforceBlankNode, iriAndBlankNodeAllowed})

    render(this, html`
      <span>
        ${name ?? this.value?.value} 
        <em>${this.value?.value} (${this.value?.termType})</em>

        ${this.value?.termType === 'BlankNode' && !this.showIdentifier && !enforceIri ? html`
        <button onClick=${() => {
          this.showIdentifier = true
          this.render()
        }}>Add identifier</button>
        ` : null}
        
        ${this.value?.termType === 'NamedNode' && !this.showIdentifier && !enforceIri ? html`
        <button onClick=${() => {
          const store = this.dataPointer().ptrs[0].dataset
          const newSubject = factory.blankNode()
          swapSubject(store, namesPointer.terms[this.index] as BlankNode, newSubject)
  
          this.renderAll()
        }}>Remove identifier</button>
        ` : null}

      </span>

      ${this.showIdentifier || enforceIri && this.value?.termType === 'BlankNode' ? html`
        <input type="url" required placeholder="https://example.com" onChange=${(event: any) => {
          this.identifierSuggestion = event.target.value
        }} />
        <button onClick=${() => {
          if (!this.identifierSuggestion) return
          
          const store = this.dataPointer().ptrs[0].dataset
          const newSubject = factory.namedNode(this.identifierSuggestion)
          swapSubject(store, namesPointer.terms[this.index] as BlankNode, newSubject)
          this.showIdentifier = false
          this.renderAll()
        }}>Save identifier</button>
        ${!enforceIri ? html`
        <button onClick=${() => {
          this.showIdentifier = false
          this.render()
        }}>Cancel</button>
        ` : null}

      ` : null}
    `)
  }

}