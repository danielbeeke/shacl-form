import { sh, rdf, xsd } from '../namespaces'
import type { Literal, Quad } from 'n3'
import grapoi from 'grapoi'
import { rdfTermValueToTypedVariable } from '../helpers/rdfTermValueToTypedVariable'

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

/**
 * Transforms the pointers to SHACL triples of one SHACL property to a JS object.
 */
const propertiesToObject = (pointers: Array<any>) => {
  const properties: any = {}

  const processProperty = (propertyQuad: any) => {
    let propertyName = propertyQuad.predicate.value.replace(sh('').value, '')
    if ([
      'or', 
      'qualifiedValueShape', 
    ].includes(propertyName)) return

    const type = (propertyQuad.object as Literal).datatype
    const cleanedValue = rdfTermValueToTypedVariable(propertyQuad.object)

    if (type && [rdf('langString').value, xsd('string').value].includes(type.value)) {
      if (!properties[propertyName]) properties[propertyName] = {}
      const prefix = (propertyQuad.object as Literal).language ? (propertyQuad.object as Literal).language : 'default'
      properties[propertyName][prefix] = cleanedValue
    }
    else {
      properties[propertyName] = cleanedValue
    }
  }

  for (const pointer of pointers) {
    if (pointer.isList()) {
      const propertyQuad = [...pointer.quads()][0]
      const children = [...pointer.trim().list()].flatMap( i => [...i.quads()])
      let propertyName = propertyQuad.predicate.value.replace(sh('').value, '')
      properties[propertyName] = children.map(child => rdfTermValueToTypedVariable(child.object))
    }
    else {
      const propertyQuads = [...pointer.quads()]
      for (const propertyQuad of propertyQuads) processProperty(propertyQuad)
    }
  }

  return properties
}

/**
 * Are we going to allow nested ORs?
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
        properties: propertiesToObject(pointers),
        messages: extractMessages([...rootConstraints, orConstraint]),
        widget: 'string',
        ptrs: pointers,
      }
    })
  }
  else {
    return [{
      properties: propertiesToObject([properties]),
      messages: extractMessages(rootConstraints),
      widget: 'string',
      ptrs: [properties],
    }]
  }
}

/**
 * First merge all constraints into a map with the path as the key,
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