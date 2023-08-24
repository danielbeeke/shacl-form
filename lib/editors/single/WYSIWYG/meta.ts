import { shFrm } from '../../../helpers/namespaces'
import factory from 'rdf-ext'

export const iri = shFrm('EditorJS').value

export const createNewObject = () => {
  return factory.blankNode()
}