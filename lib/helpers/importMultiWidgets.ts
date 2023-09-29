const cleanPath = (path: string) => path.split('/').at(-2)?.replace(/\.tsx|\.ts/g, '')!

type MultiWidget = { 
  iri: string,
  score: () => number, 
  name: string,
  supportedCombinations: any,
  resolve: () => Promise<any>
}

export const importMultiWidgets = (widgetGlob: Record<string, () => Promise<unknown>>, metaGlob: Record<string, unknown>) => {
  const widgetGlobEntries = Object.entries(widgetGlob)
  const metaGlobEntries = Object.entries(metaGlob)
  
  const filteredEntries = widgetGlobEntries.filter(([path]) => {
    const metaMatch = cleanPath(path) + '/meta.ts'
    return metaGlobEntries.find(([path]) => path.includes(metaMatch))
  })

  const output: { [key: string]: Partial<MultiWidget> } = {}

  for (const [path, module] of filteredEntries) {
    const metaMatch = cleanPath(path) + '/meta.ts'
    const meta = metaGlobEntries.find(([path]) => path.includes(metaMatch))?.[1]

    const identifier = cleanPath(path)
    const { iri, supportedCombinations, score } = meta as any

    output[identifier] = {
      iri, 
      name: cleanPath(path),
      score: score ? score : () => 100, 
      supportedCombinations,
      resolve: () => module().then((resolvedModule: any) => resolvedModule.default)
    }
  }

  return output as { [key: string]: MultiWidget }
}
