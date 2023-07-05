import { IShaclFormEditorConstructor, StaticImplements } from './ShaclFormEditor'
import { ShaclFormMultiEditor } from './ShaclFormMultiEditor'
import { render } from 'uhtml'

export abstract class ShaclFormMultiEditorUhtml<T extends IShaclFormEditorConstructor> 
extends ShaclFormMultiEditor<T> implements StaticImplements<IShaclFormEditorConstructor, T> {

  render () {
    if (this.isHeader) render(this, this.header())
    else if (this.isFooter) render(this, this.footer())
    else render(this, this.template())
  }

}