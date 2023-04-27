import { FieldWrapper } from './FieldWrapper'
import { hash } from '../helpers/hash'
import { GrapoiPointer } from '../types'

export function FormLevel ({ tree, depth = 0, languagePriorities, data }: { tree: any, depth: number, languagePriorities: Array<string>, data: GrapoiPointer }) {
  depth++

  const cid = Object.keys(tree).join(',') + depth

  return (
    <>
      {Object.entries(tree).flatMap(([predicate, field]: [any, any], outerIndex: number) => {
        const childrenObject = Object.fromEntries(Object.entries(field as any).filter(([name]) => name[0] !== '_'))
        const children = (data: GrapoiPointer) => Object.keys(childrenObject).length ? 
          (<FormLevel data={data} languagePriorities={languagePriorities} key={hash(cid + predicate + outerIndex + 'children')} depth={depth} tree={childrenObject} />)
        : null

        return [
          field._widgets?.length ? field._widgets
          .filter((widget: any) => widget._score > 0)
          .map((widget: any, index: number) => {
            const childData = data.execute(widget._pathPart).trim()

            return (
              <FieldWrapper 
                uiLanguagePriorities={languagePriorities} 
                key={hash(cid + widget._widget.name + outerIndex + index)} 
                structure={widget} 
                data={childData}
                Widget={widget._widget}
              >
                {children}
              </FieldWrapper>
            )
          }) : null,
          // TODO these children should be rendered by widgets that are groups
          // However how to do that? This would be a perfect way of rendering address fields etc.
          // children
        ]
     })}
    </>
  )
}

export function FormLevelBase ({ tree, uiLanguagePriorities: languagePriorities, data }: { tree: any, uiLanguagePriorities: Array<string>, data: GrapoiPointer }) {
  return (<FormLevel languagePriorities={languagePriorities} key="main" depth={0} tree={tree} data={data}></FormLevel>)
}