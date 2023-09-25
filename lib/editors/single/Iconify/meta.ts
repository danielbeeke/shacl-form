import { shFrm, xsd } from '../../../helpers/namespaces'
import { GrapoiPointer } from '../../../types'
import { scorer } from '../../../core/Scorer'

export const iri = shFrm('Iconify').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
    return scorer(shaclPointer, dataPointer)
      .datatype([xsd('string')])
      .toNumber()
  }