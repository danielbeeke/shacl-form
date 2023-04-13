import DatasetCore from '@rdfjs/dataset/DatasetCore'
import grapoi from 'grapoi'
import { rdf, sh } from '../namespaces'
import factory from 'rdf-ext'
import parsePath from 'shacl-engine/lib/parsePath.js'
import * as _ from 'lodash-es'
import { GrapoiPointer, Options } from '../types'
import { rdfTermValueToTypedVariable } from './rdfTermValueToTypedVariable'

type TreeItem = {
  _pointers: Array<GrapoiPointer>,
  _messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  },
  _pathPart: any,
  _types: Array<string>,
  _alternatives: () => Array<any>
  _widgets: () => Array<any>
}

/**
 * One predicate
 * Some predicates from the current level
 * Nested sh:node with BlankNode or IRI
 * @see https://github.com/w3c/shacl/blob/9715ee1d8661ffd87322ab655161174ecc8d3967/shacl-compact-syntax/tests/valid/complex2.ttl#L32
 * 
 * TODO make recursive
 * Grab the required languages and think about language tabs in a recursive situation.
 */
export const shaclTree = (report: any, dataset: DatasetCore, options: Options) => {
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
          const item: TreeItem = {
            _messages: { errors: [], infos: [], warnings: [] },
            _pointers: [],
            _pathPart: pathPart,
            _types: [],
            // sh:or, sh:xone, sh:qualifiedValueShape
            _alternatives: _.once(() => pointersToAlternatives(item._pointers)),
            _widgets: _.once(() => {

              const { widgets } = options

              return item._alternatives().map(alternative => {
                return Object.values(widgets).map(widget => {
                  return {
                    _pointer: alternative.pointer,
                    _score: widget.applies(alternative.pointer),
                    _alternative: alternative
                  }
                })
              })
            })
          }
          pointer[predicate.value] = item
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

        // Set the pointer for the next round.
        pointer = pointer[predicate.value]
      }
    }
  }

  console.log(tree['https://schema.org/knows']['https://schema.org/name']._widgets())

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

/**
 * The pointers should be always at the root of a SHACL property.
 * It is allowed to have multiple properties for the same SHACL property.
 */
export const pointersToAlternatives = (pointers: Array<GrapoiPointer>) => {
  const baseTerms = pointers.flatMap((p: any) => p.terms)
  const baseAlternatives = pointers[0].node(baseTerms)
  const orAlternatives = [...baseAlternatives.out([sh('or')]).trim()?.list() ?? []].map(pointer => pointer.trim().out())
  const qualifiedAlternative = baseAlternatives.out([sh('qualifiedValueShape')]).trim().out()

  const qualifiedValueShapesDisjointValue = baseAlternatives.out([sh('qualifiedValueShapesDisjoint')]).term
  const qualifiedValueShapesDisjoint = qualifiedValueShapesDisjointValue ? rdfTermValueToTypedVariable(qualifiedValueShapesDisjointValue) : false

  // I could not find in the spec that sh:or would merge with the base properties 
  // but I think it might, because it works that way when using qualifiedValueShapesDisjoint.
  const qualifiedValuePointer = qualifiedAlternative.ptrs.length ? (
    qualifiedValueShapesDisjoint ? qualifiedAlternative : pointers[0].node([...baseTerms, qualifiedAlternative.term].filter(Boolean))
  ) : null

  return [
    qualifiedValuePointer ? {
      pointer: qualifiedValuePointer,
      type: 'qualified'
    } : null,
    orAlternatives.length ? null : {
      pointer: baseAlternatives,
      type: 'base'
    },
    ...orAlternatives.map((orAlternative: GrapoiPointer) => ({
      // TODO why does this need an in()?
      pointer: orAlternative.node([...baseTerms, orAlternative.term]).in(),
      type: 'or'
    })),
  ].filter(Boolean)
}

const determineWidgets = (widgets: Options['widgets']) => {

}