import type { NamedNode } from '@rdfjs/types'
import { GrapoiPointer } from './types'
import { sh } from './namespaces'

export class Scorer {

  #pointer: GrapoiPointer
  #scores: Array<number> = []
  #foundIncompatibility = false

  constructor (pointer: GrapoiPointer) {
    this.#pointer = pointer
  }

  datatypes (acceptedTypes: Array<NamedNode>, score: number = 1) {
    const datatypes = this.#pointer.out([sh('datatype')]).terms
    const isAllowed = datatypes.every(datatype => acceptedTypes.some(acceptedType => acceptedType.equals(datatype)))
    if (isAllowed) this.#scores.push(score)
    else this.#foundIncompatibility = true
    return this
  }

  toNumber () {
    if (this.#foundIncompatibility) return -1
    return this.#scores.reduce((sum, single) => sum + single, 0)
  }
}

export const scorer = (pointer: GrapoiPointer) => new Scorer(pointer)