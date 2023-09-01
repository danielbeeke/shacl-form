import { sh, shFrm, rdf } from '../../helpers/namespaces'
import { bestLanguage } from '../../helpers/bestLanguage'
import { FieldItem } from './FieldItem'
import { GrapoiPointer, Widget, NamedNode, Literal, Term } from '../../types'
import { useRef } from 'react'
import { ReactSortable } from "react-sortablejs";
import { replaceList } from '../../helpers/replaceList'
import factory from 'rdf-ext'
import { Icon } from '@iconify-icon/react';
import { useState, useEffect } from 'react'

type FieldWrapperProps = { 
  Widget: any, 
  children: any, 
  structure: Widget, 
  errors: any,
  isOrderedList: boolean,
  uiLanguagePriorities: Array<string>,
  dataPointer: () => GrapoiPointer,
  form: any
}

// TODO move to element?
const addItem = (pointer: GrapoiPointer, predicate: NamedNode, elementRef: any, Widget: any, _pathPart: any, isList: boolean, setSortableState: any, shaclPointer: GrapoiPointer) => {
  const form = elementRef.current.closest('.shacl-form')

  if (isList) {
    const newValues = [...pointer.out([predicate]).list()].map(part => part.term)
    newValues.push(Widget.createNewObject(form, shaclPointer))
    replaceList(newValues, pointer.out([predicate]))
    const newSortableState = newValues.map((term: Term) => ({ id: JSON.stringify(term), term }))
    setSortableState(newSortableState)
  }
  else {
    pointer.addOut(predicate, Widget.createNewObject(form, shaclPointer))
  }
  
  form.render()
}

type ErrorProp = {
  errors: {
    errors: Array<string>, 
    infos: Array<string>, 
    warnings: Array<string>
  }
}

export function Errors (props: ErrorProp) {
  if (!props.errors) return null
  const { errors: { errors, infos, warnings } } = props

  return <>
    {errors.length ? errors.map(error => <div key={error} className='alert alert-danger'>{error}</div>) : null}
    {infos.length ? infos.map(info => <div key={info} className='alert alert-info'>{info}</div>) : null}
    {warnings.length ? warnings.map(warning => <div key={warning} className='alert alert-warning'>{warning}</div>) : null}
  </>
}

export const orderCache: Map<string, Array<string>> = new Map()

