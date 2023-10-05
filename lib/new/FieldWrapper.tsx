import { sh, dash } from '../helpers/namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import { GrapoiPointer, ShaclFormType } from '../types'
import { Icon } from '@iconify-icon/react';

type FieldWrapperProps = { 
  children: any, 
  uiLanguagePriorities: Array<string>,
  shaclPointer: GrapoiPointer,
  dataPointer: GrapoiPointer,
  addCallback: any
  scores: any
}

export function FieldWrapper ({ 
  children, 
  shaclPointer, 
  uiLanguagePriorities, 
  addCallback
}: FieldWrapperProps
) {
  const name = bestLanguage(shaclPointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(shaclPointer.out([sh('description')]), uiLanguagePriorities)
  const showAdd = true

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