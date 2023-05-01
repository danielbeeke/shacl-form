import { ShaclFormWidgetSingle, IShaclFormWidgetConstructor, StaticImplements } from './ShaclFormWidgetSingle';
import { createRoot, Root } from 'react-dom/client'
import { createElement } from 'react';

/**
 * Use <input defaultValue={this.value.value ?? ''} onBlur={} /> instead of <input value={this.value.value ?? ''} onChange={} />
 * Because React's onChange is not really an onChange event but an keyUp event.
 */
export abstract class ShaclFormWidgetSingleReact<T extends IShaclFormWidgetConstructor> 
extends ShaclFormWidgetSingle<T> implements StaticImplements<IShaclFormWidgetConstructor, T> {

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