import { useEffect, useState } from 'react'
import { ShaclFormSingleEditor } from '../../core/ShaclFormSingleEditor'
import { GrapoiPointer, Widget } from '../../types'
import { sh } from '../../helpers/namespaces'
import { cast } from '../../helpers/cast'
import { ShaclFormMultiEditor } from '../../core/ShaclFormMultiEditor'
import { Icon } from '@iconify-icon/react';
import { replaceList } from '../../helpers/replaceList'

type FieldItemProps = {
  structure: Widget, 
  Widget: any, 
  index: number,
  children: (values: GrapoiPointer) => Array<any>,
  dataPointer: () => GrapoiPointer
  uiLanguagePriorities: Array<string>,
  isHeader?: boolean,
  isFooter?: boolean,
  isList?: boolean
}

// TODO move to the element?
const removeItem = async (element: ShaclFormSingleEditor<any>, isList: boolean) => {
  const goAhead = await element.beforeRemove()
  if (!goAhead) return

  if (isList) {
    const values = element.values
    const currentValue = element.value
    const filteredValues = values.filter(item => !item.equals(currentValue))
    replaceList(filteredValues, element.dataPointer().out([element.predicate]))
  }
  else {
    // Removes also the children of this item.
    let resolvedPointer = element.dataPointer().trim().out([element.predicate], [element.value as any])
    const quadsToRemove = new Set()
    while ([...resolvedPointer.quads()].length) {
      for (const quad of resolvedPointer.quads()) quadsToRemove.add(quad)
      resolvedPointer = resolvedPointer.out()
    }

    element.dataPointer().ptrs[0].dataset.removeQuads([...quadsToRemove.values()])
  }

  ;(element.closest('.shacl-form') as any).render()
}

export function FieldItem ({ structure, Widget, index, children, dataPointer, uiLanguagePriorities, isList = false, isHeader = false, isFooter = false }: FieldItemProps) {
  const [widgetInstance, setWidgetInstance] = useState<ShaclFormSingleEditor<any>>()
  const { _shaclPointer: _shaclPointer, _messages, _path, _predicate, _fields, _mapping, _widgetSettings } = structure

  useEffect(() => {
    if (!widgetInstance) {
      const widgetHtmlName = 'sf-' + Widget.name.toLowerCase().replaceAll('$', '-')
      if (!customElements.get(widgetHtmlName)) customElements.define(widgetHtmlName, Widget)
      const element = document.createElement(widgetHtmlName) as ShaclFormSingleEditor<any>
      element.widgetSettings = _widgetSettings
      element.shaclPointer = _shaclPointer
      element.messages = _messages
      element.dataPointer = dataPointer
      element.index = index
      element.path = _path
      element.isList = isList
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
  const value = widgetInstance?.value
  let showRemove = value?.value && (minCount === undefined || minCount < pointer.ptrs.length)
  
  if (Widget.showRemove !== undefined) {
    showRemove = Widget.showRemove
  }

  if (Widget.type === 'multi') showRemove = false

  return isHeader || isFooter ? 
    <div className={isHeader ? 'header' : (isFooter ? 'footer' : 'widget')} ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div> : 
  (
    <div className={`item type-${Widget.name} ${isList ? 'is-list' : ''}`}>
      {isList ? <div className='ps-1 d-flex my-handle' style={{cursor: 'grab'}}>
        <Icon style={{ fontSize: 24, margin: 'auto' }} icon="mdi:drag" />
      </div> : null}
      <div className={isHeader ? 'header' : (isFooter ? 'footer' : 'widget')} ref={(ref) => { if (widgetInstance && ref) ref.appendChild(widgetInstance) } }></div>
      {resolvedChildren ? (<div className='children'>
        {resolvedChildren}
      </div>) : null}
      {showRemove ? (
        <button type="button" className='btn btn-remove-item' onClick={() => removeItem(widgetInstance!, isList)}>
          <Icon icon="octicon:trash-16" />
        </button>
      ) : null}
    </div>
  )
}