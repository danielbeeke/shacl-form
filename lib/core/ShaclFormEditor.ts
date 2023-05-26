import type { GrapoiPointer, Term, Options } from '../types'

export interface IShaclFormEditorConstructor {
  new(): IShaclFormEditor;
  score (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer, options: Options): number
}

export interface IShaclFormEditor extends HTMLElement {
  shaclPointer: GrapoiPointer,
  dataPointer: () => GrapoiPointer,
  value: Term
  index: number
  uiLanguagePriorities: Array<string>
}

export type StaticImplements<I extends new (...args: any[]) => any, C extends I> = InstanceType<I>
