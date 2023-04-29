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
  dataPointer: () => GrapoiPointer
}

const addItem = (pointer: GrapoiPointer, predicate: NamedNode, elementRef: any, Widget: any, _pathPart: any) => {
  pointer.addOut(predicate, Widget.createNewObject())
  const form = elementRef.current.closest('.shacl-form')
  form.render()
}

export function FieldWrapper ({ Widget, children, structure, uiLanguagePriorities, dataPointer }: FieldWrapperProps) {
  const { _shaclPointer, _predicate, _pathPart } = structure

  const name = bestLanguage(_shaclPointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(_shaclPointer.out([sh('description')]), uiLanguagePriorities)

  const fieldData = dataPointer().execute(_pathPart).trim()

  const element = useRef<HTMLDivElement>(null)

  if (fieldData.terms.length === 0) {
    const newObject = Widget.createNewObject()
    if (newObject.termType !== 'BlankNode') {
      dataPointer().addOut(_predicate, Widget.createNewObject())
    }
  }

  const maxCount = _shaclPointer.out([sh('maxCount')]).value

  return (
    <div ref={element} className={`field`} data-predicate={_predicate.value}>
      {name ? (<h3>{name}</h3>) : null}

      {description ? (<p dangerouslySetInnerHTML={{__html: description}}></p>) : null}

      <div className='items'>
        {fieldData.terms.map((term, index) => {

          const cid = JSON.stringify([_pathPart, term]) + index

          return (
            <FieldItem 
              key={cid} 
              index={index} 
              structure={structure}
              uiLanguagePriorities={uiLanguagePriorities}
              dataPointer={dataPointer}
              Widget={Widget}
            >
              {children}
            </FieldItem>
          )
        })}
      </div>
      
      {!maxCount || fieldData.terms.length < maxCount ? (
        <button className='btn-add-item' onClick={() => addItem(dataPointer(), _predicate, element, Widget, _pathPart)}>
          Add item
        </button>
      ) : null} 
    </div>
  )
}