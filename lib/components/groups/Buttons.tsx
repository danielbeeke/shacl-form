import { bestLanguage } from '../../helpers/bestLanguage'
import { rdfs, shFrm } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { Writer } from 'n3'

export const iri = shFrm('Buttons')

export default function Buttons ({ children, groupPointer, form }: { children: any, groupPointer: GrapoiPointer, form: any }) {
  const name = bestLanguage(groupPointer.out([rdfs('label')]), form.uiLanguagePriorities)

  return (<div className='group group-buttons'>
    {name ? (<h3 className='group-header'>{name}</h3>) : null}
    {children ? (<div>{children}</div>) : null}

    <button onClick={() => {
        const store = form.store
        const lists = store.extractLists({ remove: true });
        const writer = new Writer({ lists })
        for (const quad of store) {
          // We simply skip empty items.
          if (quad.object.value) writer.addQuad(quad)
        }
        writer.end((error, result) => console.log(result))
      }}>Print turtle into console</button>

  </div>)
}