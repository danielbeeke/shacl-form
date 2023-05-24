import factory from 'rdf-ext'
import { ShaclFormWidgetSingleReact } from '../../core/ShaclFormWidgetSingleReact'
import { useRef } from 'react'
import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import { dash, shFrm } from '../../helpers/namespaces'
import { FilePondInitialFile } from 'filepond'
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

  template () {
    const filePond = useRef<FilePond>(null)

    const initialFiles: Array<FilePondInitialFile> = this.dataPointer().out([this.predicate]).values.map(value => ({ 
      source: value,
      options: { 
        type: 'local',
      }
    }))

    const uriStart = this.shaclPointer.out([dash('uriStart')]).value
    const prefix = uriStart.split(/\/|#/g).pop()

    const server = {
      url: `${FileUpload.options.backend}/${prefix}/`, 
      load: (source: string, load: Function, error: Function, progress: Function, abort: Function, headers: Function) => {
        fetch(source)
          .then(response => response.blob())
          .then(blob => {
            progress(false, blob.size, blob.size);
            load(blob)
          })
          .catch(() => error('Something went wrong fetching the file'))

        return { abort }
      },
      remove: async (source: string, load: Function, error: Function) => {
        this.dataPointer().deleteOut([this.predicate], [factory.namedNode(source)])

        fetch(source, { method: 'DELETE' })
       .catch(() => error())
       .finally(() => load())
      }
    }

    return (
      <>
      <span>{this.value?.value}</span>
      <FilePond
        ref={filePond}
        onprocessfile={(error, file) => {
          if (!error) {
            this.dataPointer().addOut([this.predicate], [factory.namedNode(uriStart + '/' + file.serverId)])
          }
        }}
        files={initialFiles}
        instantUpload={false}
        credits={false}
        // onupdatefiles={files => console.log(files[0])}
        allowMultiple={true}
        server={server}
        name="files"
        labelIdle='Drag & Drop your files or <span>Browse</span>'
      />
      </>
    )
  }

}

export default function createFileUpload (options: FileUploadOptions) {
  FileUpload.options = options
  return FileUpload
}