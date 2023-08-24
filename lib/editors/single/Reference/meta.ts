import { dash, sh } from '../../../helpers/namespaces'
import { scorer } from '../../../core/Scorer'
import { GrapoiPointer } from '../../../types'

export const iri = dash('AutoCompleteEditor').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .nodeKind([sh('IRI')])
    .toNumber()
}

