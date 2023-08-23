import { bestLanguage } from '../../helpers/bestLanguage'
import { rdfs } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'

export function DefaultGroup ({ children, groupPointer, form }: { children: any, groupPointer: GrapoiPointer, form: any }) {
  const name = bestLanguage(groupPointer.out([rdfs('label')]), form.uiLanguagePriorities)
  const machineName = groupPointer.term?.value.split(/\/|#/g).pop() ?? ''

  return (<div className={`group ${machineName}`}>
    {name ? (<h3 className='group-header'>{name}</h3>) : null}
    <div className='group-inner'>{children}</div>
  </div>)
}