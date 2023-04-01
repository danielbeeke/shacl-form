export function String ({ properties, predicate }: { properties: any, predicate: string }) {

  console.log(properties)

  return (
    <div key={predicate}>
      String
    </div>
  )
}