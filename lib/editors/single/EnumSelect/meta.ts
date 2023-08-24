import { sh, dash } from '../../../helpers/namespaces'
import { GrapoiPointer } from '../../../types'
import { scorer } from '../../../core/Scorer'
import factory from 'rdf-ext'

export const iri = dash('EnumSelectEditor').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .has(sh('in'), 10)
    .toNumber()
}

export const createNewObject = () => {
  return factory.literal('')
}

