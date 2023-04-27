import { useEffect, useState } from 'react'
import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { GrapoiPointer, Widget } from '../types'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number,
  children: (values: GrapoiPointer) => Array<any>,
  dataPointer: () => GrapoiPointer
}

const removeItem = (element: ShaclFormWidget<any>) => {
  element.dataPointer().deleteOut(element.predicate, element.value)
  // TODO remove also the children.
  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index, children, dataPointer }: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormWidget<any>>()
  const { _shaclPointer: _shaclPointer, _messages, _path, _predicate } = structure

  useEffect(() => {
    if (!widgetInstance) {
      const widgetHtmlName = 'sf-' + Widget.elementName
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, Widget)

      const element = document.createElement(widgetHtmlName) as ShaclFormWidget<any>
      element.shaclPointer = _shaclPointer
      element.messages = _messages
      element.dataPointer = dataPointer
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
    const pointer = dataPointer().out([_predicate])

    const childPointer = pointer.clone({
      ptrs: [pointer.ptrs[index]].filter(Boolean)
    })

    resolvedChildren = children(childPointer)
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