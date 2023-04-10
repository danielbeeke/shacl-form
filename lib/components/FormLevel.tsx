import { FieldWrapper } from './FieldWrapper'
import { hash } from '../helpers/hash'

import String from '../widgets/String'
import BlankNode from '../widgets/BlankNode'

const widgetRegistry = {
  'field-blank-node': BlankNode,
  string: String,
}

export function FormLevel ({ tree, depth = 0, languagePriorities }: { tree: any, depth: number, languagePriorities: Array<string> }) {
  depth++

  const cid = Object.keys(tree).join(',') + depth

  return (
    <>
      {Object.entries(tree).flatMap(([predicate, field]: [any, any], outerIndex: number) => {
        const childrenObject = Object.fromEntries(Object.entries(field as any).filter(([name]) => name[0] !== '_'))
        const children = Object.keys(childrenObject).length ? (<FormLevel languagePriorities={languagePriorities} key={hash(cid + predicate + outerIndex + 'children')} depth={depth} tree={childrenObject}></FormLevel>) : null

        return [
          field._constraintsSet ? field._constraintsSet
          .filter((widget: any) => {
            const Widget = widgetRegistry[widget.widget as keyof typeof widgetRegistry]
            return Widget.applies(widget.shaclPointer)
          })
          .map((widget: any, index: number) => {
            const Widget = widgetRegistry[widget.widget as keyof typeof widgetRegistry]
            return (
              <FieldWrapper languagePriorities={languagePriorities} key={hash(cid + Widget + outerIndex + index)} structure={widget} Widget={Widget}>{children}</FieldWrapper>
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

export function FormLevelBase ({ tree, languagePriorities }: { tree: any, languagePriorities: Array<string> }) {
  return (<FormLevel languagePriorities={languagePriorities} key="main" depth={0} tree={tree}></FormLevel>)
}