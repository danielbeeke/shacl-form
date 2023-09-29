import { sh, dash } from '../helpers/namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import { GrapoiPointer, ShaclFormType, NamedNode, Term } from '../types'
import { Icon } from '@iconify-icon/react';
import { replaceList } from '../helpers/replaceList'
import parsePath from 'shacl-engine/lib/parsePath.js'

type FieldWrapperProps = { 
  children: any, 
  uiLanguagePriorities: Array<string>,
  shaclPointer: GrapoiPointer,
  dataPointer: GrapoiPointer,
  form: ShaclFormType,
  widgetMeta: any,
  widgetOptions: any,
}

export function FieldWrapper ({ 
  children, 
  shaclPointer, 
  uiLanguagePriorities, 
  form, 
  dataPointer, 
  widgetMeta, 
}: FieldWrapperProps
) {
  const name = bestLanguage(shaclPointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(shaclPointer.out([sh('description')]), uiLanguagePriorities)
  const showAdd = true

  // Add item callback.
  const addCallback = () => {
    const parentNode: GrapoiPointer = shaclPointer.in().out([sh('node')])
    const isOrderedList = !!parentNode.term?.equals(dash('ListShape'))
    
    if (isOrderedList) {
      const path = parsePath(shaclPointer.in().out([sh('path')]))
      const predicate = path[0].predicates[0]
      const newValues = [...dataPointer.in().out([predicate]).list()].map(part => part.term)
      newValues.push(widgetMeta.createNewObject(form, shaclPointer))
      replaceList(newValues, dataPointer.in().out([predicate]))
    }
    else {
      const path = parsePath(shaclPointer.out([sh('path')]))
      const predicate = path[0].predicates[0]
      dataPointer.addOut(predicate, widgetMeta.createNewObject(form, shaclPointer))
    }

    form.render()
  }

  return <div className={`field`} data-predicate="">
    {name ? (<label className='form-label'>
      {name}
    </label>) : null}

    {description ? (<p className='form-text' dangerouslySetInnerHTML={{__html: description}}></p>) : null}

    <div className="field-inner">

      {children ?<div className='items'>
        {children}
      </div> : null}

      {showAdd ? (
        <button type="button" onClick={addCallback} className='btn btn-secondary btn-sm btn-add-item me-auto mb-2'>
          <Icon icon="fa6-solid:plus" />
        </button>
      ) : null} 

    </div>
  </div>
}