import { bestLanguage } from '../../helpers/bestLanguage'
import { rdfs, shFrm } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { useState } from 'react'

export const iri = shFrm('LanguageTabs')

export default function LanguageTabs ({ children, form, groupPointer }: { children: any, form: any, groupPointer: GrapoiPointer }) {
  const name = bestLanguage(groupPointer.out([rdfs('label')]), form.uiLanguagePriorities)

  const [showLanguagePicker, setShowLanguagePicker] = useState(false)

  return (
    <div className='group group-language-tabs'>
      {name ? (<h1 className='group-header'>{name}</h1>) : null}

      <div className='languages'>
        {form.contentLanguages.map((languageCode: string) => (
          <div key={languageCode} className={`language-tab ${form.activeContentLanguages.includes(languageCode) ? 'active' : ''}`}>
            <button onClick={() => {
              form.activeContentLanguages = [languageCode]
            }}>
              {languageCode}
            </button>
            <button onClick={() => {
              const dataset = form.dataPointer.ptrs[0].dataset
              for (const quad of dataset) {
                if (quad.object.language === languageCode)
                  dataset.delete(quad)
              }

              form.contentLanguages = form.contentLanguages.filter((language: string) => language !== languageCode)
              form.activeContentLanguages = [form.contentLanguages[0]]

              form.render()
            }}>x</button>
          </div>
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