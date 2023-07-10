import type { GrapoiPointer, Term, NamedNode, ShaclFormType } from '../types'
import factory from 'rdf-ext'
import { IShaclFormEditorConstructor, StaticImplements } from './ShaclFormEditor'
import { sh } from '../helpers/namespaces'

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

  public path: any
  public predicate: NamedNode = factory.namedNode('')
  public index: number = 0
  public shaclPointer: GrapoiPointer = {} as GrapoiPointer
  public dataPointer: () => GrapoiPointer = () => ({} as GrapoiPointer)
  public df = factory
  public uiLanguagePriorities: Array<string> = []
  public isHeader: boolean = false
  public isFooter: boolean = false

  public static type = 'single'

  get values (): Array<Term> {
    return this.dataPointer()
      .out([this.predicate]).terms
  }

  get value (): Term {
    return this.dataPointer()
      .out([this.predicate]).terms[this.index]
  }

  set value (newValue: Term) {
    (async () => {
      this.dataPointer()
        .deleteOut(this.predicate, this.value)
        .addOut(this.predicate, newValue)

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
    })()
  }

  addValue (newValue: Term) {
    (async () => {
      this.dataPointer()
        .addOut(this.predicate, newValue)

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
    })()
  }


  renderAll () {
    this.form.render()
  }

  get form () {
    return this.closest('.shacl-form') as ShaclFormType
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

  template (props: any): any {
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