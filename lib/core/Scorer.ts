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

  #shaclPointer: GrapoiPointer
  #dataPointer: GrapoiPointer
  #scores: Array<{ type: string, score: number}> = []
  #foundIncompatibility = false

  constructor (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    this.#shaclPointer = shaclPointer
    this.#dataPointer = dataPointer
  }

  datatype (acceptedTypes: Array<NamedNode>, score: number = 1) {
    const datatypes = this.#shaclPointer.out([sh('datatype')]).terms
    const isAllowed = datatypes.every(datatype => acceptedTypes.some(acceptedType => acceptedType.equals(datatype)))

    // if (!datatypes.length && acceptedTypes.length) this.#foundIncompatibility = true

    // sh:node and sh:datatype are incompatible
    const node = this.#shaclPointer.out([sh('node')]).term
    if (node) this.#foundIncompatibility = true

    if (isAllowed) this.#scores.push({ type: 'datatype', score })
    else this.#foundIncompatibility = true
    return this
  }

  nodeKind (accepedKinds: Array<NamedNode>, score: number = 1) {
    const kinds = this.#shaclPointer.out([sh('nodeKind')]).terms
    const isAllowed = kinds.length && kinds.every(kind => accepedKinds.some(acceptedKind => acceptedKind.equals(kind)))
    if (isAllowed) this.#scores.push({ type: 'nodeKind', score })
    else this.#foundIncompatibility = true
    return this
  }

  node (score: number = 1) {
    const node = this.#shaclPointer.out([sh('node')]).term
    const isAllowed = !!node
    if (isAllowed) this.#scores.push({ type: 'node', score })
    return this
  }

  toNumber () {
    if (this.#foundIncompatibility) return -1
    return this.#scores.reduce((sum, scoreElemen) => sum + scoreElemen.score, 0)
  }
}

export const scorer = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => new Scorer(shaclPointer, dataPointer)