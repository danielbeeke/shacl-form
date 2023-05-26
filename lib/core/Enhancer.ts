import DatasetCore from '@rdfjs/dataset/DatasetCore'
import grapoi from 'grapoi'
import { rdf, sh, rdfs } from '../helpers/namespaces'
import factory from 'rdf-ext'
import type { GrapoiPointer, NamedNode, Quad } from '../types'
import { QueryEngine } from '@comunica/query-sparql';
import parsePath from 'shacl-engine/lib/parsePath.js'

export class Enhancer {

  #engine: QueryEngine

  constructor () {
    this.#engine = new QueryEngine()
  }

  async execute (dataset: DatasetCore) {
    const shacl = grapoi({ dataset, factory }) as GrapoiPointer
    const shaclShapes = shacl.hasOut([rdf('type')], [sh('NodeShape')]).trim()
    const shaclProperties = shaclShapes.hasOut([sh('property')])

    const promises: Array<Promise<void>> = []
    
    for (const shaclProperty of shaclProperties.out([sh('property')])) {
      const labels = shaclProperty.out([sh('name'), rdfs('label')]).terms.length

      if (!labels) {
        promises.push(this.getLabelAndDescription(shaclProperty).then(quads => {
          for (const quad of quads) dataset.add(quad)
        }))
      }
    }

    await Promise.all(promises)
  }

  /**
   * Label and description enhancement by fetching ontology.
   */
  async getLabelAndDescription (shaclProperty: GrapoiPointer) {
    const path = parsePath(shaclProperty.out([sh('path')]))
    const predicates = path.pop().predicates
    const labelQuads: Array<Quad> = []

    for (const predicate of predicates) {
      const response = await this.#engine.queryQuads(`
        CONSTRUCT {
          ?s <${sh('name').value}> ?o1 .
          ?s <${sh('description').value}> ?o2 .
        } WHERE {
          VALUES ?s { <${predicate.value}> }
          VALUES ?p1 { ${[rdfs('label')].map(predicate => `<${predicate.value}>`).join(' ')} }
          ?s ?p1 ?o1 .

          VALUES ?p2 { ${[rdfs('comment')].map(predicate => `<${predicate.value}>`).join(' ')} }
          ?s ?p2 ?o2 .
        }
      `, {
        sources: [predicate.value],
      })

      const receivedQuads = (await response.toArray())
      const quads = receivedQuads.map(quad => factory.quad(shaclProperty.term as NamedNode, quad.predicate, quad.object))
      labelQuads.push(...quads)
    }

    return labelQuads
  }
}