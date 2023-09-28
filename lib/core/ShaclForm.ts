import { Validator } from 'shacl-engine'
import { Parser, Store } from 'n3'
import rdfDataset from '@rdfjs/dataset'
import factory from 'rdf-ext'
import DatasetCore from '@rdfjs/dataset/DatasetCore'
import { sh, rdf, shFrm, shn } from '../helpers/namespaces'
import * as prefixesSource from '../helpers/namespaces'
import { createRoot } from 'react-dom/client'
import { createElement, StrictMode } from 'react'
import { FormLevelBase } from '../components/FormLevel'
import { shaclTree } from './shaclTree'
import { LocalizationProvider } from '@fluent/react';
import { l10n } from './l10n'
import type { Root } from 'react-dom/client'
import type { Options, NamedNode, GrapoiPointer, Literal } from '../types'
import grapoi from 'grapoi'
import '../scss/style.scss'
import { swapSubject } from '../helpers/swapSubject'
import { Writer } from 'n3'
import { StoreProxy } from './StoreProxy'
import parsePath from 'shacl-engine/lib/parsePath.js'
import { removeRecursively } from '../helpers/removeRecursively'

export const init = (options: Options) => {

  /**
   * A customElement to render SHACL as a form.
   * 
   * @attribute subject - Useful when creating data. It will set the subject to this uri.
   * @attribute shacl-url - The place where the SHACL turtle is stored, it should allow CORS.
   * @attribute shape-uri - Set this attribute if you have multiple shapes in your shape turtle file and do not want to use the first shape.
   */
  class ShaclForm extends HTMLElement {

    #validator: typeof Validator
    #subject: NamedNode = factory.namedNode('')
    #store: Store
    #shaclDataset: DatasetCore = rdfDataset.dataset()
    shapeUris: Array<NamedNode> = []
    #rootShaclIri: NamedNode = factory.namedNode('')
    #root: Root
    #uiLanguagePriorities: Array<string> = ['*']
    public options: Options
    #data: GrapoiPointer = {} as GrapoiPointer
    public touchedSave = false
    oldReport: any

    constructor () {
      super()
      this.#store = new Proxy(new Store(), StoreProxy(this))
      this.options = options
      this.#root = createRoot(this)
    }

    async connectedCallback () {
      this.classList.add('shacl-form')
      const parser = new Parser()
      const shaclUrl = this.attributes.getNamedItem('shacl-url')?.value
      if (!shaclUrl) throw new Error('A shacl-url property is required. It should link to a SHACL turtle file')
      const shaclText = await fetch(shaclUrl).then(response => response.text())
      const shaclQuads = await parser.parse(shaclText)
      this.#shaclDataset = rdfDataset.dataset(shaclQuads)

      const mustEnhance = this.getAttribute('enhance') !== null

      if (mustEnhance && this.options.enhancer) {
        const ResolvedEnhancer = await this.options.enhancer()
        const enhancer = new ResolvedEnhancer()
        await enhancer.execute(this.#shaclDataset)  
      }

      this.#validator = new Validator(this.#shaclDataset, { coverage: true, factory, details: true })

      const nodeShapeQuads = this.#shaclDataset.match(null, rdf('type'), sh('NodeShape'))
      for (const nodeShapeQuad of nodeShapeQuads) {
        this.shapeUris.push(nodeShapeQuad.subject as NamedNode)
      }

      if (this.shapeUris.length === 1) this.#rootShaclIri = this.shapeUris[0]
      const shaclIri = this.attributes.getNamedItem('shacl-iri')?.value

      if (shaclIri) this.#rootShaclIri = factory.namedNode(shaclIri)

      // If we can not find the buttons we must add this group ourselves to the SHACL.
      const shacl = grapoi({ dataset: this.#shaclDataset, factory }) as GrapoiPointer
      const hasButtonGroup = shacl.out([rdf('type')], [shFrm('Buttons')]).terms.length > 0

      if (!hasButtonGroup) {
        const extraQuads = await parser.parse(`
          @prefix sh: <http://www.w3.org/ns/shacl#>.
          @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix shfrm: <https://github.com/danielbeeke/shacl-form/ontology#> .

          shfrm:ButtonGroup
            a sh:PropertyGroup, shfrm:Buttons .

          <${this.#rootShaclIri.value}> 
            sh:property [
              sh:group shfrm:ButtonGroup ;
              sh:order 1000 ;
            ] .
        `)
        
        for (const quad of extraQuads) this.#shaclDataset.add(quad)
      }

      const dataUrl = this.attributes.getNamedItem('data-url')?.value
      if (dataUrl) {
        const dataText = await fetch(dataUrl).then(response => response.text())
        if (dataText) {
          const dataQuads = await parser.parse(dataText)
          for (const dataQuad of dataQuads) this.#store.add(dataQuad)
          if (dataQuads?.[0]?.subject) this.#subject = dataQuads[0].subject as NamedNode  
        }
      }

      if (this.getAttribute('data-iri')) {
        this.#subject = factory.namedNode(this.getAttribute('data-iri') ?? 'urn:default-shacl-form-subject')
      }

      this.#uiLanguagePriorities = this.uiLanguagePriorities
      this.#uiLanguagePriorities.push('*')
      this.render()

      this.#data = grapoi({ dataset: this.#store, factory, term: this.#subject })

      if (!this.attributes.getNamedItem('content-languages')) {
        const contentLanguages = new Set()
        for (const quad of this.#store) {
          if ((quad.object as Literal).language) {
            contentLanguages.add((quad.object as Literal).language)
          }
        }

        // TODO add language discriminator 
        // Always execute so that we are able to displays any language if it is in the data
        
        this.setAttribute('content-languages', [...contentLanguages.values()].join(','))
      }
    }

    get subject () {
      return this.#subject
    }

    get dataPointer () {
      return this.#data
    }

    async render (renderOptions?: { skipValidation: boolean }) {
      const report = renderOptions?.skipValidation ? {} : this.oldReport

      this.oldReport = report

      const tree = await shaclTree(report, this.#shaclDataset, options, this.#rootShaclIri)
      const shacl = grapoi({ dataset: this.#shaclDataset, factory })

      // TODO try a new structure that has data and definition as input and that creates a render structure instead of two separate structures.
      this.#root.render(createElement(LocalizationProvider, { l10n, children: [
        // createElement(StrictMode, {
        //   key: 'strictmode',
        //   children: [
            createElement(FormLevelBase, { 
              form: this,
              tree, 
              ignoreGroups: false,
              shaclPointer: shacl,
              dataPointer: this.dataPointer,
              key: 'form', 
              uiLanguagePriorities: this.#uiLanguagePriorities 
            })
        //   ]
        // })
      ]}))
    }

    async save () {
      this.touchedSave = true
      await this.render()

      this.querySelector('form')?.reportValidity()

      const html5Valid = this.querySelector('form')?.checkValidity()

      const rdfIsValid = await this.validate()
      const errors = rdfIsValid.results.filter((result: any) => !shn('Trace').equals(result.severity) && !shn('Debug').equals(result.severity))

      if (!html5Valid || errors.length || rdfIsValid.dataset.size === 0) console.error('Form did NOT validate')

      const dataset = new Store([...this.store])
      const lists = dataset.extractLists({ remove: true });

      const writer = new Writer({ lists, prefixes: Object.fromEntries(Object.entries(prefixesSource).map(([key, term]) => [key, term('')])) })
      for (const quad of dataset) {
        // We simply skip empty items.
        if (quad.object.value && quad.object.termType !== 'BlankNode') writer.addQuad(quad)
        if (quad.object.termType === 'BlankNode') {
          const children = dataset.getQuads(quad.object, null, null, null)
          if (children.length || lists[quad.object.value]) writer.addQuad(quad)
        }
      }
      writer.end((error: Error, turtle: string) => {
        if (error) {
          console.error(error)
        }
        this.dispatchEvent(new CustomEvent('save', {
          detail: { turtle, dataset }
        }))
      })
    }

    set subject (newValue: NamedNode) {
      swapSubject(this.#store, this.subject, newValue)
    }

    async validate () {
      const dataset = this.store
      const validateStore = rdfDataset.dataset()
      /** @ts-ignore */
      const quads = await dataset.match().toArray()
      
      /**
       * TODO
       * Interesting... When validating and when saving it might be better to execute all the SHACL paths 
       * so that the values are gather and we at that moment can decid if we want to keep the empy value.
       */
      for (const quad of quads) {
        // We simply skip empty items.
        if (quad.object.value) validateStore.add(quad)
      }

      const report = this.#validator.validate({ dataset: validateStore, terms: [this.subject] }, [{
        terms: [this.#rootShaclIri]
      }])

      report.dataset = validateStore

      return report
    }

    removeLanguage (languageCode: string) {
      const dataset = this.dataPointer.ptrs[0].dataset
      for (const quad of dataset) {
        if (quad.object.language === languageCode)
          dataset.delete(quad)
      }

      const shacl = grapoi({ dataset: this.#shaclDataset, factory })
      const languageDiscriminatorNodes = shacl.hasOut([shFrm('languageDiscriminator')])

      for (const languageDiscriminatorNode of languageDiscriminatorNodes) {
        const [languageDiscriminator] = languageDiscriminatorNode.out([shFrm('languageDiscriminator')]).terms
        const parsedPath = parsePath(languageDiscriminatorNode.out([sh('path')]))

        const discriminatorSets = this.dataPointer.executeAll(parsedPath)
        for (const discriminatorSet of discriminatorSets) {
          const language = discriminatorSet.out([languageDiscriminator]).value
          if (language === languageCode) {
            removeRecursively(discriminatorSet)
          }
        }
      }


      this.contentLanguages = this.contentLanguages.filter((language: string) => language !== languageCode)
      this.activeContentLanguages = [this.contentLanguages[0]]

      this.render()
    }

    get shapeUri () {
      const givenShapeUri = this.attributes.getNamedItem('shape-uri')?.value
      if (!givenShapeUri) return this.shapeUris[0]

      const foundUri = this.shapeUris.find(term => term.value === givenShapeUri)
      if (foundUri) return foundUri

      throw new Error('Could not find the shape uri')
    }

    get contentLanguages () {
      return this.getAttribute('content-languages')?.split(',') ?? []
    }

    set contentLanguages (languages: Array<string>) {
      this.setAttribute('content-languages', languages.join(','))
    }
  
    get activeContentLanguages () {
      const activeContentLanguages = this.getAttribute('active-content-languages')?.split(',') ?? []
      if (activeContentLanguages.length === 0) return this.contentLanguages
      return activeContentLanguages
    }

    get activeContentLanguage () {
      return this.activeContentLanguages[0]
    }

    set activeContentLanguages (languages: Array<string>) {
      const previousActiveLanguage = this.activeContentLanguages[0]
      const dataset = this.dataPointer.ptrs[0].dataset
      // TODO add logic for language discriminator.
      for (const quad of dataset) {
        if (quad.object.language === previousActiveLanguage && quad.object.value === '')
          dataset.delete(quad)
      }

      if (languages.length === 0) languages = this.contentLanguages
      this.setAttribute('active-content-languages', languages.join(','))
      this.render()
    }

    get uiLanguagePriorities () {
      const priorities = this.getAttribute('ui-language-priorities')?.split(',') ?? ['*']
      if (priorities.at(-1) !== '*') priorities.push('*')
      return priorities
    }

    get store () {
      return this.#store
    }

  }

  customElements.define('shacl-form', ShaclForm)
}