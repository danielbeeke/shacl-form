import { sh, dash } from '../../../helpers/namespaces'
import { GrapoiPointer } from '../../../types'
import { scorer } from '../../../core/Scorer'
import factory from 'rdf-ext'

export const iri = dash('BlankNodeEditor').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .node()
    .nodeKind([sh('IRI'), sh('BlankNode'), sh('BlankNodeOrIRI')], 3)
    .toNumber()
}

export const createNewObject = () => {
  return factory.blankNode()
}
