import { sh, shFrm, rdf } from '../helpers/namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import { FieldItem } from '../components/field/FieldItem'
import { GrapoiPointer, Widget, NamedNode, Literal, Term } from '../types'
import { useRef } from 'react'
import { ReactSortable } from "react-sortablejs";
import { replaceList } from '../helpers/replaceList'
import factory from 'rdf-ext'
import { Icon } from '@iconify-icon/react';
import { useState, useLayoutEffect } from 'react'

type FieldWrapperProps = { 
  widgetClass: any, 
  children: any, 
  structure: Widget, 
  errors: any,
  isOrderedList: boolean,
  uiLanguagePriorities: Array<string>,
  dataPointer: () => GrapoiPointer,
  shaclPointer: GrapoiPointer,
  form: any
}

export function FieldWrapper ({ widgetClass, isOrderedList, children, shaclPointer, errors, uiLanguagePriorities, dataPointer, form }: FieldWrapperProps) {
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
      </div>

      {showAdd ? (
        <button type="button" className='btn btn-secondary btn-sm btn-add-item me-auto mb-2'>
          <Icon icon="fa6-solid:plus" />
        </button>
      ) : null} 

    </div>
  </div>
}