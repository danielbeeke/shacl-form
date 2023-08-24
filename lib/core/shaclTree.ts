import DatasetCore from '@rdfjs/dataset/DatasetCore'
import grapoi from 'grapoi'
import { rdf, sh } from '../helpers/namespaces'
import factory from 'rdf-ext'
import parsePath from 'shacl-engine/lib/parsePath.js'
import * as _ from 'lodash-es'
import { cast } from '../helpers/cast'
import { GrapoiPointer, NamedNode, Options, TreeItem } from '../types'

/**
 * This method creates the backbone for the form.
 * It is the structure containing all the various widgets that might apply for a given SHACL tree.
 * 
 * One predicate
 * Some predicates from the current level
 * Nested sh:node with BlankNode or IRI
 * @see https://github.com/w3c/shacl/blob/9715ee1d8661ffd87322ab655161174ecc8d3967/shacl-compact-syntax/tests/valid/complex2.ttl#L32
 * 
 * TODO make recursive
 * Grab the required languages and think about language tabs in a recursive situation.
 */
export const shaclTree = async (report: any, shaclDataset: DatasetCore, options: Options, rootShaclIri: NamedNode) => {
  const shacl = grapoi({ dataset: shaclDataset, factory, term: rootShaclIri })
  const shaclShapes = shacl.hasOut([rdf('type')], [sh('NodeShape')])
  const shaclProperties = shaclShapes.hasOut([sh('property')])
  return processLevel(shaclProperties, report, options, shacl, shaclDataset, 1)
}

