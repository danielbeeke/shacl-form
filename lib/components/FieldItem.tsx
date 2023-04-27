import { useEffect, useState } from 'react'
import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { GrapoiPointer, Widget } from '../types'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number,
  children: (values: GrapoiPointer) => Array<any>,
  data: GrapoiPointer
  parentData: GrapoiPointer
}

const removeItem = (element: ShaclFormWidget<any>) => {
  element.parentData.deleteOut(element.predicate, element.value)
  // TODO remove also the children.
  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index, children, data, parentData }: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormWidget<any>>()
  const { _shaclPointer: _shaclPointer, _messages, _path, _predicate } = structure

  useEffect(() => {
    if (!widgetInstance) {
      const widgetHtmlName = 'sf-' + Widget.elementName
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, Widget)

      const element = document.createElement(widgetHtmlName) as ShaclFormWidget<any>
      element.shaclPointer = _shaclPointer
      element.messages = _messages
      element.dataPointer = data
      element.parentData = parentData
      element.index = index
      element.path = _path
      element.predicate = _predicate
      
      structure._element = element
      setWidgetInstance(element)
    }

    return () => widgetInstance?.remove()
  }, [])

  let resolvedChildren

  if (children) {
    resolvedChildren = children(data)
  }

  return (
    <div className="item">
      <div ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {resolvedChildren ? (<div>
        {resolvedChildren}
      </div>) : null}
      <button onClick={() => removeItem(widgetInstance!)}>Remove</button>
    </div>
  )
}