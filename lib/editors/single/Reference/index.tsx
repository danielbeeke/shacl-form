import { ShaclFormSingleEditorReact } from '../../../core/ShaclFormSingleEditorReact'
import { sh, shFrm } from '../../../helpers/namespaces'
import { useLayoutEffect, useState } from 'react'
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint"
import { debounce } from 'lodash-es'
import { Icon } from '@iconify-icon/react';
import '../../../helpers/nextTick'

const fetcher = async (endpoint: string, sparql: string, callback: (binding: any) => void) => {
  (new SparqlEndpointFetcher()).fetchBindings(endpoint, sparql)
  .then((bindingsStream) => bindingsStream.on('data', callback))
}

const debouncedFetcher = debounce(fetcher, 300)

export default class Reference extends ShaclFormSingleEditorReact<typeof Reference> {
  template () {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<Array<any>>([])
    const [value, setValue] = useState<any>(null)
    const sparql = this.shaclPointer.out([sh('select')]).value
    const endpoint = this.shaclPointer.out([shFrm('source')]).value

    useLayoutEffect(() => {
      if (value) return

      if (!this.value?.value) return

      // This enables instant loading of the selected item.
      if (sessionStorage.getItem(this.value.value)) {
        setValue(JSON.parse(sessionStorage.getItem(this.value.value)!))
        return 
      }

      // This is the fallback for existing values.
      const tokenizedSparql = sparql
        .split('\n')
        .map((line: string) => {
          if (!line.includes('?searchTerm')) return line
          return `VALUES ?uri { <${this.value.value}> }`
        })
        .join('\n')

      fetcher(endpoint, tokenizedSparql, (bindings) => {
        sessionStorage.setItem(bindings.uri.value, JSON.stringify(bindings))
        setValue(bindings)
      })
    }, [])

    useLayoutEffect(() => {
      if (searchTerm.length < 4) return
      
      const tokenizedSparql = sparql
        .replaceAll('?searchTerm', `"""${searchTerm.split(' ').map(word => `'${word}'`).join(' AND ')}"""`)

      setResults([])

      debouncedFetcher(endpoint, tokenizedSparql, (bindings) => {
        sessionStorage.setItem(bindings.uri.value, JSON.stringify(bindings))
        results.push(bindings)
        setResults([...results])
      })
    }, [searchTerm])

    const [hasError, setHasError] = useState<Array<string>>([])

    return <>
      {value ? <div className='p-0 form-control align-items-center d-flex' title={value.uri.value}>
        {value.image && !hasError.includes(value.image.value) 
            ? <img onError={() => setHasError([...hasError, value.image.value])} className='image' src={`//wsrv.nl/?url=${value.image.value}&w=35&h=35&fit=cover&a=attention`} /> 
            : <div className='image fallback' style={{ aspectRatio: 1, background: '#eee' }}></div>}
          <span className='p-1 ps-2'>{value.label.value}</span>
          <a className='ms-auto me-2' href={value.uri.value} target='_blank'><Icon icon="clarity:pop-out-line" /></a>
      </div> : <input type='search' placeholder='Search' className='form-control' value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />}

      {results.length ? <div className='list-group mt-3'>
        {results.map(result => {

          return <button onClick={() => {
            this.value = this.df.namedNode(result.uri.value)
          }} key={result.uri.value} className='p-0 list-group-item list-group-item-action d-flex'>
          {result.image && !hasError.includes(result.image.value) 
            ? <img onError={() => setHasError([...hasError, result.image.value])} className='image' src={`//wsrv.nl/?url=${result.image.value}&w=35&h=35&fit=cover&a=attention`} /> 
            : <div className='image fallback' style={{ aspectRatio: 1, background: '#eee' }}></div>}
          <span className='p-2'>{result.label.value}</span>
        </button>
        })}
      </div> : null}
    </>
  }

}