export const processLevel = async (shaclProperties: GrapoiPointer, report: any, options: Options, rootPointer: GrapoiPointer, shaclDataset: DatasetCore, depth: number) => {
  const level: any = {}

  for (const shaclProperty of shaclProperties.out([sh('property')])) {
    const shaclPropertyInner = shaclProperty.trim()

    let path = parsePath(shaclPropertyInner.out([sh('path')]))

    // TODO evaluate this structure. THis feels hackish.
    // Unfortunatly so does SHACL ordered list validation: https://archive.topquadrant.com/constraints-on-rdflists-using-shacl/
    const isOrderedList = path && path.length === 3 && 
      path?.[0].quantifier === 'one' && 
      path?.[1].quantifier === 'zeroOrMore' && 
      path?.[2].quantifier === 'one' && 
      path[1].predicates[0].equals(rdf('rest')) &&
      path[2].predicates[0].equals(rdf('first'))

    if (isOrderedList) path = [path[0]]
    
    let pointer = level

    if (!path) {
      const group = shaclPropertyInner.out([sh('group')]).term

      if (group) {
        const groupPointer = rootPointer.node().trim().out([null], [group]).distinct()
        if (!pointer._groups) pointer._groups = {}
        pointer._groups[shaclPropertyInner.term.value] = { groupPointer, group }  
      }

      continue
    }

    // Levels
    for (const [index, pathPart] of path.entries()) {
      const pathPartsTillNow = path.slice(0, index + 1)

      const shaclResults = report.results.filter((result: any) => _.isEqual(result.path, path))
      const messages = extractMessages(shaclResults)

      // Alternatives, only used for sh:alternativePath
      for (const predicate of pathPart.predicates) {

        // We MUST merge multiple paths into one and they all apply.
        // See end of https://www.w3.org/TR/shacl/#constraints
        if (!pointer[predicate.value]) {
          const item: TreeItem = {
            _messages: { errors: [], infos: [], warnings: [] },
            _shaclPointers: [],
            _pathPart: pathPart,
            _types: [],
            _isOrderedList: isOrderedList,
            _shaclPointer: shaclPropertyInner,
            // sh:or, sh:xone, sh:qualifiedValueShape
            get _alternatives () {
              return _.once(() => pointersToAlternatives(item._shaclPointers))()
            },
            get _widgets () {
              return _.once(() => {
                const { single: singleWidgets } = options.widgets

                return item._alternatives.flatMap(alternative => {
                  return Object.values(singleWidgets).map(widget => {
                    const widgetClass = Array.isArray(widget) ? widget[0] : widget
                    const widgetSettings = Array.isArray(widget) ? widget[1] : {}

                    return {
                      _shaclPointer: alternative.pointer.distinct(),
                      _alternative: alternative,
                      _order: alternative.pointer.out(sh('order')).value ? parseInt(alternative.pointer.out(sh('order')).value) : 0,
                      _widget: widgetClass,
                      _widgetSettings: widgetSettings,
                      _predicate: predicate,
                      _path: pathPartsTillNow,
                      _pathPart: pathPart
                    }
                  })
                })
              })()
            }
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
          pointer[predicate.value]._shaclPointers.push(shaclPropertyInner)
        }
        else {
          pointer[predicate.value]._types.push('parent')

          // Creates a pointer for a group that otherwise does not have a definition.
          const dataset = factory.dataset()
          const groupPointer = grapoi({ dataset, factory, term: factory.blankNode() })
          groupPointer.addOut(sh('nodeKind'), sh('BlankNodeOrIRI'))
          pointer[predicate.value]._shaclPointers.push(groupPointer)
        }

        const nestedShape = shaclPropertyInner.out(sh('node')).term

        /**
         * TODO Should we also allow blankNodes?
         */
        if (nestedShape?.termType === 'NamedNode') {
          const shacl = grapoi({ dataset: shaclDataset, factory, term: nestedShape })
          const shaclProperties = shacl.hasOut([sh('property')]).trim()

          const mergedPointer = shaclPropertyInner.node([
            ...shaclProperties.distinct().terms,
            ...shaclPropertyInner.terms,
          ]).distinct()

          const nestedTree = processLevel(mergedPointer, report, options, shacl, shaclDataset, depth++)
          Object.assign(pointer[predicate.value], nestedTree)
        }

        // Set the pointer for the next round.
        pointer = pointer[predicate.value]
      }
    }
  }

  if (depth === 1) {
    const shaclGroups = rootPointer.node().out([rdf('type')], [sh('PropertyGroup')]).in().distinct()

    for (const shaclGroup of shaclGroups) {
      if (!level._groups) level._groups = {}
      level._groups[shaclGroup.term.value] = { groupPointer: shaclGroup, group: shaclGroup.term }  
    }  
  }

  for (const multiWidget of Object.values(options.widgets.multi)) {
    const supportedCombinations: Array<{
      [key: string]: NamedNode
    }> = multiWidget.supportedCombinations
    for (const supportedCombination of supportedCombinations) {
      let foundIncompatibility = false
      const mapping: any = {}
      const fields: { [key: string]: any } = {}
      for (const [key, predicate] of Object.entries(supportedCombination)) {
        if (!key.endsWith('?') && !level[predicate.value]) {
          foundIncompatibility = true
          break
        }

        if (level[predicate.value]) {
          mapping[key.replaceAll('?', '')] = predicate
          fields[predicate.value] = level[predicate.value]
        }
      }

      if (!foundIncompatibility) {

        for (const [_predicate, field] of Object.entries(fields)) {
          field._usedInGroup = true
        }

        level[multiWidget.name] = { 
          _widgets: [{
            _mapping: mapping, 
            _fields: fields,
            _widget: multiWidget,
            _shaclPointer: shaclProperties.distinct()
          }]
        }
      }
    }
  }

  return level
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
  if (!pointers.length) return []
  const baseTerms = pointers.flatMap((p: any) => p.terms)
  const baseAlternatives = pointers[0].node(baseTerms)
  const orAlternatives = [...baseAlternatives.out([sh('or')]).trim()?.list() ?? []].map(pointer => pointer.trim().out())
  const qualifiedAlternative = baseAlternatives.out([sh('qualifiedValueShape')]).trim().out()

  const qualifiedValueShapesDisjointValue = baseAlternatives.out([sh('qualifiedValueShapesDisjoint')]).term
  const qualifiedValueShapesDisjoint = qualifiedValueShapesDisjointValue ? cast(qualifiedValueShapesDisjointValue) : false

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
      pointer: orAlternative.node([...baseTerms, orAlternative.term]),
      type: 'or'
    })),
  ].filter(Boolean)
}
