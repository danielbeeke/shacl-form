import { shFrm, xsd } from '../../../helpers/namespaces'
import { GrapoiPointer } from '../../../types'
import { scorer } from '../../../core/Scorer'
import factory from 'rdf-ext'

export const iri = shFrm('DatePickerEditor').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .datatype([xsd('date')], 2)
    .toNumber()
}

export const createNewObject = () => {
  return factory.literal('', xsd('date'))
}
