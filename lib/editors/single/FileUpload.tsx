import { ShaclFormSingleEditorReact } from '../../core/ShaclFormSingleEditorReact'
import { GrapoiPointer } from '../../types'
import { dash } from '../../helpers/namespaces'
import { scorer } from '../../core/Scorer'
import Dropzone from 'react-dropzone'
import factory from 'rdf-ext'

type FileUploadOptions = {
  backend: string
}

export class FileUpload extends ShaclFormSingleEditorReact<typeof FileUpload> {

  public static options: FileUploadOptions

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .has(dash('uriStart'))
      .toNumber()
  }

  template () {
    return this.value.value ? (
      <img className='file-upload-image' src={this.value.value} />
    ) : null
  }

  header () {
    return (
      <>
        <Dropzone onDrop={(files) => this.addFiles(files)}>
          {({getRootProps, getInputProps}) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag some files here or click to select files</p>
            </div>
          )}
        </Dropzone>
      </>
    )
  }

  async addFiles (files: Array<File>) {
    const uriStart = this.shaclPointer.out([dash('uriStart')]).value
    const prefix = uriStart.split(/\/|#/g).pop()
    
    for (const file of files) {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch(`${FileUpload.options.backend}/${prefix}/`, {
        body: formData,
        method: 'POST'
      })

      const filePath = await response.text()
      this.addValue(factory.namedNode(filePath))
    }

    this.render()
  }

  async beforeRemove () {
    const response = await fetch(this.value.value, { method: 'DELETE' })
    const output = await response.json()
    return output.success === true
  }
}

export default function createFileUpload (options: FileUploadOptions) {
  FileUpload.options = options
  return FileUpload
}