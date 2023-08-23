import type { GrapoiPointer, Term, NamedNode, ShaclFormType } from '../types'
import factory from 'rdf-ext'
import { IShaclFormEditorConstructor, StaticImplements } from './ShaclFormEditor'
import { sh, shFrm } from '../helpers/namespaces'
import { replaceList } from '../helpers/replaceList'
import DatasetCore from '@rdfjs/dataset/DatasetCore'

export abstract class ShaclFormSingleEditor<T extends IShaclFormEditorConstructor> 
extends HTMLElement implements StaticImplements<IShaclFormEditorConstructor, T> {

  public messages: {
    errors: Array<string>,
    infos: Array<string>,
    warnings: Array<string>
  } = {
    errors: [],
    infos: [],
    warnings: []
  }

  public isList: boolean = false
  public path: any
  public predicate: NamedNode = factory.namedNode('')
  public index: number = 0
  public shaclPointer: GrapoiPointer = {} as GrapoiPointer
  public dataPointer: () => GrapoiPointer = () => ({} as GrapoiPointer)
  public df = factory
  public uiLanguagePriorities: Array<string> = []
  public isHeader: boolean = false
  public isFooter: boolean = false
  #form: ShaclFormType = undefined as unknown as ShaclFormType
  public widgetSettings: any

  public static type = 'single'

  static get iri () {
    return shFrm(ShaclFormSingleEditor.name).value
  }

  static set iri (_value: any) {

  }
    
  static score(_shaclPointer: GrapoiPointer, _dataPointer: GrapoiPointer) {
    return 0
  }

  static createNewObject (_form: any, _shaclPointer: GrapoiPointer) {
    return factory.namedNode('') as any
  }

  get values (): Array<Term> {
    if (this.dataPointer().out([this.predicate]).isList()) {
      return [...this.dataPointer().out([this.predicate]).list()]
        .map(part => part.term)
    }
    else {
      return this.dataPointer()
        .out([this.predicate]).terms
    }
  }

  get value (): Term {
    return this.values[this.index]
  }

  set value (newValue: Term) {
    if (newValue.equals(this.value)) return

    if (this.isList) {
      const newValues = [...this.values]
      newValues[this.index] = newValue
      replaceList(newValues, this.dataPointer().out([this.predicate]))
    }
    else {
      this.dataPointer()
      .deleteOut(this.predicate, this.value)
      .addOut(this.predicate, newValue)
    }

    const event = new CustomEvent('value.set', {
      detail: {
        predicate: this.predicate,
        object: newValue,
        dataPointer: this.dataPointer(),
        shaclPointer: this.shaclPointer,
        element: this
      }
    })
    this.form.dispatchEvent(event)
    this.renderAll()
  }

  addValue (newValue: Term) {
    if (this.isList) {
      const newValues = [...this.values]
      newValues.push(newValue)
      replaceList(newValues, this.dataPointer().out([this.predicate]))
    }
    else {
      this.dataPointer().addOut(this.predicate, newValue)
    }

    const event = new CustomEvent('value.set', {
      detail: {
        predicate: this.predicate,
        object: newValue,
        dataPointer: this.dataPointer(),
        shaclPointer: this.shaclPointer,
        element: this
      }
    })
    this.form.dispatchEvent(event)
    this.renderAll()
  }


  renderAll () {
    this.form.render()
  }

  get rdfDataset (): DatasetCore {
    return this.dataPointer().ptrs[0].dataset
  }

  get form () {
    if (this.#form) return this.#form
    this.#form = this.closest('.shacl-form') as ShaclFormType
    return this.#form
  }

  async beforeRemove (): Promise<boolean> {
    return true
  }

  async connectedCallback () {
    this.render()
  }

  render () {}

  header (): any {
    return null
  }

  template (_props: any): any {
    return null
  }

  footer (): any {
    return null
  }

  getInputProps () {
    const props: { [key: string]: any } = {}

    const maxCount = this.shaclPointer.out([sh('maxCount')]).value ?? Infinity
    const minCount = this.shaclPointer.out([sh('minCount')]).value ?? 0

    const nonEmptyValues = this.values.filter(value => value.value)

    const required = minCount > 0 && maxCount >= nonEmptyValues.length
    if (required) props.required = true

    return props
  }
}