import { FieldWrapper } from './FieldWrapper'
import { hash } from '../helpers/hash'
import { GrapoiPointer } from '../types'
import { Writer } from 'n3'

export function FormLevel ({ tree, depth = 0, uiLanguagePriorities, dataPointer }: { tree: any, depth: number, uiLanguagePriorities: Array<string>, dataPointer: GrapoiPointer }) {
  depth++

  const cid = Object.keys(tree).join(',') + depth

  const widgets = Object.entries(tree).flatMap(([predicate, field]: [any, any], outerIndex: number) => {
    const childrenObject = Object.fromEntries(Object.entries(field as any).filter(([name]) => name[0] !== '_'))
    const children = (dataPointer: GrapoiPointer) => {
      return Object.keys(childrenObject).length ? 
        (<FormLevel dataPointer={dataPointer} uiLanguagePriorities={uiLanguagePriorities} key={hash(cid + predicate + outerIndex + 'children')} depth={depth} tree={childrenObject} />)
        : null
    }

    return field._widgets?.length ? field._widgets
      .filter((widget: any) => widget._score > 0)
      .map((widget: any, index: number) => {
        return (
          <FieldWrapper 
            uiLanguagePriorities={uiLanguagePriorities} 
            key={hash(cid + widget._widget.name + outerIndex + index)} 
            structure={widget} 
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

  return (
    <>
      {widgets}
    </>
  )
}

export function FormLevelBase ({ tree, uiLanguagePriorities, dataPointer }: { tree: any, uiLanguagePriorities: Array<string>, dataPointer: GrapoiPointer }) {
  return (
    <>
      <FormLevel uiLanguagePriorities={uiLanguagePriorities} key="main" depth={0} tree={tree} dataPointer={dataPointer}></FormLevel>

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