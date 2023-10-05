import { dash, xsd } from '../../../helpers/namespaces'
import { GrapoiPointer } from '../../../types'
import { scorer } from '../../../core/Scorer'
import factory from 'rdf-ext'

export const iri = dash('BooleanSelectEditor').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .datatype([xsd('boolean')], 5)
    .toNumber()
}

export const createNewObject = () => {
  return factory.literal('', xsd('boolean'))
}
