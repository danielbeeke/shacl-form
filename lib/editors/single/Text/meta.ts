import { xsd, dash, rdf } from '../../../helpers/namespaces'
import { GrapoiPointer } from '../../../types'
import { scorer } from '../../../core/Scorer'
import factory from 'rdf-ext'

export const iri = dash('TextAreaEditor').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .datatype([xsd('string'), rdf('langString')])
    .has(dash('singleLine'), factory.literal('false', xsd('boolean')))
    .toNumber()
}
