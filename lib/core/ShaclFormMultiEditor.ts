import type { GrapoiPointer, Term, NamedNode, ShaclFormType } from '../types'
import factory from 'rdf-ext'
import { IShaclFormEditorConstructor, StaticImplements } from './ShaclFormEditor'
import { createRoot, Root } from 'react-dom/client'
import { FormLevelBase } from '../components/FormLevel'
import { createElement } from 'react'
import { rdfs, sh } from '../helpers/namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import parsePath from 'shacl-engine/lib/parsePath.js'

export abstract class ShaclFormMultiEditor<T extends IShaclFormEditorConstructor> 
extends HTMLElement implements StaticImplements<IShaclFormEditorConstructor, T> {

  public path: any
  public predicate: NamedNode = factory.namedNode('')
  public index: number = 0
  public shaclPointer: GrapoiPointer = {} as GrapoiPointer
  public dataPointer: () => GrapoiPointer = () => ({} as GrapoiPointer)
  public df = factory
  public uiLanguagePriorities: Array<string> = []
  public fields: any

  public reactRoot: Root | undefined
  public combinedFields: HTMLDivElement | undefined

  public mapping: {
    [key: string]: NamedNode
  } = {}

  get value (): Term {
    return this.dataPointer().terms[this.index]
  }

  public static type = 'multi'

  static createNewObject () {
    return factory.blankNode()
  }

  async connectedCallback () {
    this.combinedFields = document.createElement('div')
    this.reactRoot = createRoot(this.combinedFields!)
    const form = this.closest('.shacl-form')! as any

    this.reactRoot.render(createElement(FormLevelBase, {
      tree: this.fields,
      uiLanguagePriorities: form.uiLanguagePriorities,
      shaclPointer: this.shaclPointer,
      dataPointer: this.dataPointer(),
      form: form,
      ignoreGroups: true
    }))

    this.render()
  }

  renderAll () {
    this.form.render()
  }

  get form () {
    return this.closest('.shacl-form') as ShaclFormType
  }

  render () {}

  // Finding the predicates probably is a score of 100 worth.
  static score() { return 100 }

  setValues (values: {
    [key: string]: Term | undefined
  }) {

    for (const [key, mappedPredicate] of Object.entries(this.mapping)) {
      const newValue = values[key]
      const oldValue = this.dataPointer().out([mappedPredicate]).term

      this.dataPointer().deleteOut(mappedPredicate, oldValue)
      if (newValue) this.dataPointer().addOut(mappedPredicate, newValue)

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

    }

    this.renderAll()
  }

  getValues () {
    const values: any = {}
    for (const [key, mappedPredicate] of Object.entries(this.mapping)) {
      const value = this.dataPointer().out([mappedPredicate]).term
      if (value) values[key] = value
    }
    return values
  }

  getValuesWithLabels () {
    const labels: Map<string, string> = new Map()
    for (const shaclProperty of this.shaclPointer.out([sh('property')])) {
      const names = shaclProperty.out([sh('name'), rdfs('label')])
      const label = bestLanguage(names, this.uiLanguagePriorities)
      const path = parsePath(shaclProperty.out([sh('path')]))
      for (const predicate of path.pop().predicates) labels.set(predicate.value, label)
    }

    const values: Array<{
      label: string,
      value: Term,
      key: string,
      predicate: NamedNode
    }> = []

    for (const [key, mappedPredicate] of Object.entries(this.mapping)) {
      const value = this.dataPointer().out([mappedPredicate]).term

      const label = labels.get(mappedPredicate.value)
      if (value && value.value && label) values.push({
        label,
        value,
        key,
        predicate: mappedPredicate
      })
    }

    return values
  }

}