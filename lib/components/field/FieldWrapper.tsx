import { sh, schema } from '../../helpers/namespaces'
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

// TODO move to element?
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

  const items = fieldData.terms.map((term, index) => {
    const cid = JSON.stringify([_pathPart, term]) + index

    return [(
      <FieldItem 
        key={cid} 
        index={index} 
        structure={structure}
        isHeader={false}
        isFooter={false}
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

  const element = useRef<HTMLDivElement>(null)

  if (items.length === 0) {
    const newObject = Widget.createNewObject(form)
    if (newObject.termType !== 'BlankNode') {
      dataPointer().addOut(_predicate, Widget.createNewObject(form))
    }
  }

  const maxCount = _shaclPointer.out([sh('maxCount')]).value

  let showAdd = !maxCount || fieldData.terms.length < maxCount
  if (Widget.type === 'multi') showAdd = false
  if (Widget.hideAddButton) showAdd = false

  return (
    <div ref={element} className={`field`} data-predicate={_predicate?.value}>
      {name ? (<label className='form-label'>{name}</label>) : null}

      {description ? (<p className='form-text' dangerouslySetInnerHTML={{__html: description}}></p>) : null}

      <FieldItem 
        key={'header'} 
        index={-1} 
        structure={structure}
        isHeader={true}
        isFooter={false}
        uiLanguagePriorities={uiLanguagePriorities}
        dataPointer={dataPointer}
        Widget={Widget}
      >
        {children}
      </FieldItem>

      <div className='items'>
        {items}
      </div>

      <FieldItem 
        key={'footer'} 
        index={-2} 
        structure={structure}
        isHeader={false}
        isFooter={true}
        uiLanguagePriorities={uiLanguagePriorities}
        dataPointer={dataPointer}
        Widget={Widget}
      >
        {children}
      </FieldItem>

      {showAdd ? (
        <button className='btn btn-secondary btn-sm btn-add-item ms-auto' onClick={() => addItem(dataPointer(), _predicate, element, Widget, _pathPart)}>
          Add item
        </button>
      ) : null} 
    </div>
  )
}