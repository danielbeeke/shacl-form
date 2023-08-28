import { sh, dash, shFrm } from '../../../helpers/namespaces'
import { GrapoiPointer, NamedNode } from '../../../types'
import { scorer } from '../../../core/Scorer'
import factory from 'rdf-ext'

export const iri = dash('BlankNodeEditor').value

export const score = (shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer) => {
  return scorer(shaclPointer, dataPointer)
    .node()
    .nodeKind([sh('IRI'), sh('BlankNode'), sh('BlankNodeOrIRI')], 3, false)
    .toNumber()
}

export const createNewObject = (form: any, shaclPointer: GrapoiPointer) => {
  const languageDiscriminator = shaclPointer.out([shFrm('languageDiscriminator')]).term
  const node = factory.blankNode()

  if (languageDiscriminator) {
    const language = factory.literal(form.activeContentLanguage)
    form.store.add(factory.quad(node, languageDiscriminator as NamedNode, language))
  }

  return node
}
