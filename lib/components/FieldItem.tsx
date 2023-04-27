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
  const { predicate, object } = element.value
  element.dataPointer.deleteOut(predicate, object)
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

  const datatype = _shaclPointer.out([sh('datatype')]).term
  const isBlankNode = datatype.equals(sh('BlankNodeOrIRI')) || datatype.equals(sh('sh:BlankNode')) || datatype.equals(sh('BlankNodeOrLiteral'))
  const values = isBlankNode ? data : data.out([_predicate])

  return (
    <>
      <div className='item' ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      <div>
        {children(values)}
      </div>
      <button onClick={() => removeItem(widgetInstance!)}>Remove</button>
    </>
  )
}