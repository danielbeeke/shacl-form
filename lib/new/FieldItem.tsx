import { useLayoutEffect, useState } from 'react'
import { ShaclFormSingleEditor } from '../core/ShaclFormSingleEditor'
import { GrapoiPointer, ShaclFormType, Term } from '../types'
import { Icon } from '@iconify-icon/react';
import { sh, dash } from '../helpers/namespaces';
import { removeRecursively } from '../helpers/removeRecursively'
import { replaceList } from '../helpers/replaceList';

type FieldItemProps = {
  shaclPointer: GrapoiPointer
  widgetMeta: any,
  widgetOptions: any,
  form: ShaclFormType,
  term: Term,
  errors: Array<any>
  dataPointer: GrapoiPointer
  parentDataPointer: GrapoiPointer,
  uiLanguagePriorities: Array<string>,
  isHeader?: boolean,
  isFooter?: boolean,
  isList?: boolean,
  setValue: (term: Term) => void,
  children?: any,
  scores: any
}

export function FieldItem ({ 
  widgetMeta, 
  form, 
  children, 
  errors, 
  widgetOptions, 
  parentDataPointer, 
  term, 
  shaclPointer, 
  dataPointer, 
  uiLanguagePriorities, 
  setValue,
  isList = false, 
  isHeader = false, 
  isFooter = false 
}: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormSingleEditor<any>>()
  const [widgetClass, setWidgetClass] = useState<any>(undefined)
  const [showErrors, setShowErrors] = useState(false)

  useLayoutEffect(() => {
    widgetMeta.resolve().then((widgetModule: any) => setWidgetClass(() => widgetModule))
  }, [])

  useLayoutEffect(() => {
    if (!widgetInstance && widgetClass) {
      const widgetHtmlName = 'sf-' + widgetClass?.name.toLowerCase().replaceAll('$', '-')
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, widgetClass)

      const element = document.createElement(widgetHtmlName) as ShaclFormSingleEditor<any>
      element.term = term
      element.widgetSettings = widgetOptions
      element.shaclPointer = shaclPointer
      element.dataPointer = dataPointer
      element.isHeader = isHeader
      element.setValue = setValue
      element.isFooter = isFooter
      element.uiLanguagePriorities = uiLanguagePriorities

      setWidgetInstance(element)  
    }

    return () => {
      widgetInstance?.remove()
    }
  }, [widgetClass])

  let showRemove = true

  const errorMessages = errors.flatMap(error => error.message.map((message: Term) => message.value))

  const removeCallback = () => {
    const parentNode: GrapoiPointer = shaclPointer.in().out([sh('node')])
    const isOrderedList = !!parentNode.term?.equals(dash('ListShape'))
     
    if (isOrderedList) {
      const newValues = [...parentDataPointer.list()]
        .filter(pointer => !pointer.term.equals(dataPointer.term))
        .map(pointer => pointer.term)

      replaceList(newValues, parentDataPointer)
    }
    else {
      removeRecursively(dataPointer)
    }
  
    form.render()
  }

  return isHeader || isFooter ? 
    <div className={isHeader ? 'header' : (isFooter ? 'footer' : 'widget')} ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div> : 
  (
    <div className={`item ${errorMessages.length ? 'has-errors' : ''} type-${widgetClass?.name} ${isList ? 'is-list' : ''}`}>

      {errorMessages.length && showErrors ? <div key={errorMessages.join(',')} style={{ flex: '1 1 100%' }} className="alert mb-0 m-2 py-1 alert-danger" role="alert">
        <ul className='p-2'>
          {errorMessages.map(errorMessage => <li key={errorMessage}>{errorMessage}</li>)}
        </ul>
      </div>
       : null}

      {isList ? <div className='ps-1 d-flex my-handle' style={{cursor: 'grab'}}>
        <Icon style={{ fontSize: 24, margin: 'auto' }} icon="mdi:drag" />
      </div> : null}
      <div className={isHeader ? 'header' : (isFooter ? 'footer' : 'widget')} ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {children?.length ? <div className='children'>{children}</div>: null}

      {errorMessages.length ? <button type="button" onClick={() => setShowErrors(!showErrors)} className={`btn btn-toggle-errors ${showErrors ? 'btn-danger' : ''}`}>
          <Icon icon="ic:round-error" />
        </button> : null}

      {showRemove ? (
        // TODO this icon will flash because it is in the FieldItem.
        <button type="button" onClick={removeCallback} className='btn btn-remove-item'>
          <Icon icon="octicon:trash-16" />
        </button>
      ) : null}
    </div>
  )
}