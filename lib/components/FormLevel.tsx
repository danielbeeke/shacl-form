import { FieldWrapper } from './FieldWrapper'
import String from '../widgets/String'
import { hash } from '../helpers/hash'
import { mergePointers } from '../helpers/mergePointers'

const widgetRegistry = {
  string: String
}

export function FormLevel ({ tree, depth = 0 }: { tree: any, depth: number }) {
  depth++

  const cid = Object.keys(tree).join(',') + depth

  return (
    <>
      {Object.entries(tree).flatMap(([predicate, field]: [any, any], outerIndex: number) => {
        const childrenObject = Object.fromEntries(Object.entries(field as any).filter(([name]) => name[0] !== '_'))
        const children = Object.keys(childrenObject).length ? (<FormLevel key={hash(cid + predicate + outerIndex + 'children')} depth={depth} tree={childrenObject}></FormLevel>) : null

        return [
          field._widgets ? field._widgets
          .filter((widget: any) => {
            const Widget = widgetRegistry[widget.widget as keyof typeof widgetRegistry]
            return Widget.applies(mergePointers(widget.ptrs))
          })
          .map((widget: any, index: number) => {
            const { properties, messages, ptrs } = widget
            const Widget = widgetRegistry[widget.widget as keyof typeof widgetRegistry]

            return (
              <FieldWrapper key={hash(cid + Widget + outerIndex + index)} properties={properties} messages={messages} ptrs={ptrs} Widget={Widget}>{children}</FieldWrapper>
            )
          }) : null,
          children
        ]
     })}
    </>
  )
}

export function FormLevelBase ({ tree }: { tree: any }) {
  return (<FormLevel key="main" depth={0} tree={tree}></FormLevel>)
}