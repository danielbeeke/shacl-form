import { sh } from '../helpers/namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import { GrapoiPointer, ShaclFormType } from '../types'
import { Icon } from '@iconify-icon/react';

type FieldWrapperProps = { 
  children: any, 
  uiLanguagePriorities: Array<string>,
  shaclPointer: GrapoiPointer,
  form: ShaclFormType
}

export function FieldWrapper ({ children, shaclPointer, uiLanguagePriorities }: FieldWrapperProps) {
  const name = bestLanguage(shaclPointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(shaclPointer.out([sh('description')]), uiLanguagePriorities)

  const showAdd = true

  return <div className={`field`} data-predicate="">
    {name ? (<label className='form-label'>
      {name}
    </label>) : null}

    {description ? (<p className='form-text' dangerouslySetInnerHTML={{__html: description}}></p>) : null}

    <div className="field-inner">

      <div className='items'>
        {children}
      </div>

      {showAdd ? (
        <button type="button" className='btn btn-secondary btn-sm btn-add-item me-auto mb-2'>
          <Icon icon="fa6-solid:plus" />
        </button>
      ) : null} 

    </div>
  </div>
}