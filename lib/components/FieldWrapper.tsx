import { sh } from '../helpers/namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import { FieldItem } from './FieldItem'
import { GrapoiPointer, Widget, NamedNode } from '../types'
import { useRef } from 'react'

type FieldWrapperProps = { 
  Widget: any, 
  children: any, 
  structure: Widget, 
  uiLanguagePriorities: Array<string>,
  data: GrapoiPointer
}

const addItem = (pointer: GrapoiPointer, predicate: NamedNode, elementRef: any, Widget: any) => {
  pointer.addOut([predicate], Widget.createNewObject())
  const form = elementRef.current.closest('.shacl-form')
  form.render()
}

export function FieldWrapper ({ Widget, children, structure, uiLanguagePriorities, data }: FieldWrapperProps) {
  const { _shaclPointer, _predicate, _pathPart } = structure

  const name = bestLanguage(_shaclPointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(_shaclPointer.out([sh('description')]), uiLanguagePriorities)

  const childData = data.execute(_pathPart).trim()

  const indices = [...[...childData.terms].keys()]
  const element = useRef<HTMLDivElement>(null)


  return (
    <div ref={element} className={`field`} data-predicate={_predicate.value}>
      {name ? (<h3>{name}</h3>) : null}

      {description ? (<p>{description}</p>) : null}

      <div className='items'>
        {indices.map(index => {
          return (<FieldItem key={index} index={index} structure={structure} data={childData} Widget={Widget}>{children}</FieldItem>)
        })}
      </div>
      
      <button onClick={() => addItem(data, _predicate, element, Widget)}>Add item</button>

    </div>
  )
}