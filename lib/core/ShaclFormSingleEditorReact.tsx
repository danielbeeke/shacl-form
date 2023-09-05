import { IShaclFormEditorConstructor, StaticImplements } from './ShaclFormEditor'
import { ShaclFormSingleEditor } from './ShaclFormSingleEditor'
import { createRoot, Root } from 'react-dom/client'
import { createElement } from 'react'
import { InputProps } from '../types'

/**
 * Use <input defaultValue={this.value.value ?? ''} onBlur={} /> instead of <input value={this.value.value ?? ''} onChange={} />
 * Because React's onChange is not really an onChange event but an keyUp event.
 */
export abstract class ShaclFormSingleEditorReact<T extends IShaclFormEditorConstructor> 
extends ShaclFormSingleEditor<T> implements StaticImplements<IShaclFormEditorConstructor, T> {

  #root: Root | undefined
  #boundHeader: any
  #boundTemplate: any
  #boundFooter: any

  constructor () {
    super()
    this.#root = createRoot(this)
    this.#boundHeader = this.header.bind(this)
    this.#boundTemplate = this.template.bind(this)
    this.#boundFooter = this.footer.bind(this)
  }
  
  render () {
    if (this.isHeader) this.#root?.render(createElement(this.#boundHeader))
    else if (this.isFooter) this.#root?.render(createElement(this.#boundFooter))
    else this.#root?.render(createElement(this.#boundTemplate, this.getInputProps()))
  }

  header (): any {
    return null
  }

  template (_props: InputProps): any {
    return (<h3>Please implement template()</h3>)
  }

  footer (): any {
    return null
  }

}