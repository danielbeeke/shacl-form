import { sh } from '../../helpers/namespaces'
import { bestLanguage } from '../../helpers/bestLanguage'
import { FieldItem } from './FieldItem'
import { GrapoiPointer, Widget, NamedNode, Literal } from '../../types'
import { useRef } from 'react'

type FieldWrapperProps = { 
  Widget: any, 
  children: any, 
  structure: Widget, 
  uiLanguagePriorities: Array<string>,
  dataPointer: () => GrapoiPointer,
  form: any
}

const addItem = (pointer: GrapoiPointer, predicate: NamedNode, elementRef: any, Widget: any, _pathPart: any) => {
  const form = elementRef.current.closest('.shacl-form')
  pointer.addOut(predicate, Widget.createNewObject(form))
  form.render()
}

export function FieldWrapper ({ Widget, children, structure, uiLanguagePriorities, dataPointer, form }: FieldWrapperProps) {
  const { _shaclPointer, _predicate, _pathPart } = structure

  const name = bestLanguage(_shaclPointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(_shaclPointer.out([sh('description')]), uiLanguagePriorities)

  const fieldData = _pathPart ? dataPointer().execute(_pathPart).trim() : dataPointer()

  const element = useRef<HTMLDivElement>(null)

  if (fieldData.terms.length === 0) {
    const newObject = Widget.createNewObject(form)
    if (newObject.termType !== 'BlankNode') {
      dataPointer().addOut(_predicate, Widget.createNewObject(form))
    }
  }

  const maxCount = _shaclPointer.out([sh('maxCount')]).value

  const items = fieldData.terms.map((term, index) => {
    const cid = JSON.stringify([_pathPart, term]) + index

    return [(
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
    ), term]
  }).filter(([_field, term]) => {
    return !(term as Literal).language || form.activeContentLanguages.includes((term as Literal).language)
  }).map(([field]) => field as JSX.Element)

  return (
    <div ref={element} className={`field`} data-predicate={_predicate?.value}>
      {name ? (<h3>{name}</h3>) : null}

      {description ? (<p dangerouslySetInnerHTML={{__html: description}}></p>) : null}

      <div className='items'>
        {items}
      </div>
      
      {!maxCount || fieldData.terms.length < maxCount ? (
        <button className='btn-add-item' onClick={() => addItem(dataPointer(), _predicate, element, Widget, _pathPart)}>
          Add item
        </button>
      ) : null} 
    </div>
  )
}