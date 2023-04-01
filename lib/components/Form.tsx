import { FieldWrapper } from './FieldWrapper'

export function Form ({ tree }: { tree: any }) {

  return (
    <div>
      {Object.entries(tree).map(([predicate, field]: [any, any]) => {
        const children = Object.entries(field as any).filter(([name]) => name[0] !== '_')

        return (
          <div key={predicate}>
            <FieldWrapper predicate={predicate} widgets={field._widgets} children={children}></FieldWrapper>
          </div>
        )
      })}
    </div>
  )
}