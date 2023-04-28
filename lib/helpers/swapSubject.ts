import { Store } from 'n3'
import { BlankNode, NamedNode, Quad } from '../types'
import factory from 'rdf-ext'

export const swapSubject = (store: Store, oldSubject: NamedNode | BlankNode, newSubject: NamedNode | BlankNode) => {
  const quadsToChangeWithSubject = store.getQuads(oldSubject, null, null, null)
  store.removeQuads(quadsToChangeWithSubject)
  store.addQuads(quadsToChangeWithSubject.map((quad: Quad) => factory.quad(newSubject, quad.predicate, quad.object, quad.graph)))

  const quadsToChangeWithObject = store.getQuads(null, null, oldSubject, null)
  store.removeQuads(quadsToChangeWithObject)
  store.addQuads(quadsToChangeWithObject.map((quad: Quad) => factory.quad(quad.subject, quad.predicate, newSubject, quad.graph)))
}