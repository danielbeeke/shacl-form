import './lib/ShaclForm'

document.body.innerHTML = `
  <shacl-form 
    shacl-url="../shapes/name.shacl.ttl?raw" 
    data-url="../data/name.ttl?raw" 
    language-priorities="nl"
  ></shacl-form>
`