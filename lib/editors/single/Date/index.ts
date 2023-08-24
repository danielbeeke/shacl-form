import { ShaclFormSingleEditorUhtml } from '../../../core/ShaclFormSingleEditorUhtml'
import { xsd } from '../../../helpers/namespaces'
import { html } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.

export default class Date extends ShaclFormSingleEditorUhtml<typeof Date> {
  template () {
    return html`
      <input type="date" class="form-control" onChange=${(event: Event) => {
        this.value = this.df.literal((event.target as HTMLInputElement).value, xsd('date'))
      }} type="text" .value=${this.value?.value ?? ''} />
    `
  }

}