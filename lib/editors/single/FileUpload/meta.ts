import { GrapoiPointer } from '../../../types'
import { dash, shFrm } from '../../../helpers/namespaces'
import { scorer } from '../../../core/Scorer'

export const iri = shFrm('FileUpload').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .has(dash('uriStart'))
    .toNumber()
}
