const propSet = new Set()

/**
match
readQuads
​​add
addQuad
delete​​
removeQuad
removeQuads
*/

export const StoreProxy = (eventTarget: EventTarget) => {
  return {
    get(target: any, prop: string, receiver: any) {
      const method = Reflect.get(target, prop, receiver)
      if (prop[0] !== '_') propSet.add(prop)

      return (...args: Array<any>) => {
        
        if (['add', 'addQuad'].includes(prop)) {
          const quad = args[0]
          const skipEvent = args[1]
          args.splice(1, 1)
          if (!skipEvent) eventTarget.dispatchEvent(new CustomEvent('quad.added', { detail: { quad} }))
        }

        if (['delete', 'removeQuad'].includes(prop)) {
          const quad = args[0]
          const skipEvent = args[1]
          args.splice(1, 1)
          if (!skipEvent) eventTarget.dispatchEvent(new CustomEvent('quad.deleted', { detail: { quad} }))
        }

        const results = method.apply(target, args)

        return results
      }
    },
  }
}
