import { useEffect, useState } from 'react'
import { ShaclFormField } from '../ShaclFormField'
import { Widget } from '../types'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number 
}

const removeItem = (element: ShaclFormField<any>) => {
  const { predicate, object } = element.value
  element.dataPointer.deleteOut(predicate, object)
  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index }: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormField<any>>()
  const { _pointer, _messages, _dataPointer, _path, _predicate } = structure

  useEffect(() => {
    if (!widgetInstance) {
      const widgetHtmlName = 'sf-' + Widget.elementName
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, Widget)

      const element = document.createElement(widgetHtmlName) as ShaclFormField<any>
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
      <button onClick={() => removeItem(widgetInstance!)}>Remove</button>
    </>
  )
}