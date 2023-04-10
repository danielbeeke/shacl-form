import { sh } from '../namespaces'
import { Quad } from 'n3'
import grapoi from 'grapoi'
import rdf from 'rdf-ext'
import { DataFactory } from 'rdf-ext'
const df = new DataFactory()

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

      if (!pointer[predicateName] && index !== path.length - 1) {
        const dataset = rdf.dataset([df.quad(
          df.namedNode('urn:unknown'),
          sh('path'),
          pathPart.predicates[0],
          null as unknown as undefined
        )])
        
        const shaclPointer = grapoi({ dataset, term: df.namedNode('urn:unknown') })

        pointer[predicateName] = {
          _constraintsSet: [{
            widget: 'field-blank-node',
            shaclPointer,
            path
          }]
        }
      }

      if (!pointer[predicateName]) {
        pointer[predicateName] = {}
      }
  
      if (index === path.length - 1) {
        pointer[predicateName]._constraintsSet = processConstraints(constraints)
      }
  
      pointer = tree[predicateName]
    }
  }

  return tree
}


/**
 * Convert the constraints to an intermediate format.
 * This is for one SHACL property.
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
  const firstConstraint = (rootConstraints?.[0] ?? orConstraints?.[0])
  const dataPointer = firstConstraint.focusNode

  console.log(firstConstraint)

  let widgets: Array<any> = []

  if (orConstraints?.length) {
    widgets = orConstraints.map(orConstraint => {
      const pointers = [orConstraint.shape.ptr.ptrs[0], rootConstraints?.[0]?.shape.ptr.ptrs[0]].filter(Boolean)
      const shaclPointer = orConstraint.shape.ptr.clone({ ptrs: pointers })

      return {
        messages: extractMessages([...rootConstraints, orConstraint]),
        widget: 'string', // TODO set these via a class.
        shaclPointer,
        dataPointer,
        path: firstConstraint.path
      }
    })
  }
  else {
    const pointers = [rootConstraints[0].shape.ptr.ptrs[0]]
    const shaclPointer = rootConstraints[0].shape.ptr.clone({ ptrs: pointers })

    widgets = [{
      messages: extractMessages(rootConstraints),
      widget: 'string',
      shaclPointer,
      dataPointer,
      path: firstConstraint.path
    }]
  }

  const values = [...dataPointer.out().quads()]

  return values.flatMap((value, index) => {
    return widgets.map(widget => {
      widget.value = value
      widget.index = index
      return widget
    })
  })
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

  return [{ quantifier: "one", start: "subject", end: "object", predicates: [pathQuad.object] }]
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
