import { sh } from '../helpers/namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import { FieldItem } from './FieldItem'
import { GrapoiPointer, Widget, NamedNode } from '../types'
import { useRef } from 'react'

type FieldWrapperProps = { 
  Widget: any, 
  children: any, 
  structure: Widget, 
  uiLanguagePriorities: Array<string> 
}

const addItem = (pointer: GrapoiPointer, predicate: NamedNode, elementRef: any, Widget: any) => {
  pointer.addOut([predicate], Widget.createNewObject())
  const form = elementRef.current.closest('.shacl-form')
  form.render()
}

export function FieldWrapper ({ Widget, children, structure, uiLanguagePriorities }: FieldWrapperProps) {
  const { _pointer, _dataPointer, _predicate } = structure

  const name = bestLanguage(_pointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(_pointer.out([sh('description')]), uiLanguagePriorities)

  const isBlankNode = Widget.name === 'BlankNodeOrIri'

  const indices = isBlankNode ? [...[..._dataPointer.quads()].keys()] : [...[..._dataPointer.out([_predicate]).quads()].keys()]
  
  const element = useRef<HTMLDivElement>(null)

  return (
    <div ref={element} className={`field`} data-predicate={_predicate.value}>
      {name ? (<h3>{name}</h3>) : null}

      <div className='items'>
        {indices.map(index => {
          return (<FieldItem key={index} index={index} structure={structure} Widget={Widget}>{children}</FieldItem>)
        })}
      </div>
      
      <button onClick={() => addItem(_dataPointer, _predicate, element, Widget)}>Add item</button>

      {description ? (<p>{description}</p>) : null}
    </div>
  )
}