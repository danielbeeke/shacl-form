export function FieldWrapper ({ properties, Widget, children }: { properties: ShaclPropertes, Widget: any, children: any }) {

  console.log(children)

  return (
    <Widget key={properties.path} properties={properties}>
      {children ? (<div>
        <span>Children</span>
        {children}
      </div>) : null}
    </Widget>
  )
}