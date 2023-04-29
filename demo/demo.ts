import '../lib/index'

const demos = [
  {
    shaclUrl: '../shapes/name.shacl.ttl?raw',
    dataUrl: '../data/name.ttl?raw',
    dataIri: 'http://example.com/name',
    uiLanguagePriorities: 'nl'
  },
  {
    shaclUrl: '../shapes/sidebar.shacl.ttl?raw',
    dataUrl: '../data/name.ttl?raw',
    dataIri: 'http://example.com/name',
    uiLanguagePriorities: 'nl'
  },
]

const index = location.pathname.substring(1) ? parseInt(location.pathname.substring(1)) : 0
const demo = demos[index]

document.body.innerHTML = `
  <shacl-form 
    shacl-url="${demo.shaclUrl}" 
    data-url="${demo.dataUrl}" 
    data-iri="${demo.dataIri}"
    ui-language-priorities="${demo.uiLanguagePriorities}"
  ></shacl-form>
`