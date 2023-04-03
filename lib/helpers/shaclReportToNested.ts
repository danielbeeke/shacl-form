import { sh } from '../namespaces'
import type { Quad } from 'n3'
import grapoi from 'grapoi'
import { grapoiPointersToJsObject } from './grapoiPointersToJsObject'

/**
 * Converts the shacl report to a tree structure containing all possible combinations of the SHACL data.
 */
export const shaclReportToNested = (report: any) => {
  const pathMap: Map<string, Array<any>> = new Map()

  for (const result of report.results) {
    if (!result.path) {
      result.path = getPathForOrResult(result)
      result.isOr = true
    }
    const predicatesString = result.path!.map((pathPart: any) => pathPart.predicates[0]?.value).join('||')

    if (!pathMap.has(predicatesString)) pathMap.set(predicatesString, [])
    const pathMapArray = pathMap.get(predicatesString)!
    pathMapArray.push(result)
  }

  const tree: any = {}

  for (const constraints of pathMap.values()) {
    const path = constraints[0].path

    let pointer = tree
    for (const [index, pathPart] of path.entries()) {
      const predicateName = pathPart.predicates[0].value

      // TODO atleast create a group widget
      if (!pointer[predicateName]) pointer[predicateName] = {}
  
      if (index === path.length - 1) {
        pointer[predicateName]._widgets = processConstraints(constraints)
        // pointer[predicateName]._activeWidget = ''
      }
  
      pointer = tree[predicateName]
    }
  }

  return tree
}


/**
 * Convert the constraints to an intermediate format.
 */
const processConstraints = (constraints: Array<any>) => {
  const processedTerms = new Set()
  constraints = constraints.filter(constraint => {
    const term = constraint.shape.ptr.term
    if (processedTerms.has(term.value)) return null
    processedTerms.add(term.value)
    return true
  })

  const orConstraints = constraints.filter(constraint => constraint.isOr)
  const rootConstraints = constraints.filter(constraint => !constraint.isOr)
  const properties = rootConstraints[0].shape.ptr.trim().out()

  if (orConstraints?.length) {
    return orConstraints.map(orConstraint => {
      const pointers = [properties, orConstraint.shape.ptr.trim().out()]
      
      return {
        properties: grapoiPointersToJsObject(pointers),
        messages: extractMessages([...rootConstraints, orConstraint]),
        widget: 'string',
        ptrs: pointers,
      }
    })
  }
  else {
    return [{
      properties: grapoiPointersToJsObject([properties]),
      messages: extractMessages(rootConstraints),
      widget: 'string',
      ptrs: [properties],
    }]
  }
}

/**
 * Constraints that re inside an sh:or blankNode do not have a direct path available.
 * This will fetch the path and add it into the structure.
 */
const getPathForOrResult = (result: any) => {
  const shaclPropertyQuad = [...result.shape.ptr.out().quads()]
    .find((quad: Quad) => quad.predicate.equals(sh('property')))
  
  const shaclProperty = grapoi({ 
    dataset: result.shape.ptr.dataset, 
    term: shaclPropertyQuad.object,
    factory: result.shape.ptr.factory
  })

  const pathQuad = [...shaclProperty.out([sh('path')]).quads()].pop()
  if (!pathQuad) throw new Error('This is unexpected (for now)')

  const path = [{ quantifier: "one", start: "subject", end: "object", predicates: [pathQuad.object] }]
  return path
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
