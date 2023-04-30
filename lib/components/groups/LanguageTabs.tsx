import { bestLanguage } from '../../helpers/bestLanguage'
import { rdfs, shFrm } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
/** @ts-ignore */
import { init } from 'bcp47-picker/init'
import { useState } from 'react'

init({ sources: ['https://bcp47.danielbeeke.nl/data/lmt.json']})

export const iri = shFrm('LanguageTabs')

export default function LanguageTabs ({ children, form, groupPointer }: { children: any, form: any, groupPointer: GrapoiPointer }) {
  const name = bestLanguage(groupPointer.out([rdfs('label')]), form.uiLanguagePriorities)

  const [showLanguagePicker, setShowLanguagePicker] = useState(false)

  return (
    <div>
      {name ? (<h1 className='group-header'>{name}</h1>) : null}

      <div className='languages'>
        {form.contentLanguages.map((languageCode: string) => (
          <button onClick={() => {
            form.activeContentLanguages = [languageCode]
          }} key={languageCode} className={`language-tab ${form.activeContentLanguages.includes(languageCode) ? 'active' : ''}`}>
            {languageCode}
          </button>
        ))}

        {showLanguagePicker ? (<bcp47-picker ref={(element: any) => element?.addEventListener('change', () => {
          const languageCode = element.value.toLowerCase()
          form.contentLanguages = [...form.contentLanguages, languageCode]
          form.activeContentLanguages = [languageCode]
          setShowLanguagePicker(false)
          form.render()

        })} />) : (
          <button onClick={() => setShowLanguagePicker(true)}>
            Add language
          </button>
        )}

      </div>

      <div>{children}</div>
    </div>
  )
}