import { init, defaultOptions } from '../lib/ShaclForm'
import '../lib/scss/style.scss'

// import { init, defaultOptions } from '../dist/ShaclForm'
// import '../dist/style.css'

import factory from 'rdf-ext'
import { schema } from '../lib/helpers/namespaces'
import './demo.scss'

init(defaultOptions)

const demos = [
  {
    title: 'Full with layout',
    shaclUrl: '../shapes/full.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/full.ttl?raw',
    contentLanguage: 'en,fr,de,nl',
    activeContentLanguage: 'en',
  },
  {
    title: 'Name (blank nodes with a SHACL property path)',
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
  {
    title: 'Incomplete labels, enhance by fetching ontology',
    shaclUrl: '../shapes/incomplete.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    // contentLanguage: 'en,fr,de',
    activeContentLanguage: 'en',
    enhance: true
  },
  {
    title: 'BackBlaze storage, needs ENV variables',
    shaclUrl: '../shapes/storage.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/storage.ttl?raw',
    // contentLanguage: 'en,fr,de',
    activeContentLanguage: 'en',
  },
  {
    title: 'Iconify',
    shaclUrl: '../shapes/iconify.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/iconify.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'Reference',
    shaclUrl: '../shapes/reference.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/reference.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'Ordered reference',
    shaclUrl: '../shapes/ordered-reference.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/ordered-reference.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'WYSIWYG',
    shaclUrl: '../shapes/wysiwyg.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/wysiwyg.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'Enum select',
    shaclUrl: '../shapes/enum.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/enum.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
]

const index = location.pathname.substring(1) ? parseInt(location.pathname.substring(1)) : null

if (index === null) {
  document.body.innerHTML = `

    <div class="demo-list">
      <h3>Please pick an example</h3>

      <ul>
        ${demos.map((demo, index) => `
        <li>
          <a href="${index}">${demo.title}</a>
        </li>
        `).join('')}
      </ul>
    </div>
  `
}
else {
  const demo = demos[index]

  const formId = demo.shaclUrl.split('/').pop()?.split('.')[0]

  document.body.innerHTML = `
    <shacl-form 
      id=${`demo-${formId}`}
      class="p-5"
      shacl-url="${demo.shaclUrl ?? ''}" 
      shacl-iri="${demo.shaclIri ?? ''}" 
      data-url="${demo.dataUrl ?? ''}" 
      data-iri="${demo.dataIri ?? ''}"
      ${demo.contentLanguage ? `content-languages="${demo.contentLanguage}"` : ''}
      ${demo.activeContentLanguage ? `active-content-languages="${demo.activeContentLanguage}"` : ''}
      ui-language-priorities="${demo.uiLanguagePriorities ?? ''}"
      ${demo.enhance ? `enhance` : ''}
    ></shacl-form>
  `

  const form = document.querySelector('shacl-form')! as any

  form.addEventListener('save', (event) => {
    console.log(event.detail.turtle)
  })

  /**
   * Demonstration of data intregration on API call.
   */
  if (demo.title.includes('ISBN')) {
  
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
