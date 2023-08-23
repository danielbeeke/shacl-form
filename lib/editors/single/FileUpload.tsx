import { ShaclFormSingleEditorReact } from '../../core/ShaclFormSingleEditorReact'
import { GrapoiPointer } from '../../types'
import { dash, sh, shFrm } from '../../helpers/namespaces'
import { scorer } from '../../core/Scorer'
import Dropzone from 'react-dropzone'
import factory from 'rdf-ext'
import { useState } from 'react'

type FileUploadOptions = {
  backend: string
}

export default class FileUpload extends ShaclFormSingleEditorReact<typeof FileUpload> {

  public widgetSettings: FileUploadOptions | undefined = undefined

  static hideAddButton = true
  public error: string = ''
  public isUploading = false

  static iri = shFrm('FileUpload').value

  static score(shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) {
    return scorer(shaclPointer, dataPointer)
      .has(dash('uriStart'))
      .toNumber()
  }

  template () {
    const [hasError, setHasError] = useState(false)

    return this.value.value ? (
      <a title={this.value.value} href={this.value.value} target='_blank'>{
        hasError ? this.value.value.split('/').pop() : 
        <img onError={() => {
          setHasError(true)
        }} className='file-upload-image' src={this.value.value} />  
      }</a>
    ) : null
  }

  header () {
    const maxCount = this.shaclPointer.out([sh('maxCount')]).value ?? Infinity
    const showUpload = maxCount >= this.values.length

    return (
      <div className='widget'>

        {this.error ? <div className="alert alert-danger mb-3" role="alert">
          {this.error}
        </div> : null}

        {this.isUploading ? 
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div> : 
        
          showUpload ? <Dropzone onDrop={(files) => this.addFiles(files)}>
            {({getRootProps, getInputProps}) => (
              <div className='drop-zone' {...getRootProps()}>
                <input {...getInputProps()} />
                <span className='lead'>Drag some files here or click to select files</span>
              </div>
            )}
          </Dropzone> : null
        }
      </div>
    )
  }

  async addFiles (files: Array<File>) {
    const uriStart = this.shaclPointer.out([dash('uriStart')]).value
    const prefix = uriStart.split(/\/|#/g).pop()
    
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('files', file)

        this.isUploading = true
        this.render()

        const response = await fetch(`${this.widgetSettings!.backend}/${prefix}/`, {
          body: formData,
          method: 'POST'
        })

        this.isUploading = false
  
        const filePath = await response.text()
        this.addValue(factory.namedNode(filePath))
      }  
    }
    catch (exception: any) {
      this.error = exception.message ?? exception
    }

    this.render()
  }

  async beforeRemove () {
    const response = await fetch(this.value.value, { method: 'DELETE' })
    const output = await response.json()
    return output.success === true
  }
}