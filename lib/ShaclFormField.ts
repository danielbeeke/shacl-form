import { NamedNode, Quad } from 'n3'
import type { GrapoiPointer } from './types'
import { DataFactory } from 'n3';
import type { NamedNode as NamedNodeType } from '@rdfjs/types'

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
 * 
 */
export interface IShaclFormFieldConstructor {
  new(): IShaclFormField;
  elementName: string
  score (shaclPointer: GrapoiPointer): number
}

export interface IShaclFormField extends HTMLElement {
  messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  }
  shaclPointer: GrapoiPointer,
  dataPointer: GrapoiPointer,
  value: Quad
  index: number
}

export type StaticImplements<I extends new (...args: any[]) => any, C extends I> = InstanceType<I>

/**
 * What interface should be implemented by a widget developer towards SHACL form?
 * 
 * At minimum a customElements JavaScript class that has not been registered with customElements.define.
 * This class must have a static property 'elementName' which is the HTML tag name.
 * 
 * It must implement a static method score which receives a Grapoi pointer which has access to the SHACL property.
 * This score function must return a boolean.
 * 
 * Proeprties available inside the class (this):
 * 
 *   - shaclPointer: GrapoiPointer
 *   - value: Quad a getter method that grabs the fresh correct value from the pointer
 *   - dataPointer: GrapoiPointer
 * 
 * The TypeScript class 'ShaclFormField' has been made to make this easier to the developer.
 */
export abstract class ShaclFormField<T extends IShaclFormFieldConstructor> 
extends HTMLElement implements StaticImplements<IShaclFormFieldConstructor, T> {

  public messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  } = {
    errors: [],
    infos: [],
    warnings: []
  }

  public path: any
  public predicate: NamedNodeType = new NamedNode('')
  public index: number = 0
  public shaclPointer: GrapoiPointer = {} as GrapoiPointer
  public dataPointer: GrapoiPointer = {} as GrapoiPointer

  public df = DataFactory

  get value (): Quad {
    const quads = [...this.dataPointer.out([this.predicate]).quads() ?? []]
    return quads[this.index]
  }
}