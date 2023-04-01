import { sh, rdf } from '../namespaces'
import type { Store, Quad } from 'n3'
import grapoi from 'grapoi'

const supportedPathTypes = ['one']

const toMesssages = (constraints: Array<any>) => {
  return [... new Set(constraints.flatMap((constraint: any) => constraint.message.map((message: any) => message.value)))]
}

const resolveWidgets = (data: any) => {
  const widgets = []
  const jsConstraints = Object.assign({}, ...data.constraints.flatMap((constrain: any) => constrain.args))
  console.log(data.constraints, jsConstraints, data)
}

export const shaclReportToNested = (report: any, store: Store) => {
  const paths = [...new Set(report.results.map((result: any) => result.path as Array<any>))] as Array<Array<any>>
  const supportedPaths = paths.filter((innerPaths: any) => innerPaths?.[0]?.quantifier === 'one')
  const unsupportedPathTypes = [...new Set(paths.map((innerPaths: any) => innerPaths?.[0]?.quantifier))]
    .filter(type => type && !supportedPathTypes.includes(type))
  if (unsupportedPathTypes.length) console.info(`Found unsupported paths: ${unsupportedPathTypes.join(', ')}`)
  
  const tree: any = {}

  // This fetching the path that is missing because it resides in some parent because of sh:or.
  const orPaths = report.results.filter((constraint: any) => !constraint.path)
    .map((constraint: any) => {
      const shaclPropertyQuad = [...constraint.shape.ptr.out().quads()].find((quad: Quad) => quad.predicate.equals(sh('property')))
      const shaclProperty = grapoi({ 
        dataset: constraint.shape.ptr.dataset, 
        term: shaclPropertyQuad.object,
        factory: constraint.shape.ptr.factory
      })

      const pathQuad = [...shaclProperty.out([sh('path')]).quads()].pop()
      if (!pathQuad) return null

      const path = [{ quantifier: "one", start: "subject", end: "object", predicates: [pathQuad.object] }]
      constraint.path = path
      return path  
    }).filter(Boolean)

  for (const path of [...supportedPaths, ...orPaths]) {
    const constraints = report.results.filter((result: any) => result.path === path)

    const errors = constraints.filter((constraint: any) => constraint.severity.equals(sh('Violation')))
    const infos = constraints.filter((constraint: any) => constraint.severity.equals(sh('Info')))
    const warnings = constraints.filter((constraint: any) => constraint.severity.equals(sh('Warning')))

    const messages = {
      errors: toMesssages(errors),
      infos: toMesssages(infos),
      warnings: toMesssages(warnings)
    }

    let pointer = tree

    for (const pathPart of path) {
      const predicateName = pathPart.predicates[0].value
      const _data = { messages, constraints, path }
      if (!pointer[predicateName]) pointer[predicateName] = { _data, _widgets: [] }
      pointer[predicateName]._widgets.push(resolveWidgets(_data))
      pointer = tree[predicateName]
    }
  }

  return tree
}