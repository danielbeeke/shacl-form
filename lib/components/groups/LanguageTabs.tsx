import { bestLanguage } from '../../helpers/bestLanguage'
import { rdfs, shFrm } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { useState } from 'react'

export const iri = shFrm('LanguageTabs')

export default function LanguageTabs ({ children, form, groupPointer }: { children: any, form: any, groupPointer: GrapoiPointer }) {
  const name = bestLanguage(groupPointer.out([rdfs('label')]), form.uiLanguagePriorities)

  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [languagePicker, setLanguagePicker] = useState(false)
  const machineName = groupPointer.term.value.split('/').pop()

  return (
    <div className={`group group-language-tabs ${machineName}`}>
      <bcp47-picker style={{'display': 'none'}} ref={(languagePicker: any) => setLanguagePicker(languagePicker)} />

      {name ? (<h1 className='group-header'>{name}</h1>) : null}

      <ul className='languages nav nav-tabs mb-5'>
        {form.contentLanguages.map((languageCode: string) => (
          <li key={languageCode} className={`nav-item language-tab`}>
            <span className={`nav-link ${form.activeContentLanguages.includes(languageCode) ? 'active' : ''}`}>
              <span onClick={() => {
                form.activeContentLanguages = [languageCode]
              }}>
                {languagePicker.label ? languagePicker.label(languageCode) ?? languageCode : languageCode}
              </span>

              {form.contentLanguages.length > 1 ? <button className='btn-remove-language' onClick={() => {
                const dataset = form.dataPointer.ptrs[0].dataset
                for (const quad of dataset) {
                  if (quad.object.language === languageCode)
                    dataset.delete(quad)
                }

                form.contentLanguages = form.contentLanguages.filter((language: string) => language !== languageCode)
                form.activeContentLanguages = [form.contentLanguages[0]]

                form.render()
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button> : null}
            </span>
          </li>
        ))}

        {showLanguagePicker ? (<li className="ms-auto nav-add-language"><bcp47-picker ref={(element: any) => element?.addEventListener('change', () => {
          const languageCode = element.value.toLowerCase()
          if (languageCode) {
            form.contentLanguages = [...new Set([...form.contentLanguages, languageCode])]
            form.activeContentLanguages = [languageCode]  
          }
          setShowLanguagePicker(false)
          form.render()
        })} /></li>) : (
          <li className='nav-item ms-auto'>
            <button className='btn btn-secondary btn-sm' onClick={() => setShowLanguagePicker(true)}>
              Add language
            </button>
          </li>
        )}

      </ul>

      <div>{children}</div>
    </div>
  )
}