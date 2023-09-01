import { init, defaultOptions } from '../lib/ShaclForm'
import '../lib/scss/style.scss'

// import { init, defaultOptions } from '../dist/ShaclForm'
// import '../dist/style.css'

import factory from 'rdf-ext'
import { schema } from '../lib/helpers/namespaces'
import './demo.scss'
import ReadMe from '../README.md?raw'
import { marked } from 'marked'

init(defaultOptions)

const demos = [
  {
    title: 'Full demo',
    description: 'This demo tries to have all features',
    shaclUrl: '../shapes/full.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/full.ttl?raw',
    contentLanguage: 'en,fr,de,nl',
    activeContentLanguage: 'en',
  },
  {
    title: 'People cards',
    description: 'Blank nodes with a SHACL property path',
    shaclUrl: '../shapes/name.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataUrl: '../data/name.ttl?raw',
    dataIri: 'http://example.com/name',
    uiLanguagePriorities: 'nl',
    contentLanguage: 'en'
  },
  {
    title: 'Address',
    description: 'Autocompletion with a Geocoder',
    shaclUrl: '../shapes/address.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataUrl: '../data/address.ttl?raw',
    dataIri: 'http://example.com/name',
    uiLanguagePriorities: 'nl',
    contentLanguage: 'en'
  },
  {
    title: 'ISBN',
    description: 'API integration with openlibrary.org',
    shaclUrl: '../shapes/isbn.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    contentLanguage: 'en'
  },
  {
    title: 'Multilingual Product Name',
    description: 'Shows language tabs at the top',
    shaclUrl: '../shapes/multilingual.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataUrl: '../data/multilingual.ttl?raw',
    dataIri: 'http://example.com/name',
    contentLanguage: 'en,fr,de,nl,zh,es,az,ak,ab,nso,pau,ja,tk,ahr',
    activeContentLanguage: 'en'
  },
  {
    title: 'Missing labels',
    description: 'When labels are missing and you have opted in the ontology is asked for labels',
    shaclUrl: '../shapes/incomplete.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    // contentLanguage: 'en,fr,de',
    activeContentLanguage: 'en',
    enhance: true
  },
  {
    title: 'File upload',
    description: 'Drag and drop file uploading',
    shaclUrl: '../shapes/storage.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/storage.ttl?raw',
    // contentLanguage: 'en,fr,de',
    activeContentLanguage: 'en',
  },
  {
    title: 'Icon',
    description: 'Search for icons with iconify.design',
    shaclUrl: '../shapes/iconify.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/iconify.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'Reference',
    description: 'This widget uses the SPARQL endpoint of dbpedia.org',
    shaclUrl: '../shapes/reference.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/reference.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'Ordered reference',
    description: 'You can also save the data as an ordered list',
    shaclUrl: '../shapes/ordered-reference.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/ordered-reference.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'WYSIWYG',
    description: 'Uses Editor.js',
    shaclUrl: '../shapes/wysiwyg.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/wysiwyg.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'Enum select',
    description: 'A simple dropdown',
    shaclUrl: '../shapes/enum.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/enum.ttl?raw',
    contentLanguage: 'en',
    activeContentLanguage: 'en',
  },
  {
    title: 'Language discriminator',
    description: 'It is possible to show and hide fields that are not a language string',
    shaclUrl: '../shapes/multilingual-discriminator.shacl.ttl?raw',
    shaclIri: 'http://example.com/RootShape',
    dataIri: 'http://example.com/name',
    dataUrl: '../data/multilingual-discriminator.ttl?raw',
    contentLanguage: 'en,nl',
    activeContentLanguage: 'en',
  }
]

const index = location.pathname.substring(1) ? parseInt(location.pathname.substring(1)) : null

if (index === null) {
  document.body.innerHTML = `

    <div class="demo-list">
      <div class="pt-5 pb-4">
      ${marked.parse(ReadMe.split('## Progress')[0])}
      </div>
      <div class="list-group">
        ${demos.map((demo, index) => `
        <a class="list-group-item" href="${index}">
          <strong>${demo.title}</strong><br>
          <span>${demo.description}</span>
        </a>
        `).join('')}
      </div>
    </div>
  `
}
else {
  const demo = demos[index]

  const formId = demo.shaclUrl.split('/').pop()?.split('.')[0]
    document.body.innerHTML = `

      <div class="back-link">
        <a href="/">< Back to demo list</a>
        <h1>${demo.title}</h1>
        <span>${demo.description}</span>
      </div>

      <shacl-form 
        id=${`demo-${formId}`}
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

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "/",
      });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

// …

registerServiceWorker();
