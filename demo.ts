import { init } from './lib/ShaclForm'
import String from './lib/widgets/String'

init({
  widgets: {
    String,
  }
})

document.body.innerHTML = `
  <shacl-form 
    shacl-url="../shapes/name.shacl.ttl?raw" 
    data-url="../data/name.ttl?raw" 
    language-priorities="nl"
  ></shacl-form>
`