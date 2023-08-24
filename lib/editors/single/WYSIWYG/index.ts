import { ShaclFormSingleEditorUhtml } from '../../../core/ShaclFormSingleEditorUhtml'
import { dash } from '../../../helpers/namespaces'
import EditorJS from '@editorjs/editorjs'
import jsonld from 'jsonld';
import { BlankNode, Parser } from 'n3';

import List from '@editorjs/list'
import LinkTool from '@editorjs/link'
import Marker from '@editorjs/marker'
import Header from '@editorjs/header'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
import Image from '@editorjs/image'
import DragDrop from 'editorjs-drag-drop';

import { NamedNode, Quad } from '../../../types'
import { nest } from '../../../helpers/jsonLdNester'
import QuadExt from 'rdf-ext/lib/Quad'

const editors = new Map()

type WYSIWYGOptions = {
  backend: string
}

class AdvancedImage extends Image {
  removed () {
    fetch(this._data.file.url, { method: 'DELETE' })
  }
}

export default class WYSIWYG extends ShaclFormSingleEditorUhtml<typeof WYSIWYG> {

  public widgetSettings: WYSIWYGOptions | undefined = undefined

  async beforeRemove (): Promise<boolean> {
    const cid = JSON.stringify([this.path, this.index])
    const editorElement = editors.get(cid)

    const data: any = await editorElement.editorJS.saver.save()

    const imageBlocks = data.blocks.filter((block: any) => block.type === 'image')

    for (const imageBlock of imageBlocks) {
      await fetch(imageBlock.data.file.url, { method: 'DELETE' })
    }

    editors.delete(cid)

    return true
  }

  async template () {
    let initialData = undefined
    const cid = JSON.stringify([this.path, this.index])
    if (editors.has(cid)) return editors.get(cid)

    const holder: HTMLDivElement & { editorJS?: any } = document.createElement('div')
    editors.set(cid, holder)

    const parser = new Parser()

    if (this.value.value) {
      let pointer = this.dataPointer().node([this.value])
          
      if (pointer.out().terms.length) {
        const quads = []
        while (pointer.ptrs.length) {
          quads.push(...pointer.quads())
          pointer = pointer.out()
        }
  
        const dataset = this.df.dataset(quads)
        const document = await jsonld.fromRDF(dataset, { useNativeTypes: true })
        const compacted = await jsonld.compact(document, { '@vocab': 'https://editorjs.io/' })
        const [nested] = nest(compacted)
        initialData = nested  
      }
    }

    const uriStart = this.shaclPointer.out([dash('uriStart')]).value
    const prefix = uriStart?.split(/\/|#/g).pop()
       
    const tools: any = {
      header: {
        class: Header,
        inlineToolbar: ['marker', 'link'],
        config: {
          placeholder: 'Header'
        },
        shortcut: 'CMD+SHIFT+H'
      },
      list: {
        class: List,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+L'
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: 'Quote\'s author',
        },
        shortcut: 'CMD+SHIFT+O'
      },
      marker: {
        class:  Marker,
        shortcut: 'CMD+SHIFT+M'
      },
      delimiter: Delimiter,
      linkTool: LinkTool,
    }

    if (uriStart) {
      tools['image'] = {
        class: AdvancedImage,
        inlineToolbar: true,
        config: {
          uploader: {
            uploadByFile: async (file: File) => {
              const formData = new FormData()
              formData.append('files', file)
      
              const response = await fetch(`${this.widgetSettings!.backend}/${prefix}/`, {
                body: formData,
                method: 'POST'
              })
      
              const filePath = await response.text()

              return {
                "success" : true,
                "file": { "url" : filePath }
              }
            }
          }  
        }
      }
    }

    holder.editorJS = new EditorJS({
      inlineToolbar: true,
      holder,
      data: initialData,
      tools,
      onReady: () => {
        new DragDrop(holder.editorJS, 'none')
      },
      onChange: async (api, _event: any) => {
        const data: any = await api.saver.save()
        data['@context'] = { '@vocab': 'https://editorjs.io/' }
        const nquads = await jsonld.toRDF(data, {format: 'application/n-quads'}) as unknown as string
        const quads = await parser.parse(nquads) as Array<Quad>

        if (this.value?.value) {
          let pointer = this.dataPointer().node([this.value])
          
          const quadsToRemove = this.df.dataset()
          while (pointer.ptrs.length) {
            for (const quad of pointer.quads()) quadsToRemove.add(quad as QuadExt)
            pointer = pointer.out()
          }

          for (const quad of quadsToRemove) {
            this.rdfDataset.delete(quad)
          }
        }
        else {
          this.value = quads[0].subject
        }

        for (const quad of quads) {
          const transformedQuad = this.df.quad(
            quad.subject.equals(quads[0].subject) ? this.value as NamedNode | BlankNode : quad.subject, 
            quad.predicate, 
            quad.object
          )
          
          this.rdfDataset.add(transformedQuad)
        }
      }
    })

    return holder
  }

}
