import { sh } from '../namespaces'
import { bestLanguage } from '../helpers/bestLanguage'
import { FieldItem } from './FieldItem'
import { GrapoiPointer, Literal, Widget } from '../types'
import type { NamedNode } from '@rdfjs/types'
import { useRef } from 'react'

type FieldWrapperProps = { 
  Widget: any, 
  children: any, 
  structure: Widget, 
  uiLanguagePriorities: Array<string> 
}

const addItem = (pointer: GrapoiPointer, predicate: NamedNode, elementRef: any) => {
  pointer.addOut([predicate], new Literal('')) // TODO should this be defined by the widget?
  const form = elementRef.current.closest('.shacl-form')
  form.render()
}

export function FieldWrapper ({ Widget, children, structure, uiLanguagePriorities }: FieldWrapperProps) {
  const { _pointer, _dataPointer, _predicate } = structure

  const name = bestLanguage(_pointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(_pointer.out([sh('description')]), uiLanguagePriorities)
  const indices = [...[..._dataPointer.out([_predicate]).quads()].keys()]

  const element = useRef<HTMLDivElement>(null)

  return (
    <div ref={element} className={`field`} data-predicate={_predicate.value}>
      {name ? (<h3>{name}</h3>) : null}

      <div className='items'>
        {indices.map(index => {
          return (<FieldItem key={index} index={index} structure={structure} Widget={Widget} />)
        })}
      </div>
      
      <button onClick={() => addItem(_dataPointer, _predicate, element)}>Add item</button>

      {description ? (<p>{description}</p>) : null}

      {children ? (<div className='children'>{children}</div>) : null}
    </div>
  )
}