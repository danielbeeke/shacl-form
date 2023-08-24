import { shFrm } from '../../../helpers/namespaces'
import factory from 'rdf-ext'

export const iri = shFrm('Color').value

export const createNewObject = () => {
  return factory.literal('')
}
