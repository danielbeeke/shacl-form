import { FieldWrapper } from './field/FieldWrapper'
import { hash } from '../helpers/hash'
import { GrapoiPointer } from '../types'
import { sh, rdf } from '../helpers/namespaces'
import { createElement } from 'react'

type FormLevelProps = { 
  tree: any, 
  depth: number, 
  uiLanguagePriorities: Array<string>, 
  dataPointer: GrapoiPointer, 
  form: any, 
  shaclPointer: GrapoiPointer 
  ignoreGroups: boolean
}

export function FormLevel ({ 
  tree, 
  depth = 0, 
  uiLanguagePriorities, 
  dataPointer, 
  form, 
  shaclPointer,
  ignoreGroups = false
}: FormLevelProps) {
  depth++

  const cid = Object.keys(tree).join(',') + depth

  const widgets = Object.entries(tree).flatMap(([predicate, field]: [any, any], outerIndex: number) => {
    if (predicate[0] === '_') return
    if (!ignoreGroups && field._usedInGroup) return

    const childrenObject = Object.fromEntries(Object.entries(field as any).filter(([name]) => name[0] !== '_'))
    const children = (dataPointer: GrapoiPointer) => {
      return Object.keys(childrenObject).length ? 
        (<FormLevel 
          dataPointer={dataPointer} 
          uiLanguagePriorities={uiLanguagePriorities} 
          form={form} 
          ignoreGroups={ignoreGroups}
          key={hash(cid + predicate + outerIndex + 'children')} 
          shaclPointer={shaclPointer} 
          depth={depth} 
          tree={childrenObject} 
        />)
        : null
    }

    const widgets = field._widgets

    for (const widget of widgets) {
      widget._score = widget._widget.score(widget._shaclPointer, dataPointer)
    }

    return widgets?.length ? widgets
      .filter((widget: any) => widget._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 1)
      .map((widget: any, index: number) => {
        return (
          <FieldWrapper 
            uiLanguagePriorities={uiLanguagePriorities} 
            key={hash(cid + widget._widget.name + outerIndex + index)} 
            structure={widget} 
            form={form}
            dataPointer={() => dataPointer}
            Widget={widget._widget}
          >
            {children}
          </FieldWrapper>
        )
      }) : null
  })
  .filter(Boolean)
  .sort((a: any, b: any) => {
    const aOrder = a.props.structure._order
    const bOrder = b.props.structure._order
    return aOrder - bOrder
  })

  /**
   * Put items from this level into groups.
   * Groups only function for one level.
   * 
   * TODO Should this move to shaclTree?
   */
  const groups = new Map()

  const groupedWidgets = [
    ...widgets.map(widget => [widget.props.structure._shaclPointer.out([sh('group')]).term ?? 'none', widget]), 
    ...Object.values(tree._groups ?? {}).map((group: any) => [group.group]) ?? []
  ].filter(Boolean)

  for (const [group, widget] of groupedWidgets) {
    if (!groups.has(group)) {
      const groupPointer = shaclPointer.out([null], group)
      const groupTypes = groupPointer.out([rdf('type')]).terms
      const order = groupPointer.out([sh('order')]).value ? parseInt(groupPointer.out([sh('order')]).value) : 0
      let [element] = groupTypes.map(groupType => form.options.groups[groupType.value]).filter(Boolean)
      if (!element) element = form.options.groups.default
      groups.set(group, { element, props: { groupPointer }, children: [], order })
    }
    const groupObject = groups.get(group)
    groupObject.children.push(widget)
  }

  return (
    <>
      {[...groups.entries()].map(([group, groupObject]) => {
        return createElement(groupObject.element, { 
          ...groupObject.props,
          key: 'index:' + (typeof group === 'string' ? group : group.value),
          form
        }, ...groupObject.children)
      })}
    </>
  )
}

type FormLevelBaseProps = {
  tree: any, 
  uiLanguagePriorities: Array<string>, 
  dataPointer: GrapoiPointer, 
  form: any, 
  shaclPointer: GrapoiPointer,
  ignoreGroups: boolean
}

export function FormLevelBase ({ tree, uiLanguagePriorities, dataPointer, form, shaclPointer, ignoreGroups = false }: FormLevelBaseProps) {
  return (
    <FormLevel 
      uiLanguagePriorities={uiLanguagePriorities} 
      key="main" depth={0} 
      tree={tree} 
      shaclPointer={shaclPointer} 
      dataPointer={dataPointer} 
      form={form} 
      ignoreGroups={ignoreGroups}
    />
  )
}