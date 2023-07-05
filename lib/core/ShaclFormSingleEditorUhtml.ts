import { IShaclFormEditorConstructor, StaticImplements } from './ShaclFormEditor'
import { ShaclFormSingleEditor } from './ShaclFormSingleEditor'
import { render } from 'uhtml'

export abstract class ShaclFormSingleEditorUhtml<T extends IShaclFormEditorConstructor> 
extends ShaclFormSingleEditor<T> implements StaticImplements<IShaclFormEditorConstructor, T> {

  render () {
    if (this.isHeader) render(this, this.header())
    else if (this.isFooter) render(this, this.footer())
    else render(this, this.template())
  }

}