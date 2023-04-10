import { ShaclFormField } from '../ShaclFormField'

export default class BlankNode extends ShaclFormField<typeof BlankNode> {

  static elementName = 'field-blank-node'

  static applies(): boolean {
    return true
  }

  async connectedCallback () {
    this.render()
  }

  render () {
    // TODO make it possible to give the blankNode a name so that we are able to not use blankNodes.
  }

}