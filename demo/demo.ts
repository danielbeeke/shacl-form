import '../lib/index'

document.body.innerHTML = `
  <shacl-form 
    shacl-url="../shapes/name.shacl.ttl?raw" 
    data-url="../data/name.ttl?raw" 
    data-iri="http://example.com/name"
    ui-language-priorities="nl"
  ></shacl-form>
`