import { useLayoutEffect, useState } from 'react'
import { ShaclFormSingleEditor } from '../core/ShaclFormSingleEditor'
import { GrapoiPointer, ShaclFormType, Term } from '../types'
import { Icon } from '@iconify-icon/react';

type FieldItemProps = {
  shaclPointer: GrapoiPointer
  widgetMeta: any,
  widgetOptions: any,
  form: ShaclFormType,
  term: Term,
  errors: Array<any>
  dataPointer: GrapoiPointer
  uiLanguagePriorities: Array<string>,
  isHeader?: boolean,
  isFooter?: boolean,
  isList?: boolean,
  children?: any
}

export function FieldItem ({ widgetMeta, children, errors, widgetOptions, term, shaclPointer, dataPointer, uiLanguagePriorities, isList = false, isHeader = false, isFooter = false }: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormSingleEditor<any>>()
  // const [widgetInstance, setWidgetInstance] = useState<ShaclFormSingleEditor<any>>()
  const [widgetClass, setWidgetClass] = useState(undefined)

  useLayoutEffect(() => {
    widgetMeta.resolve().then((widgetModule: any) => setWidgetClass(() => widgetModule.default))
  }, [])

  useLayoutEffect(() => {
    if (!widgetInstance && widgetClass) {
      const widgetHtmlName = 'sf-' + widgetClass.name.toLowerCase().replaceAll('$', '-')
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, widgetClass)

      const element = document.createElement(widgetHtmlName) as ShaclFormSingleEditor<any>
      element.term = term
      element.widgetSettings = widgetOptions
      element.shaclPointer = shaclPointer
      element.dataPointer = () => dataPointer
      element.isHeader = isHeader
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

  return isHeader || isFooter ? 
    <div className={isHeader ? 'header' : (isFooter ? 'footer' : 'widget')} ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div> : 
  (
    <div className={`item ${errorMessages.length ? 'has-errors' : ''} type-${widgetClass?.name} ${isList ? 'is-list' : ''}`}>

      {errorMessages.length ? errorMessages.map(errorMessage => <div key={errorMessage} style={{ flex: '1 1 100%' }} className="alert m-2 alert-danger" role="alert">
        {errorMessage}
      </div>
      ) : null}

      {isList ? <div className='ps-1 d-flex my-handle' style={{cursor: 'grab'}}>
        <Icon style={{ fontSize: 24, margin: 'auto' }} icon="mdi:drag" />
      </div> : null}
      <div className={isHeader ? 'header' : (isFooter ? 'footer' : 'widget')} ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {showRemove ? (
        // TODO this icon will flash because it is in the FieldItem.
        <button type="button" className='btn btn-remove-item'>
          <Icon icon="octicon:trash-16" />
        </button>
      ) : null}
    </div>
  )
}