import { useEffect, useState } from 'react'
import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { Widget } from '../types'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number,
  children: () => Array<any>
}

const removeItem = (element: ShaclFormWidget<any>) => {
  const { predicate, object } = element.value
  element.dataPointer.deleteOut(predicate, object)
  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index, children }: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormWidget<any>>()
  const { _pointer, _messages, _dataPointer, _path, _predicate } = structure

  useEffect(() => {
    if (!widgetInstance) {
      const widgetHtmlName = 'sf-' + Widget.elementName
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, Widget)

      const element = document.createElement(widgetHtmlName) as ShaclFormWidget<any>
      element.shaclPointer = _pointer
      element.messages = _messages
      element.dataPointer = _dataPointer
      element.index = index
      element.path = _path
      element.predicate = _predicate
      
      structure._element = element
      setWidgetInstance(element)
    }

    return () => widgetInstance?.remove()
  }, [])

  return (
    <>
      <div className='item' ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      <div>
        {children()}
      </div>
      <button onClick={() => removeItem(widgetInstance!)}>Remove</button>
    </>
  )
}