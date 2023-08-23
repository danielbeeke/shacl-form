export const valueIterator = (thing) => {
  const values = []

  const normalize = (thing) => Array.isArray(thing) ? thing.entries() : Object.entries(thing)

  const process = (thing) => {
    for (const [index, item] of normalize(thing)) {
      typeof item !== 'string' && typeof item !== 'number' ? process(item) : values.push(thing)
    }  
  }

  process(thing)

  return values
}

/**
 * Given a flat graph, nests it.
 * 
 * We index the available objects
 * Itereate through all the properties, replace properties with graphs and return an array with the graphs that were not put into another.
 * 
 * @param {*} jsonLd 
 */
export const nest = (jsonLd) => {
  if (Array.isArray(jsonLd) || (jsonLd?.['@graph'] && Array.isArray(jsonLd['@graph']))) {
    const graphs = Array.isArray(jsonLd) ? jsonLd : jsonLd['@graph']
    const graphsMap = new Map()
    const nestedGraphsMap = new Set()
    for (const graph of graphs) {
      graphsMap.set(graph['@id'], graph)
    }

    for (const item of valueIterator(graphs)) {
      // This is a reference to a full graph.
      if (item?.['@id'] && Object.keys(item).length === 1 && graphsMap.get(item['@id'])) {
        nestedGraphsMap.add(item['@id'])
        const graphToMerge = graphsMap.get(item['@id'])
        Object.assign(item, graphToMerge)

        // These unnamed id's are useless.
        if (item['@id'].substr(0, 2) === '_:') delete item['@id']
      }
    }

    return graphs.filter(graph => !(graph?.['@id'] && nestedGraphsMap.has(graph['@id'])))
  }
  else {
    throw new Error('Please supply a json-ld with multiple graphs.')
  }
}