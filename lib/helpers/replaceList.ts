import { GrapoiPointer, Term } from '../types'
import factory from 'rdf-ext'
import { rdf } from './namespaces'

export const replaceList = (terms: Array<Term>, pointer: GrapoiPointer | undefined) => {
  pointer = pointer?.deleteList()

  for (const [index, term] of terms.entries()) {
    const next = index === terms.length - 1 ? rdf('nil') : factory.blankNode()
    pointer?.addOut([rdf('first')], [term])
    pointer?.addOut([rdf('rest')], [next])
    pointer = index === terms.length - 1 ? undefined : pointer?.node([next])
  }

}