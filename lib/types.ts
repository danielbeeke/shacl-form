import type { NamedNode, Quad, Term } from '@rdfjs/types'
import { ShaclFormWidget } from './core/ShaclFormWidget'
export type { BlankNode, Literal, Quad, Variable, NamedNode } from '@rdfjs/types'

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
  out: (predicates?: Array<NamedNode>, subjects?: Array<NamedNode>) => GrapoiPointer
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
  node: (pointers: Array<any>) => GrapoiPointer
  term: Term
  terms: Array<Term>
  [Symbol.iterator]: () => Iterator<any>
}

export type Options = {
  widgets: {
    [key: string]: any
  }
}

export type Alternative = {
  
}

export type Widget = {
  _pointer: GrapoiPointer,
  _score: number,
  _alternative: Alternative,
  _widget: any,
  _dataPointer: GrapoiPointer,
  _predicate: NamedNode,
  _path: Array<any>,
  _messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  },
  _element: ShaclFormWidget<any>
}

export type TreeItem = {
  _pointers: Array<GrapoiPointer>,
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