export function FieldWrapper ({ Widget, isOrderedList, children, structure, errors, uiLanguagePriorities, dataPointer, form }: FieldWrapperProps) {
  const { _shaclPointer, _predicate, _pathPart } = structure
  const [WidgetClass, setWidgetClass] = useState<any>(null)
  const languageDiscriminator = _shaclPointer.out([shFrm('languageDiscriminator')]).term as NamedNode | null
  const path = JSON.stringify(_pathPart)
  const maxCount = _shaclPointer.out([sh('maxCount')]).value
  const uniqueLang = _shaclPointer.out([sh('uniqueLang')]).value
  const isMultiLingual = _shaclPointer.out([sh('datatype')]).terms.some(term => term.equals(rdf('langString')))

  useEffect(() => {
    Widget.resolve().then(({ default: WidgetClass }: { default: any }) => setWidgetClass(() => WidgetClass))
  }, [])

  const getTerms = () => {
    return isOrderedList 
    ? [...dataPointer().execute(_pathPart)?.list() ?? []]?.map(part => part.term)
    : (_pathPart ? dataPointer().execute(_pathPart).trim() : dataPointer()).terms
  }

  const sortableState = getTerms().map((term: Term) => ({ id: JSON.stringify(term), term }))
  const serializedTerms = getTerms().map(term => JSON.stringify(term))

  if (!isOrderedList) {
    // Because standard RDF is unordered we need to simulate order.
    // Create the initial order
    if (!orderCache.has(path)) {
      orderCache.set(path, serializedTerms)
    }

    // Update the order
    else {
      const existingOrder = orderCache.get(path)!
      for (const term of serializedTerms) {
        if (!existingOrder.includes(term)) existingOrder.push(term)
      }

      const emptyRowContents = '{"termType":"DefaultGraph","value":""}'
      const emptyRowIndex = existingOrder.indexOf(emptyRowContents)
      // Empty rows must be at the end
      if (emptyRowIndex !== -1) {
        existingOrder.splice(emptyRowIndex, 1)
        existingOrder.push('{"termType":"DefaultGraph","value":""}')
      }

      // Removals
      const newOrder = []
      for (const existingOrderItem of existingOrder) {
        if (serializedTerms.includes(existingOrderItem)) {
          newOrder.push(existingOrderItem)
        }
      }
      orderCache.set(path, newOrder)
    }
  }

  const getActiveTerms = () => {
    return getTerms().filter(term => {
      const language = languageDiscriminator ? dataPointer().node([term]).out([languageDiscriminator]).value : (term as Literal).language
      return !language || form.activeContentLanguages.includes(language)
    }).sort((a, b) => {
      if (isOrderedList) {
        const aTermSerialized = JSON.stringify(a)
        const aTerm = sortableState.find(sortableItem => sortableItem.id === aTermSerialized)
        const aIndex = aTerm ? sortableState.indexOf(aTerm) : 1000

        const bTermSerialized = JSON.stringify(b)
        const bTerm = sortableState.find(sortableItem => sortableItem.id === bTermSerialized)
        const bIndex = bTerm ? sortableState.indexOf(bTerm) : 1000

        return aIndex - bIndex  
      }
      else {
        const aTerm = JSON.stringify(a)
        const bTerm = JSON.stringify(b)
        const aIndex = orderCache.get(path)!.indexOf(aTerm) ?? 10000
        const bIndex = orderCache.get(path)!.indexOf(bTerm) ?? 10000
  
        return aIndex - bIndex  
      }
    })
  }

  // TODO move this logic to shaclTree so that adding new nested value do not trigger an invalid state.
  if (getActiveTerms().length === 0) {
    const newObject = Widget.createNewObject(form, _shaclPointer)

    if (isOrderedList) {
      const blankNode = factory.blankNode()
      dataPointer().addOut([_predicate], [blankNode])
      const pointer = dataPointer().node([blankNode])

      replaceList([newObject], pointer)
    }
    else {
      dataPointer().addOut(_predicate, newObject)
    }
  }

  const name = bestLanguage(_shaclPointer.out([sh('name')]), uiLanguagePriorities)
  const description = bestLanguage(_shaclPointer.out([sh('description')]), uiLanguagePriorities)

  const setSortableState = (newState: any) => {
    const oldStateSerialized = getTerms().map(term => JSON.stringify(term)).join('')
    const newStateSerialized = newState.map((item: any) => JSON.stringify(item.term)).join('')

    if (oldStateSerialized !== newStateSerialized) {
      const pointer: GrapoiPointer = dataPointer().execute(_pathPart)
      replaceList(newState.map((item: any) => item.term), pointer)
      form.render()
    }
  }

  
  const allTerms = getTerms()
  const renderedItemsIndexed = getActiveTerms()
  .map((term) => {
    const matchedTerm = allTerms.find(innerTerm => term.equals(innerTerm))
    const index = allTerms.indexOf(matchedTerm!)
    const cid = JSON.stringify([_pathPart, term, index])

    return [(
      <FieldItem 
        key={cid}
        index={index} 
        structure={structure}
        isList={isOrderedList}
        uiLanguagePriorities={uiLanguagePriorities}
        dataPointer={dataPointer}
        Widget={WidgetClass}
      >
        {children}
      </FieldItem>
    ), term]
  })
  
  const renderedItems = renderedItemsIndexed.map(([field]) => field as JSX.Element)
  const element = useRef<HTMLDivElement>(null)

  let showAdd = !maxCount || getTerms().length < maxCount

  if (WidgetClass?.type === 'multi') showAdd = false
  if (WidgetClass?.hideAddButton) showAdd = false
  if ((renderedItemsIndexed[renderedItemsIndexed.length - 1]?.[1] as Term)?.value === '') showAdd  = false
  if (uniqueLang) showAdd = false

  const formSaveHasBeenTouched = form.touchedSave

  if (!formSaveHasBeenTouched && errors) {
    errors.errors = errors.errors.filter((message: string) => !message.startsWith('Less than'))
  }

  return WidgetClass ? (
    <div ref={element} className={`field ${languageDiscriminator ? 'is-language-discriminator': ''}`} data-predicate={_predicate?.value}>
      {name ? (<label className='form-label'>
        {name}
        {languageDiscriminator || isMultiLingual || (getActiveTerms()[0] as any).language
         ? <em className='ms-2' style={{ fontWeight: 100, fontSize: '.9em', opacity: .6 }}>Language specific<Icon className='ms-2' style={{ position: 'relative', top: 3}} icon="ooui:language" /></em>
          : null}
      </label>) : null}

      {description ? (<p className='form-text' dangerouslySetInnerHTML={{__html: description}}></p>) : null}

      <Errors errors={errors} />

      <div className="field-inner">

        <FieldItem 
          key={'header'} 
          index={-1} 
          structure={structure}
          isHeader={true}
          uiLanguagePriorities={uiLanguagePriorities}
          dataPointer={dataPointer}
          Widget={WidgetClass}
        >
          {undefined}
        </FieldItem>

        <div className='items'>
          {isOrderedList ? <ReactSortable filter="input,.list-group,.form-control" preventOnFilter={false} list={sortableState} setList={setSortableState}>
            {renderedItems}
          </ReactSortable> : renderedItems}
        </div>

        <FieldItem 
          key={'footer'} 
          index={-2} 
          structure={structure}
          isFooter={true}
          uiLanguagePriorities={uiLanguagePriorities}
          dataPointer={dataPointer}
          Widget={WidgetClass}
        >
          {undefined}
        </FieldItem>

        {showAdd ? (
          <button type="button" className='btn btn-secondary btn-sm btn-add-item me-auto mb-2' onClick={() => addItem(dataPointer(), _predicate, element, Widget, _pathPart, isOrderedList, setSortableState, _shaclPointer)}>
            <Icon icon="fa6-solid:plus" />
          </button>
        ) : null} 

      </div>
    </div>
  ) : null
}