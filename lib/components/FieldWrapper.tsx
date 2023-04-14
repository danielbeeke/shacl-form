import { useEffect, useState } from 'react'
import { sh } from '../namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import { ShaclFormField } from '../ShaclFormField'

export function FieldWrapper ({ Widget, children, structure, uiLanguagePriorities }: { Widget: any, children: any, structure: any, uiLanguagePriorities: Array<string> }) {
  const { _pointer, _messages, _dataPointer, _index } = structure
  const [widgetInstance, setWidgetInstance] = useState<HTMLElement>()

  useEffect(() => {
    if (!widgetInstance) {
      const widgetHtmlName = 'sf-' + Widget.elementName
      if (!customElements.get(widgetHtmlName)) {
        customElements.define(widgetHtmlName, Widget)
      }

      const element = document.createElement(widgetHtmlName) as ShaclFormField<any>
      element.shaclPointer = _pointer
      element.messages = _messages
      element.dataPointer = _dataPointer
      element.index = _index
      structure.element = element
      setWidgetInstance(element)
    }

    return () => widgetInstance?.remove()
  }, [])

  const name = bestLanguage(_pointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(_pointer.out([sh('description')]), uiLanguagePriorities)

  return (
    <div className='field'>
      {name ? (<label>{name}</label>) : null}
      <div ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {description ? (<p>{description}</p>) : null}

      {children ? (<div className='children'>{children}</div>) : null}
    </div>
  )
}