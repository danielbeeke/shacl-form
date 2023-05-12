import factory from 'rdf-ext'
import { ShaclFormWidgetSingleReact } from '../../core/ShaclFormWidgetSingleReact'
import { useState } from 'react'
import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import { FilePondFile } from 'filepond'
import { dash } from '../../helpers/namespaces'
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

type FileUploadOptions = {
  backend: string
}

export class FileUpload extends ShaclFormWidgetSingleReact<typeof FileUpload> {

  public static options: FileUploadOptions

  static score() {
    return 200
  }

  static createNewObject (form: any) {
    return factory.namedNode('')
  }

  async connectedCallback () {
    this.render()
  }

  async beforeRemove () {

  }

  template () {
    const [files, setFiles] = useState<Array<FilePondFile>>([])
    const uriStart = this.shaclPointer.out([dash('uriStart')]).value
    const server = `${FileUpload.options.backend}/${uriStart}/`

    return (
      <FilePond
        files={files}
        credits={false}
        onupdatefiles={(files) => setFiles(files)}
        allowMultiple={true}
        server={server}
        name="files"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      />
    )
  }

}

export default function createFileUpload (options: FileUploadOptions) {
  FileUpload.options = options
  return FileUpload
}