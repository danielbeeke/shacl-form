import type { Quad } from 'n3'
import { ShaclFormField } from '../ShaclFormField'
import { xsd, sh } from '../namespaces'

export default class String extends ShaclFormField<typeof String> {

  static elementName = 'field-string'

  static applies(pointer: any): boolean {
    const datatypes = [...pointer.in([sh('datatype')]).quads()]
      .map((quad: Quad) => quad.object.value)

    return datatypes.includes(xsd('string').value)
  }

  async connectedCallback () {
    const inLanguageList = this.pointer.out([sh('languageIn')]).list()
    const languages = [...inLanguageList ?? []].map((pointer: any) => pointer.term.value)
    
    console.log(languages)

    this.innerHTML = `<input type="text" />`
  }


}