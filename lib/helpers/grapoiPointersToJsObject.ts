import { sh, rdf, xsd } from '../namespaces'
import type { Literal } from 'n3'
import { rdfTermValueToTypedVariable } from '../helpers/rdfTermValueToTypedVariable'

/**
 * Transforms Grapoi pointers of triples to a JS object.
 */
export const grapoiPointersToJsObject = (pointers: Array<any>) => {
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