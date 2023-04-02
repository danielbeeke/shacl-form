import { FieldWrapper } from './FieldWrapper'
import { String } from '../widgets/String'

const widgetRegistry = {
  string: String
}

export function FormLevel ({ tree }: { tree: any }) {
  return (
    <>
      {Object.entries(tree).map(([predicate, field]: [any, any]) => {
        const childrenObject = Object.fromEntries(Object.entries(field as any).filter(([name]) => name[0] !== '_'))
        const children = Object.keys(childrenObject).length ? (<FormLevel tree={childrenObject}></FormLevel>) : null

        return field._widgets ? field._widgets.map((widget: any) => {
          const properties = widget.properties
          const Widget = widgetRegistry[widget.widget as keyof typeof widgetRegistry]

          return (
            <FieldWrapper key={properties.path} properties={properties} Widget={Widget} children={children}></FieldWrapper>
          )
        }) : null
     })}
    </>
  )
}

export function Form ({ tree }: { tree: any }) {
  return (<FormLevel tree={tree}></FormLevel>)
}