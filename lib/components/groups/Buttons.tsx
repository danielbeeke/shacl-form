import { bestLanguage } from '../../helpers/bestLanguage'
import { rdfs, shFrm } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'

export const iri = shFrm('Buttons')

export default function Buttons ({ children, groupPointer, form }: { children: any, groupPointer: GrapoiPointer, form: any }) {
  const name = bestLanguage(groupPointer.out([rdfs('label')]), form.uiLanguagePriorities)
  const machineName = groupPointer.term.value.split('/').pop()

  return (<div className={`group group-buttons ${machineName}`}>
    {name ? (<h3 className='group-header'>{name}</h3>) : null}
    {children ? (<div>{children}</div>) : null}
    <button className='btn btn-lg btn-primary' onClick={() => form.save()}>Save</button>
  </div>)
}