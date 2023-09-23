import DatasetCore from '@rdfjs/dataset/DatasetCore'
import grapoi from 'grapoi'
import { rdf, sh, rdfs, dash } from '../helpers/namespaces'
import factory from 'rdf-ext'
import type { GrapoiPointer, NamedNode, Quad, ShaclFormType } from '../types'
import { QueryEngine } from '@comunica/query-sparql';
import parsePath from 'shacl-engine/lib/parsePath.js'

export default class WidgetEnhancer {

  async execute (dataset: DatasetCore, form: ShaclFormType) {
    const shacl = grapoi({ dataset, factory }) as GrapoiPointer
    const shaclShapes = shacl.hasOut([rdf('type')], [sh('NodeShape')]).trim()
    const shaclProperties = shaclShapes.hasOut([sh('property')]).distinct()

    const promises: Array<Promise<void>> = []
    
    for (const shaclProperty of shaclProperties.out([sh('property')])) {
      // const editor = shaclProperty.out([dash('editor')]).term
      // if (!editor) {
      //   const scores = Object.values(form.options.widgets.single).map((singleEditor) => singleEditor.score(shaclProperty, ))
      // }
      // console.log(editor)
    }

    await Promise.all(promises)
  }

}