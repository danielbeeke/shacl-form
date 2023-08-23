import { FieldWrapper } from './field/FieldWrapper'
import { hash } from '../helpers/hash'
import { GrapoiPointer } from '../types'
import { sh, rdf, dash } from '../helpers/namespaces'
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
    const children = Object.keys(childrenObject).length ? (dataPointer: GrapoiPointer) => {

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
    } : null

    const widgets = field._widgets

    for (const widget of widgets) {
      const widgetScore = widget._widget.score(widget._shaclPointer, dataPointer, form.options)
      const definedEditor = widget._shaclPointer.out([dash('editor')]).value
      widget._definedEditor = definedEditor
      widget._score = definedEditor && widget._widget.iri === definedEditor ? 100 : widgetScore
    }

    // console.log(predicate)
    // console.table(widgets.map(widget => [widget._widget.name, widget._score]))

    const finalWidget = widgets?.length ? widgets
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
            isOrderedList={field._isOrderedList}
            errors={field._messages}
            dataPointer={() => dataPointer}
            Widget={widget._widget}
          >
            {children}
          </FieldWrapper>
        )
      }) : null

    if (finalWidget.length) return finalWidget

    return children ? children(dataPointer) : null
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
   * TODO Should these be framework agnostic?
   */
  const groups = new Map()

  const groupedWidgets = [
    ...widgets.map(widget => [widget.props?.structure?._shaclPointer?.out([sh('group')]).term ?? 'none', widget]), 
    ...Object.values(tree._groups ?? {}).map((group: any) => [group.group]) ?? []
  ].filter(Boolean)

  for (const [group, widget] of groupedWidgets) {
    const groupName = group?.value ?? group

    if (!groups.has(groupName)) {
      const groupPointer = shaclPointer.out([null], group)
      const groupTypes = groupPointer.out([rdf('type')]).terms
      const order = groupPointer.out([sh('order')]).value ? parseInt(groupPointer.out([sh('order')]).value) : 0
      let [element] = groupTypes.map(groupType => form.options.groups[groupType.value]).filter(Boolean)
      if (!element) element = form.options.groups.default
      groups.set(groupName, { element, props: { groupPointer, order }, children: [], order })
    }
    const groupObject = groups.get(groupName)
    groupObject.children.push(widget)
  }

  return (
    <>
      {[...groups.entries()].map(([group, groupObject]) => {
        return createElement(groupObject.element, { 
          ...groupObject.props,
          key: 'index:' + (typeof group === 'string' ? group : group),
          form
        }, ...groupObject.children)
      }).sort((a, b) => {
        /** @ts-ignore */
        return a.props.order - b.props.order
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
    <form onSubmit={(event) => {
      event.preventDefault()
    }}>
      <FormLevel 
        uiLanguagePriorities={uiLanguagePriorities} 
        key="main" depth={0} 
        tree={tree} 
        shaclPointer={shaclPointer} 
        dataPointer={dataPointer} 
        form={form} 
        ignoreGroups={ignoreGroups}
      />
    </form>
  )
}