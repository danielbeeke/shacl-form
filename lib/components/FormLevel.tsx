import { FieldWrapper } from './FieldWrapper'
import { hash } from '../helpers/hash'
import { GrapoiPointer } from '../types'
import { Writer } from 'n3'

export function FormLevel ({ tree, depth = 0, languagePriorities, dataPointer }: { tree: any, depth: number, languagePriorities: Array<string>, dataPointer: GrapoiPointer }) {
  depth++

  const cid = Object.keys(tree).join(',') + depth

  return (
    <>
      {Object.entries(tree).flatMap(([predicate, field]: [any, any], outerIndex: number) => {
        const childrenObject = Object.fromEntries(Object.entries(field as any).filter(([name]) => name[0] !== '_'))
        const children = (dataPointer: GrapoiPointer) => {
          return Object.keys(childrenObject).length ? 
          (<FormLevel dataPointer={dataPointer} languagePriorities={languagePriorities} key={hash(cid + predicate + outerIndex + 'children')} depth={depth} tree={childrenObject} />)
        : null
        }

        return [
          field._widgets?.length ? field._widgets
          .filter((widget: any) => widget._score > 0)
          .map((widget: any, index: number) => {

            return (
              <FieldWrapper 
                uiLanguagePriorities={languagePriorities} 
                key={hash(cid + widget._widget.name + outerIndex + index)} 
                structure={widget} 
                dataPointer={() => dataPointer}
                Widget={widget._widget}
              >
                {children}
              </FieldWrapper>
            )
          }) : null,
        ]
     })}
    </>
  )
}

export function FormLevelBase ({ tree, uiLanguagePriorities: languagePriorities, dataPointer }: { tree: any, uiLanguagePriorities: Array<string>, dataPointer: GrapoiPointer }) {
  return (
    <>
      <FormLevel languagePriorities={languagePriorities} key="main" depth={0} tree={tree} dataPointer={dataPointer}></FormLevel>

      <button onClick={() => {
        const store = dataPointer.ptrs[0].dataset
        const writer = new Writer()
        for (const quad of store) writer.addQuad(quad)
        writer.end((error, result) => console.log(result))
      }}>Save</button>
    </>
  )
}