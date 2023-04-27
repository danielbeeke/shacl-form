import { useEffect, useState } from 'react'
import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { GrapoiPointer, Widget } from '../types'
import { sh } from '../helpers/namespaces'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number,
  children: (values: GrapoiPointer) => Array<any>,
  data: GrapoiPointer
}

const removeItem = (element: ShaclFormWidget<any>) => {
  element.dataPointer.deleteOut(element.predicate, element.value)
  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index, children, data }: FieldItemProps) {
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
    const childData = data.clone({
      ptrs: [data.ptrs[index]]
    }).trim()

    resolvedChildren = children(childData)
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