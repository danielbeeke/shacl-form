import DatasetCore from '@rdfjs/dataset/DatasetCore'
import grapoi from 'grapoi'
import { rdf, sh } from '../namespaces'
import factory from 'rdf-ext'
import parsePath from 'shacl-engine/lib/parsePath.js'
import * as _ from 'lodash-es'

/**
 * One predicate
 * Some predicates from the current level
 * Nested sh:node with BlankNode or IRI
 * @see https://github.com/w3c/shacl/blob/9715ee1d8661ffd87322ab655161174ecc8d3967/shacl-compact-syntax/tests/valid/complex2.ttl#L32
 * 
 * TODO make recursive
 */
export const shaclTree = (report: any, dataset: DatasetCore) => {
  const shacl = grapoi({ dataset, factory })
  const shaclShapes = shacl.hasOut([rdf('type')], [sh('NodeShape')])
  const shaclProperties = shaclShapes.hasOut([sh('property')])

  const tree: any = {}

  for (const shaclProperty of shaclProperties) {
    const shaclPropertyInner = shaclProperty.out().trim()
    const path = parsePath(shaclPropertyInner.out([sh('path')]))

    let pointer = tree

    // Levels
    for (const [index, pathPart] of path.entries()) {
      const shaclResults = report.results.filter((result: any) => _.isEqual(result.path, path))
      const messages = extractMessages(shaclResults)

      // Alternatives, only used for sh:alternativePath
      for (const predicate of pathPart.predicates) {

        // We MUST merge multiple paths into one and they all apply.
        // See end of https://www.w3.org/TR/shacl/#constraints
        if (!pointer[predicate.value]) {
          pointer[predicate.value] = {
            _messages: {
              errors: [],
              infos: [],
              warnings: []
            },
            _pointers: [],
            _pathPart: pathPart,
            _types: [],
            // Widgets can be multiple when sh:or, sh:xone etc is used.
            // It can also be multiple when the configuration allows more widgets than only the best one.
            // _widgets: []

            // Used to grapb all the pointers for one sh:or option.
            // If sh:or is not used this array will just have one item.
            _alternatives: [] // TODO lazily calculate?
          }
        }

        // Messages are part of a widget that does have a definition.
        // Intermediate paths are given widgets but they do not have a definition in the case of sh:path ( a b )
        if (index === path.length - 1) {
          pointer[predicate.value]._messages.errors = _.uniq([...pointer[predicate.value]._messages.errors, ...messages.errors])
          pointer[predicate.value]._messages.infos = _.uniq([...pointer[predicate.value]._messages.infos, ...messages.infos])
          pointer[predicate.value]._messages.warnings = _.uniq([...pointer[predicate.value]._messages.warnings, ...messages.warnings])
          pointer[predicate.value]._types.push('widget')
        }
        else {
          pointer[predicate.value]._types.push('parent')
        }

        pointer[predicate.value]._pointers.push(shaclPropertyInner)
        pointer = pointer[predicate.value]
      }
    }
  }

  return tree
}


const toMesssages = (constraints: Array<any>) => {
  return [... new Set(constraints.flatMap((constraint: any) => constraint.message.map((message: any) => message.value)))]
}

/**
 * Extracts the messages and groups by type
 */
const extractMessages = (constraints: Array<any>) => {
  const errors = constraints.filter((constraint: any) => constraint.severity.equals(sh('Violation')))
  const infos = constraints.filter((constraint: any) => constraint.severity.equals(sh('Info')))
  const warnings = constraints.filter((constraint: any) => constraint.severity.equals(sh('Warning')))

  return {
    errors: toMesssages(errors),
    infos: toMesssages(infos),
    warnings: toMesssages(warnings)
  }
}
