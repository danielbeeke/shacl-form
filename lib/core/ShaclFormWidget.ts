import type { GrapoiPointer, Term } from '../types'

export interface IShaclFormWidgetConstructor {
  new(): IShaclFormField;
  score (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer): number
}

export interface IShaclFormField extends HTMLElement {
  shaclPointer: GrapoiPointer,
  dataPointer: () => GrapoiPointer,
  value: Term
  index: number
  uiLanguagePriorities: Array<string>
}

export type StaticImplements<I extends new (...args: any[]) => any, C extends I> = InstanceType<I>
