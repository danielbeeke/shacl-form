import type { GrapoiPointer, Term, NamedNode, ShaclFormType } from '../types'
import factory from 'rdf-ext'
import { IShaclFormWidgetConstructor, StaticImplements } from './ShaclFormWidget'

export abstract class ShaclFormWidgetSingle<T extends IShaclFormWidgetConstructor> 
extends HTMLElement implements StaticImplements<IShaclFormWidgetConstructor, T> {

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

  public static type = 'single'

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

  renderAll () {
    this.form.render()
  }

  get form () {
    return this.closest('.shacl-form') as ShaclFormType
  }

  async beforeRemove () {}

  async connectedCallback () {
    this.render()
  }

  render () {}
}