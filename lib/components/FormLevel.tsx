import { FieldWrapper } from './field/FieldWrapper'
import { hash } from '../helpers/hash'
import { GrapoiPointer } from '../types'
import { Writer } from 'n3'
import { sh, rdf } from '../helpers/namespaces'
import { DefaultGroup } from './groups/DefaultGroup'
import { createElement } from 'react'

/** @ts-ignore */
const groupComponents = import.meta.glob('./groups/*', { eager: true })

type FormLevelProps = { 
  tree: any, 
  depth: number, 
  uiLanguagePriorities: Array<string>, 
  dataPointer: GrapoiPointer, 
  form: any, 
  shaclPointer: GrapoiPointer 
}

export function FormLevel ({ 
  tree, 
  depth = 0, 
  uiLanguagePriorities, 
  dataPointer, 
  form, 
  shaclPointer 
}: FormLevelProps) {
  depth++

  const cid = Object.keys(tree).join(',') + depth

  const widgets = Object.entries(tree).flatMap(([predicate, field]: [any, any], outerIndex: number) => {
    const childrenObject = Object.fromEntries(Object.entries(field as any).filter(([name]) => name[0] !== '_'))
    const children = (dataPointer: GrapoiPointer) => {
      return Object.keys(childrenObject).length ? 
        (<FormLevel 
          dataPointer={dataPointer} 
          uiLanguagePriorities={uiLanguagePriorities} 
          form={form} 
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
   */
  const groups = new Map()

  for (const widget of widgets) {
    const group = widget.props.structure._shaclPointer.out([sh('group')]).term ?? 'none'
    if (!groups.has(group)) {
      const groupPointer = shaclPointer.out([null], group)
      const groupTypes = groupPointer.out([rdf('type')]).terms
      const element = (Object.values(groupComponents).find((groupComponent: any) => groupTypes.find(groupType => groupComponent.iri?.equals(groupType))) as any)?.default ?? DefaultGroup
      groups.set(group, { element, props: { groupPointer }, children: [] })
    }
    const groupObject = groups.get(group)
    groupObject.children.push(widget)
  }

  return (
    <>
      {[...groups.entries()].map(([index, groupObject]) => createElement(groupObject.element, { 
        ...groupObject.props,
        key: 'index:' + index,
        form
      }, ...groupObject.children))}
    </>
  )
}

type FormLevelBaseProps = {
  tree: any, 
  uiLanguagePriorities: Array<string>, 
  dataPointer: GrapoiPointer, 
  form: any, 
  shaclPointer: GrapoiPointer
}

export function FormLevelBase ({ tree, uiLanguagePriorities, dataPointer, form, shaclPointer }: FormLevelBaseProps) {
  return (
    <>
      <FormLevel 
        uiLanguagePriorities={uiLanguagePriorities} 
        key="main" depth={0} 
        tree={tree} 
        shaclPointer={shaclPointer} 
        dataPointer={dataPointer} 
        form={form} 
      />
      <br />

      <button onClick={() => {
        const store = dataPointer.ptrs[0].dataset
        const lists = store.extractLists({ remove: true });
        const writer = new Writer({ lists })
        for (const quad of store) {
          // We simply skip empty items.
          if (quad.object.value) writer.addQuad(quad)
        }
        writer.end((error, result) => console.log(result))
      }}>Print turtle into console</button>
    </>
  )
}