import factory from 'rdf-ext'
import { Term } from '../types'
import { once } from 'lodash-es'

const cleanPath = (path: string) => path.split('/').at(-2)?.replace(/\.tsx|\.ts/g, '')!

type SingleWidget = { 
  score: () => number, 
  iri: string,
  name: string,
  createNewObject: () => Term
  resolve: () => Promise<any>
}

export const importSingleWidgets = (widgetGlob: Record<string, () => Promise<unknown>>, metaGlob: Record<string, unknown>) => {
  const widgetGlobEntries = Object.entries(widgetGlob)
  const metaGlobEntries = Object.entries(metaGlob)
  
  const filteredEntries = widgetGlobEntries.filter(([path]) => {
    const metaMatch = cleanPath(path) + '/meta.ts'
    return metaGlobEntries.find(([path]) => path.includes(metaMatch))
  })

  const output: { [key: string]: Partial<SingleWidget> } = {}

  for (const [path, module] of filteredEntries) {
    const metaMatch = cleanPath(path) + '/meta.ts'
    const meta = metaGlobEntries.find(([path]) => path.includes(metaMatch))?.[1]

    const identifier = cleanPath(path)
    const { iri, score, createNewObject } = meta as any

    output[identifier] = {
      iri, 
      name: identifier,
      score: score ? score : () => 0, 
      createNewObject: createNewObject ? createNewObject : () => factory.namedNode('') as any,
      resolve: once(() => module())
    }
  }

  return output as { [key: string]: SingleWidget }
}
