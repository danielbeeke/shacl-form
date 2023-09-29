import { GrapoiPointer } from '../types'

export const removeRecursively = (pointer: GrapoiPointer) => {
  const dataset = pointer.ptrs[0].dataset
  // Removes also the children of this item.
  const quadsToRemove = new Set()

  while ([...pointer.quads()].length) {
    for (const quad of pointer.quads()) quadsToRemove.add(quad)
    pointer = pointer.out()
  }

  dataset.removeQuads([...quadsToRemove.values()])
}