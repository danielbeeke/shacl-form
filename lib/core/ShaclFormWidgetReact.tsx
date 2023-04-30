import { ShaclFormWidget, IShaclFormWidgetConstructor, StaticImplements } from './ShaclFormWidget';
import { createRoot, Root } from 'react-dom/client'
import { createElement } from 'react';

export abstract class ShaclFormWidgetReact<T extends IShaclFormWidgetConstructor> 
extends ShaclFormWidget<T> implements StaticImplements<IShaclFormWidgetConstructor, T> {

  #root: Root | undefined
  #boundTemplate: any

  constructor () {
    super()
    this.#root = createRoot(this)
    this.#boundTemplate = this.template.bind(this)
  }

  async connectedCallback () {
    this.render()
  }

  render () {
    this.#root?.render(createElement(this.#boundTemplate))
  }

  template () {
    return (<h3>Please implement template()</h3>)
  }
}