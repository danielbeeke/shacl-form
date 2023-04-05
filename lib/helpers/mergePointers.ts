export const mergePointers = (pointers: Array<any>) => {
  return pointers[0].clone({
    ptrs: pointers.flatMap(pointer => pointer.ptrs)
  }).trim()
}