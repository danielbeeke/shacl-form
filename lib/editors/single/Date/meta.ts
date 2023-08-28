import { shFrm, xsd } from '../../../helpers/namespaces'
import { GrapoiPointer } from '../../../types'
import { scorer } from '../../../core/Scorer'
import factory from 'rdf-ext'

export const iri = shFrm('TextFieldEditor').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .datatype([xsd('date')], 2)
    .toNumber()
}

export const createNewObject = () => {
  const today = new Date()
  const todayAsString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${(today.getDate() + 1).toString().padStart(2, '0')}`
  return factory.literal(todayAsString, xsd('date'))
}
