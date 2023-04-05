import { useEffect, useState } from 'react'
import { ShaclProperties } from '../types'
import { mergePointers } from '../helpers/mergePointers'

export function FieldWrapper ({ properties, Widget, children, messages, ptrs }: { properties: ShaclProperties, Widget: any, children: any, messages: any, ptrs: Array<any> }) {

  const name = properties.name?.default ?? properties.name?.en
  const description = properties.description?.default ?? properties.description?.en
  const [widgetInstance, setWidgetInstance] = useState<HTMLElement>()

  useEffect(() => {
    if (!widgetInstance) {
      if (!customElements.get(Widget.elementName)) {
        customElements.define(Widget.elementName, Widget)
      }

      const element = document.createElement(Widget.elementName)
      element.properties = properties
      element.pointer = mergePointers(ptrs)
      element.messages = messages
      setWidgetInstance(element)
    }

    return () => {
      widgetInstance?.remove()
    }
  }, [])

  return (
    <div className='field'>
      <label>{name}</label>
      <div ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      <p>{description}</p>
    </div>
  )
}