import { GrapoiPointer, NamedNode } from '../types'
import { sh } from '../helpers/namespaces'

/**
 * Each widget MUST return a number how it scores in the static score() method,
 * This abstraction helps to invert the control on the weighing.
 * The widget gives back the individual scores per thing it wants to score (the datatype, the predicate name etc)
 * and we are able to give different weights in the toNumber method.
 * 
 * At the moment it is simply the average.
 */
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