import { ShaclFormWidgetSingle } from '../../core/ShaclFormWidgetSingle'
import { GrapoiPointer, Options } from '../../types'
import factory from 'rdf-ext'
import { html, render } from 'uhtml' // You could use React, Vue, Angular, basically anything and export it to a customElement.

import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import AwsS3Multipart from '@uppy/aws-s3-multipart';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

type FileUploadOptions = {
  companionUrl: string
}

export class FileUpload extends ShaclFormWidgetSingle<typeof FileUpload> {

  public uppy!: Uppy
  public uppyElement: HTMLDivElement

  public static options: FileUploadOptions

  constructor () {
    super()
    this.uppyElement = document.createElement('div')
  }

  static score() {
    return 200
  }

  static createNewObject (form: any) {
    return factory.namedNode('')
  }

  async connectedCallback () {
    this.uppy = new Uppy()
    .use(Dashboard, { target: this.uppyElement })
    .use(AwsS3Multipart, { companionUrl: FileUpload.options.companionUrl })

    this.render()
  }

  async beforeRemove () {
    console.log(this.value)
  }

  render () {
    render(this, html`
      ${this.value?.value ? html`<span>${this.value?.value}</span>` : html`
        ${this.uppyElement}
        <button onClick=${() => {
          ;(this.uppy.getPlugin('Dashboard')! as any).openModal()

          // this.uppy.once('complete', (status) => {
          //   const newObjects = status.successful.map((file: any) => factory.namedNode(`${FileUpload.options.managedDomain}/${file.s3Multipart.key}`))
          //   this.dataPointer().addOut([this.predicate], newObjects)
          //   this.renderAll()
          // })
        }}>Add files</button>
      `}
    `)
  }

}

export default function createFileUpload (options: FileUploadOptions) {
  FileUpload.options = options
  return FileUpload
}