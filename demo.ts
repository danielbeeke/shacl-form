import { init } from './lib/ShaclForm'
import String from './lib/widgets/String'
import BlankNodeOrIri from './lib/widgets/BlankNodeOrIri'

init({
  widgets: {
    String,
    BlankNodeOrIri
  }
})

document.body.innerHTML = `
  <shacl-form 
    shacl-url="../shapes/name.shacl.ttl?raw" 
    data-url="../data/name.ttl?raw" 
    data-iri="http://example.com/name"
    ui-language-priorities="nl"
  ></shacl-form>
`