import { Validator } from 'shacl-engine'
import { Parser, Store, DataFactory as df } from 'n3'
import rdfDataset from '@rdfjs/dataset'
import type { NamedNode } from 'n3'
import DatasetCore from '@rdfjs/dataset/DatasetCore'
import { sh, rdf } from './namespaces'
import { shaclReportToNested } from './helpers/shaclReportToNested'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { createElement } from 'react'
import { Form } from './components/Form'

/**
 * A customElement to render SHACL as a form.
 * 
 * @attribute subject - Useful when creating data. It will set the subject to this uri.
 * @attribute shacl-url - The place where the SHACL turtle is stored, it should allow CORS.
 * @attribute shape-uri - Set this attribute if you have multiple shapes in your shape turtle file and do not want to use the first shape.
 */
export class ShaclForm extends HTMLElement {

  #validator: typeof Validator
  #subject: NamedNode
  #store: Store = new Store()
  #shaclDataset: DatasetCore = rdfDataset.dataset()
  shapeUris: Array<NamedNode> = []
  #root: Root

  constructor () {
    super()
    this.#subject = df.namedNode(this.attributes.getNamedItem('subject')?.value ?? 'urn:default-shacl-form-subject')
    this.init()
    this.#root = createRoot(this)
  }

  async init () {
    const parser = new Parser()
    const shaclUrl = this.attributes.getNamedItem('shacl-url')?.value
    if (!shaclUrl) throw new Error('A shacl-url property is required. It should link to a SHACL turtle file')
    const shaclText = await fetch(shaclUrl).then(response => response.text())
    const shaclQuads = await parser.parse(shaclText)
    this.#shaclDataset = rdfDataset.dataset(shaclQuads)
    this.#validator = new Validator(this.#shaclDataset, { coverage: true, factory: df, details: true })

    const nodeShapeQuads = this.#shaclDataset.match(null, rdf('type'), sh('NodeShape'))
    for (const nodeShapeQuad of nodeShapeQuads) {
      this.shapeUris.push(nodeShapeQuad.subject as NamedNode)
    }
    
    // Set the fallback subject.
    this.#store.add(df.quad(this.subject, rdf('type'), this.shapeUri))

    const tree = await this.validate()
    console.log(tree)
    this.render(tree)
  }

  get subject () {
    return this.#subject
  }

  render (tree: any) {
    this.#root.render(createElement(Form, { tree }))
  }

  set subject (newValue: NamedNode) {
    const quadsToChange = this.#store.getQuads(this.subject, null, null, null)
    this.#store.removeQuads(quadsToChange)
    this.#subject = newValue
    this.#store.addQuads(quadsToChange.map((quad) => df.quad(this.subject, quad.predicate, quad.object, quad.graph)))
  }

  async validate () {
    const report = await this.#validator.validate({ dataset: this.#shaclDataset, terms: [this.subject] })
    return shaclReportToNested(report, this.#store)
  }

  get shapeUri () {
    const givenShapeUri = this.attributes.getNamedItem('shape-uri')?.value
    if (!givenShapeUri) return this.shapeUris[0]

    const foundUri = this.shapeUris.find(term => term.value === givenShapeUri)
    if (foundUri) return foundUri

    throw new Error('Could not find the shape uri')
  }
}

customElements.define('shacl-form', ShaclForm)