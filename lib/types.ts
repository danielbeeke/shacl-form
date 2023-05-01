import type { NamedNode, Quad, Term } from '@rdfjs/types'
import { ShaclFormWidgetSingle } from './core/ShaclFormWidgetSingle'
export type { BlankNode, Literal, Quad, Variable, NamedNode, Term } from '@rdfjs/types'

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
  in: (predicates?: Array<NamedNode>, objects?: Array<NamedNode>) => GrapoiPointer
  out: (predicates?: Array<NamedNode | null>, subjects?: Array<NamedNode>) => GrapoiPointer
  hasOut(predicates?: Array<NamedNode | null>, subjects?: Array<NamedNode>) => GrapoiPointer
  deleteOut: (predicates?: Array<any> | any, objects?: Array<any> | any) => GrapoiPointer,
  addOut: (predicates?: Array<any> | any, objects?: Array<any> | any) => GrapoiPointer,
  quads: () => Array<Quad>
  trim(): GrapoiPointer
  values: Array<any>
  filter: (item: any) => boolean
  value: any
  isList: () => Boolean,
  list: () => Array<GrapoiPointer>
  ptrs: Array<any>
  clone: (data: any) => GrapoiPointer  
  node: (pointers?: Array<any>) => GrapoiPointer
  execute: (paths: Array<any>) => GrapoiPointer
  replace: (replacement: any) => GrapoiPointer
  term: Term
  terms: Array<Term>
  [Symbol.iterator]: () => Iterator<any>
}

export type Options = {
  widgets: {
    [key: string]: any
  },
  groups: {
    [key: string]: any
  },
  enhancer: any
}

export type Alternative = {
  
}

export type Widget = {
  _shaclPointer: GrapoiPointer,
  _score: number,
  _alternative: Alternative,
  _widget: any,
  _predicate: NamedNode,
  _path: Array<any>,
  _pathPart: Array<any>,
  _messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  },
  _element: ShaclFormWidgetSingle<any>
}

export type TreeItem = {
  _shaclPointers: Array<GrapoiPointer>,
  _messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  },
  _pathPart: any,
  _types: Array<string>,
  _alternatives: Array<any>
  _widgets: Array<any>
}
