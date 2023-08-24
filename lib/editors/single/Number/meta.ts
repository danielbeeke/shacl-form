import { rdf, sh, shFrm, xsd } from '../../../helpers/namespaces'
import factory from 'rdf-ext'
import { GrapoiPointer } from '../../../types'
import { scorer } from '../../../core/Scorer'

export const iri = shFrm('Number').value

export const createNewObject = (form: any, shaclPointer: GrapoiPointer) => {
  const isMultiLingual = shaclPointer.out([sh('datatype')]).terms.some(term => term.equals(rdf('langString')))
  return factory.literal('', isMultiLingual ? form.activeContentLanguage : undefined)
}

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .datatype([xsd('number')])
    .toNumber()
}