import { useEffect, useState } from 'react'
import { ShaclFormEditorSingle } from '../../core/ShaclFormEditorSingle'
import { GrapoiPointer, Widget } from '../../types'
import { sh } from '../../helpers/namespaces'
import { cast } from '../../helpers/cast'
import { ShaclFormEditorMerged } from '../../core/ShaclFormEditorMerged'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number,
  children: (values: GrapoiPointer) => Array<any>,
  dataPointer: () => GrapoiPointer
  uiLanguagePriorities: Array<string>
}

// TODO move to the element?
const removeItem = async (element: ShaclFormEditorSingle<any>) => {
  await element.beforeRemove()

  let resolvedPointer = element.dataPointer().trim().out([element.predicate], [element.value as any])
  const quadsToRemove = new Set()
  while ([...resolvedPointer.quads()].length) {
    for (const quad of resolvedPointer.quads()) quadsToRemove.add(quad)
    resolvedPointer = resolvedPointer.out()
  }

  element.dataPointer().ptrs[0].dataset.removeQuads([...quadsToRemove.values()])
  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index, children, dataPointer, uiLanguagePriorities }: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormEditorSingle<any>>()
  const { _shaclPointer: _shaclPointer, _messages, _path, _predicate, _fields, _mapping } = structure

  useEffect(() => {
    if (!widgetInstance) {
      const widgetHtmlName = 'sf-' + Widget.name.toLowerCase()
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, Widget)
      const element = document.createElement(widgetHtmlName) as ShaclFormEditorSingle<any>
      element.shaclPointer = _shaclPointer
      element.messages = _messages
      element.dataPointer = dataPointer
      element.index = index
      element.path = _path
      element.uiLanguagePriorities = uiLanguagePriorities
      element.predicate = _predicate

      ;(element as unknown as ShaclFormEditorMerged<any>).fields = _fields
      ;(element as unknown as ShaclFormEditorMerged<any>).mapping = _mapping

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

  if (Widget.type === 'merged') showRemove = false

  return (
    <div className="item">
      <div className='widget' ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {resolvedChildren ? (<div>
        {resolvedChildren}
      </div>) : null}
      {showRemove ? (
        <button className='btn-remove-item' onClick={() => removeItem(widgetInstance!)}>Remove</button>
      ) : null}
    </div>
  )
}