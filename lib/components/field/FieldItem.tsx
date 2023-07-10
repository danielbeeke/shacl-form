import { useEffect, useState } from 'react'
import { ShaclFormSingleEditor } from '../../core/ShaclFormSingleEditor'
import { GrapoiPointer, Widget } from '../../types'
import { sh } from '../../helpers/namespaces'
import { cast } from '../../helpers/cast'
import { ShaclFormMultiEditor } from '../../core/ShaclFormMultiEditor'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number,
  children: (values: GrapoiPointer) => Array<any>,
  dataPointer: () => GrapoiPointer
  uiLanguagePriorities: Array<string>,
  isHeader?: boolean,
  isFooter?: boolean
}

// TODO move to the element?
const removeItem = async (element: ShaclFormSingleEditor<any>) => {
  const goAhead = await element.beforeRemove()

  if (!goAhead) return
  
  let resolvedPointer = element.dataPointer().trim().out([element.predicate], [element.value as any])
  const quadsToRemove = new Set()
  while ([...resolvedPointer.quads()].length) {
    for (const quad of resolvedPointer.quads()) quadsToRemove.add(quad)
    resolvedPointer = resolvedPointer.out()
  }

  element.dataPointer().ptrs[0].dataset.removeQuads([...quadsToRemove.values()])
  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index, children, dataPointer, uiLanguagePriorities, isHeader = false, isFooter = false }: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormSingleEditor<any>>()
  const { _shaclPointer: _shaclPointer, _messages, _path, _predicate, _fields, _mapping } = structure

  useEffect(() => {
    if (!widgetInstance) {
      const widgetHtmlName = 'sf-' + Widget.name.toLowerCase()
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, Widget)
      const element = document.createElement(widgetHtmlName) as ShaclFormSingleEditor<any>
      element.shaclPointer = _shaclPointer
      element.messages = _messages
      element.dataPointer = dataPointer
      element.index = index
      element.path = _path
      element.isHeader = isHeader
      element.isFooter = isFooter
      element.uiLanguagePriorities = uiLanguagePriorities
      element.predicate = _predicate

      ;(element as unknown as ShaclFormMultiEditor<any>).fields = _fields
      ;(element as unknown as ShaclFormMultiEditor<any>).mapping = _mapping

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
  let showRemove = value?.value && (minCount === undefined || minCount < pointer.ptrs.length)

  if (Widget.type === 'multi') showRemove = false

  return isHeader || isFooter ? 
    <div className={isHeader ? 'header' : (isFooter ? 'footer' : 'widget')} ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div> : 
  (
    <div className={`item type-${Widget.name}`}>
      <div className={isHeader ? 'header' : (isFooter ? 'footer' : 'widget')} ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {resolvedChildren ? (<div>
        {resolvedChildren}
      </div>) : null}
      {showRemove ? (
        <button className='ms-2 btn btn-danger btn-remove-item' onClick={() => removeItem(widgetInstance!)}>Remove</button>
      ) : null}
    </div>
  )
}