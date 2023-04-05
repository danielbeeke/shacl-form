import { ShaclProperties } from './types'

export interface IShaclFormFieldConstructor {
  new(): IShaclFormField;
  elementName: string
  applies (propertyPointers: Array<any>): boolean
}

export interface IShaclFormField extends HTMLElement {
  properties: ShaclProperties
  messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  }
  pointer: any
}

export type StaticImplements<I extends new (...args: any[]) => any, C extends I> = InstanceType<I>;

export abstract class ShaclFormField<T extends IShaclFormFieldConstructor> 
extends HTMLElement implements StaticImplements<IShaclFormFieldConstructor, T> {
  public properties: ShaclProperties = {}
  public messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  } = {
    errors: [],
    infos: [],
    warnings: []
  }
  public pointer: any
}

/**
 * At the moment we need:
 * class String extends ShaclFormField<typeof String>
 * 
 * This is odd ofcourse, TypeScript could probably be made so that it sees String as the fallback argument.
 * Why do we have this? It is all to support static members in a class that are checked.
 * In our use case it is about the property elementName.
 * 
 * @see https://github.com/microsoft/TypeScript/issues/39180
 * Please add a comment there so that TypeScript knows more people would want this feature.
 */
