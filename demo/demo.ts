import '../lib/index'
import factory from 'rdf-ext'
import { schema } from '../lib/helpers/namespaces'

const demos = [
  {
    title: 'Name',
    shaclUrl: '../shapes/name.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataUrl: '../data/name.ttl?raw',
    dataIri: 'http://example.com/name',
    uiLanguagePriorities: 'nl',
    contentLanguage: 'en'
  },
  {
    title: 'Address',
    shaclUrl: '../shapes/address.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataUrl: '../data/address.ttl?raw',
    dataIri: 'http://example.com/name',
    uiLanguagePriorities: 'nl',
    contentLanguage: 'en'
  },
  {
    title: 'ISBN API intregration',
    shaclUrl: '../shapes/isbn.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    contentLanguage: 'en'
  },
  {
    title: 'Multilingual Product Name',
    shaclUrl: '../shapes/multilingual.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataUrl: '../data/multilingual.ttl?raw',
    dataIri: 'http://example.com/name',
    // contentLanguage: 'en,fr,de',
    activeContentLanguage: 'en'
  },
]

const index = location.pathname.substring(1) ? parseInt(location.pathname.substring(1)) : null

if (index === null) {
  document.body.innerHTML = `

    <h3>Please pick an example</h3>

    <ul>
      ${demos.map((demo, index) => `
      <li>
        <a href="${index}">${demo.title}</a>
      </li>
      `).join('')}
    </ul>
  `
}
else {
  const demo = demos[index]

  document.body.innerHTML = `
    <shacl-form 
      shacl-url="${demo.shaclUrl ?? ''}" 
      shacl-iri="${demo.shaclIri ?? ''}" 
      data-url="${demo.dataUrl ?? ''}" 
      data-iri="${demo.dataIri ?? ''}"
      ${demo.contentLanguage ? `content-languages="${demo.contentLanguage}"` : ''}
      ${demo.activeContentLanguage ? `active-content-languages="${demo.activeContentLanguage}"` : ''}
      ui-language-priorities="${demo.uiLanguagePriorities ?? ''}"
    ></shacl-form>
  `

  /**
   * Demonstration of data intregration on API call.
   */
  if (demo.title.includes('ISBN')) {
    const form = document.querySelector('shacl-form')! as any
  
    form.addEventListener('value.set', (event: any) => {
      if (!event.detail.predicate.equals(schema('isbn'))) return
    
      const isbn = event.detail.object.value
      if (!isbn) return
    
      fetch(`https://openlibrary.org/isbn/${isbn}.json`)
        .then(response => response.json())
        .then((bookData) => {
          const confirmed = confirm(`We found the following title: ${bookData.full_title} do you want to apply this?`)
          if (!confirmed) return 
    
          event.detail.dataPointer
            .deleteOut(schema('name'), factory.literal(''))
            .addOut(schema('name'), factory.literal(bookData.full_title))
    
          form.render()
        })
    })
  }

}
