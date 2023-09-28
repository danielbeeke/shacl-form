import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'
import { BlankNode } from '../../../types'
import { schema, rdfs, sh, shFrm } from '../../../helpers/namespaces'
import factory from 'rdf-ext'
import { bestLanguage } from '../../../helpers/bestLanguage'
import { swapSubject } from '../../../helpers/swapSubject'


/**
 * TODO add support for: dash:stem and / or dash:uriStart
 */
export default class BlankNodeOrIri extends ShaclFormSingleEditorReact<typeof BlankNodeOrIri> {

  public showIdentifier = false
  public identifierSuggestion = ''

  template () {
    const namesPointer = this.dataPointer().out([this.predicate])
    const indexSpecificNamesPointer = namesPointer.clone({
      ptrs: [namesPointer.ptrs[this.index]].filter(Boolean)
    }).trim().out([schema('name'), rdfs('label')])

    const name = bestLanguage(indexSpecificNamesPointer, this.uiLanguagePriorities)
    const nodeKind = this.shaclPointer.out([sh('nodeKind')]).term
    const enforceIri = nodeKind?.equals(sh('IRI'))

    const languageDiscriminator = this.shaclPointer.out([shFrm('languageDiscriminator')]).term

    if (languageDiscriminator) {
      return null
    }

    return <>
      <span className="d-flex align-items-center">
        <h4 className="me-2 mb-0">{name ?? this.value?.value}</h4>
        <em className="me-2">{this.value?.value} ({this.value?.termType})</em>

        {this.value?.termType === 'BlankNode' && !this.showIdentifier && !enforceIri ? <button className="btn-secondary btn btn-sm" onClick={() => {
          this.showIdentifier = true
          this.render()
        }}>Add identifier</button>
         : null}
        
        {this.value?.termType === 'NamedNode' && !this.showIdentifier && !enforceIri ? <button className="btn-secondary btn btn-sm" onClick={() => {
          const store = this.dataPointer().ptrs[0].dataset
          const newSubject = factory.blankNode()
          swapSubject(store, namesPointer.terms[this.index] as BlankNode, newSubject)
  
          this.renderAll()
        }}>Remove identifier</button>
         : null}

      </span>

      {this.showIdentifier || enforceIri && this.value?.termType === 'BlankNode' ? 
        <>
        <input type="url" required placeholder="https://example.com" onChange={(event: any) => {
          this.identifierSuggestion = event.target.value
        }} />

        <button className="btn-secondary btn btn-sm" onClick={() => {
          if (!this.identifierSuggestion) return
          
          const store = this.dataPointer().ptrs[0].dataset
          const newSubject = factory.namedNode(this.identifierSuggestion)
          swapSubject(store, namesPointer.terms[this.index] as BlankNode, newSubject)
          this.showIdentifier = false
          this.renderAll()
        }}>Save identifier</button>
        {!enforceIri ? <button className="btn-secondary btn btn-sm" onClick={() => {
          this.showIdentifier = false
          this.render()
        }}>Cancel</button>
         : null}

        </>
       : null}
      </>
  }
}