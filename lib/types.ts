import type { NamedNode } from '@rdfjs/types'
import { Quad } from 'n3'
export { BlankNode, Literal, Quad, Variable } from 'n3'

export type ShaclProperties = {
  description?: { [key: string]: string },
  group?: string,
  languageIn?: Array<string>,
  minCount?: number,
  name?: { [key: string]: string },
  order?: number,
  qualifiedMaxCount?: number,
  qualifiedMinCount?: number,
  uniqueLang?: boolean
  path?: string
}

export type GrapoiPointer = {
  list: () => null | Array<any>
  in: (predicates?: Array<NamedNode>, objects?: Array<NamedNode>) => GrapoiPointer
  out: (predicates?: Array<NamedNode>, subjects?: Array<NamedNode>) => GrapoiPointer
  deleteOut: (predicates?: Array<any>, objects?: Array<any>) => GrapoiPointer,
  addOut: (predicates?: Array<any>, objects?: Array<any>) => GrapoiPointer,
  quads: () => Array<Quad>
  trim(): GrapoiPointer
  values: Array<any>
  value: any
}