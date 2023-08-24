import { IShaclFormEditorConstructor, StaticImplements } from './ShaclFormEditor'
import { ShaclFormMultiEditor } from './ShaclFormMultiEditor'
import { render } from 'uhtml'

export abstract class ShaclFormMultiEditorUhtml<T extends IShaclFormEditorConstructor> 
extends ShaclFormMultiEditor<T> implements StaticImplements<IShaclFormEditorConstructor, T> {

  async render () {
    if (this.isHeader) render(this, await this.header())
    else if (this.isFooter) render(this, await this.footer())
    else render(this, await this.template())
  }

}