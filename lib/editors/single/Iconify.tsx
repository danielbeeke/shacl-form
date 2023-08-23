import { ShaclFormSingleEditorReact } from '../../core/ShaclFormSingleEditorReact'
import { shFrm } from '../../helpers/namespaces'
import { useEffect, useState } from 'react'
import { Icon } from '@iconify-icon/react';

const iconStyle = { fontSize: 34 }

export default class Iconify extends ShaclFormSingleEditorReact<typeof Iconify> {

  static iri = shFrm('Iconify').value

  template () {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<Array<string> | null>(null)
    const collections = this.shaclPointer.out([shFrm('iconCollections')]).values

    useEffect(() => {
      if (!searchTerm) return
      fetch(`https://api.iconify.design/search?query=${searchTerm}&limit=96`)
      .then(response => response.json())
      .then(response => {
        const filteredIcons = response.icons
          .filter((icon: string) => collections.length ? collections.some(collection => icon.includes(collection)) : true)

        setResults(filteredIcons)
      })
    }, [searchTerm])

    return <div>
      <div className='d-flex'>
        {this.value?.value ? <Icon className="me-2" style={iconStyle} icon={this.value.value} /> : null}
        <input type="text" className="form-control" onChange={(event) => setSearchTerm(event.target.value)} defaultValue={this.value?.value ?? ''} />
      </div>
 
      {results ? <div className='d-flex mt-3 gap-2 flex-wrap iconify-search-results'>
        {results.map(icon => 
        <button 
          title={icon} 
          onClick={() => this.value = this.df.literal(icon)} 
          className='btn btn-light' 
          key={icon}
        >
          <Icon style={iconStyle} icon={icon} />
        </button>)}
      </div> : null}
    </div>
  }

}