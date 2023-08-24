if (!(globalThis).process) {
  /** @ts-ignore */
  globalThis.process = {}
}

/** @ts-ignore */
if (!(globalThis).process?.nextTick) (globalThis).process.nextTick = function(callback: Function, ...args: Array<any>) {
  if (globalThis.requestAnimationFrame) globalThis.requestAnimationFrame(() => callback(...args))
  else setTimeout(() => callback(...args))
}