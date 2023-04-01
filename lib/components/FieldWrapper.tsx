import { String } from '../widgets/String'

const widgetRegistry = {
  string: String
}

export function FieldWrapper ({ predicate, children, widgets }: { predicate: string, children: any, widgets: any }) {

  return (
    <div>
      {widgets?.map((widget: any, index: number) => {
        const Widget = widgetRegistry[widget.widget as keyof typeof widgetRegistry]

        return (
          <Widget key={predicate + index} predicate={predicate} properties={widget.properties}></Widget>
        )
      })}
    </div>
  )
}