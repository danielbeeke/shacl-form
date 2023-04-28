import { useEffect, useState } from 'react'
import { ShaclFormWidget } from '../core/ShaclFormWidget'
import { GrapoiPointer, Widget } from '../types'
import { sh } from '../helpers/namespaces'
import { cast } from '../helpers/cast'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number,
  children: (values: GrapoiPointer) => Array<any>,
  dataPointer: () => GrapoiPointer
  uiLanguagePriorities: Array<string>
}

const removeItem = (element: ShaclFormWidget<any>) => {
  let resolvedPointer = element.dataPointer().out([element.predicate])
  const quadsToRemove = new Set()
  while ([...resolvedPointer.quads()].length) {
    for (const quad of resolvedPointer.quads()) quadsToRemove.add(quad)
    resolvedPointer = resolvedPointer.out()
  }

  element.dataPointer().ptrs[0].dataset.removeQuads([...quadsToRemove.values()])
  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index, children, dataPointer, uiLanguagePriorities }: FieldItemProps) {
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
      element.uiLanguagePriorities = uiLanguagePriorities
      element.predicate = _predicate
      
      structure._element = element
      setWidgetInstance(element)
    }

    return () => widgetInstance?.remove()
  }, [])

  let resolvedChildren
  const pointer = dataPointer().out([_predicate])

  if (children) {
    const childPointer = pointer.clone({
      ptrs: [pointer.ptrs[index]].filter(Boolean)
    })

    resolvedChildren = children(childPointer)
  }

  const minCount = cast(_shaclPointer.out([sh('minCount')]))
  const value = dataPointer().out([_predicate]).terms[index]
  const showRemove = value.value && (minCount === undefined || minCount < pointer.ptrs.length)

  return (
    <div className="item">
      <div ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {resolvedChildren ? (<div>
        {resolvedChildren}
      </div>) : null}
      {showRemove ? (
        <button onClick={() => removeItem(widgetInstance!)}>Remove</button>
      ) : null}
    </div>
  )
}