import { useEffect, useState } from 'react'
import { sh } from '../namespaces'
import { bestLanguage } from '../helpers/bestLanguage'

export function FieldWrapper ({ Widget, children, structure, languagePriorities }: { Widget: any, children: any, structure: any, languagePriorities: Array<string> }) {
  const { shaclPointer, messages, dataPointer, index } = structure
  const [widgetInstance, setWidgetInstance] = useState<HTMLElement>()

  useEffect(() => {
    if (!widgetInstance) {
      if (!customElements.get(Widget.elementName)) {
        customElements.define(Widget.elementName, Widget)
      }

      const element = document.createElement(Widget.elementName)
      element.shaclPointer = shaclPointer
      element.messages = messages
      element.dataPointer = dataPointer
      element.index = index
      structure.element = element
      setWidgetInstance(element)
    }

    return () => widgetInstance?.remove()
  }, [])

  const name = bestLanguage(shaclPointer.out([sh('name')]), languagePriorities)
  const description = bestLanguage(shaclPointer.out([sh('description')]), languagePriorities)

  return (
    <div className='field'>
      {name ? (<label>{name}</label>) : null}
      <div ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {description ? (<p>{description}</p>) : null}

      {children}
    </div>
  )
}