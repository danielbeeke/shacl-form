import { IShaclFormEditorConstructor, StaticImplements } from './ShaclFormEditor'
import { ShaclFormEditorSingle } from './ShaclFormEditorSingle'
import { createRoot, Root } from 'react-dom/client'
import { createElement } from 'react'

/**
 * Use <input defaultValue={this.value.value ?? ''} onBlur={} /> instead of <input value={this.value.value ?? ''} onChange={} />
 * Because React's onChange is not really an onChange event but an keyUp event.
 */
export abstract class ShaclFormEditorSingleReact<T extends IShaclFormEditorConstructor> 
extends ShaclFormEditorSingle<T> implements StaticImplements<IShaclFormEditorConstructor, T> {

  #root: Root | undefined
  #boundTemplate: any

  constructor () {
    super()
    this.#root = createRoot(this)
    this.#boundTemplate = this.template.bind(this)
  }

  render () {
    this.#root?.render(createElement(this.#boundTemplate))
  }

  template () {
    return (<h3>Please implement template()</h3>)
  }
}