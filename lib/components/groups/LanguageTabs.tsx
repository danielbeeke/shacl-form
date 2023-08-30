import { bestLanguage } from '../../helpers/bestLanguage'
import { rdfs, shFrm } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { useEffect, useState } from 'react'
import { Icon } from '@iconify-icon/react'

declare global {
  interface Window {
    languageLabeler: any
  }
}

export const iri = shFrm('LanguageTabs')

function LanguageLabel ({ languageCode }: { languageCode: string }) {
  const [label, setLabel] = useState(null)

  useEffect(() => {
    if (!window.languageLabeler)
      window.languageLabeler = document.createElement('bcp47-picker')

    if (window.languageLabeler?.getLabel) 
      window.languageLabeler?.getLabel(languageCode).then(setLabel)
  })

  return <>
    {label ?? ' '}
  </>
}

export default function LanguageTabs ({ children, form, groupPointer }: { children: any, form: any, groupPointer: GrapoiPointer }) {
  const name = bestLanguage(groupPointer.out([rdfs('label')]), form.uiLanguagePriorities)

  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const machineName = groupPointer?.term?.value.split(/\/|#/g).pop() ?? ''

  return (
    <div className={`group group-language-tabs ${machineName}`}>
      {name ? (<h1 className='group-header'>{name}</h1>) : null}

      <ul className='languages nav nav-tabs mb-3'>
        {form.contentLanguages.map((languageCode: string) => { 
          return (
          <li key={languageCode} className={`nav-item language-tab`}>
            <span className={`nav-link ${form.activeContentLanguages.includes(languageCode) ? 'active' : ''}`}>
              <span onClick={() => {
                form.activeContentLanguages = [languageCode]
              }}>
                <LanguageLabel languageCode={languageCode} />
              </span>

              {form.contentLanguages.length > 1 ? <button className='btn-remove-language' onClick={() => {
                form.removeLanguage(languageCode)
              }}>
                <Icon style={{ fontSize: 12 }} icon="fa6-solid:xmark" />
              </button> : null}
            </span>
          </li>
        )})}

        {showLanguagePicker ? (<li className="ms-auto nav-add-language"><bcp47-picker ref={(element: any) => element?.addEventListener('change', () => {
          const languageCode = element.value.toLowerCase()
          if (languageCode) {
            form.contentLanguages = [...new Set([...form.contentLanguages, languageCode])]
            form.activeContentLanguages = [languageCode]  
          }
          setShowLanguagePicker(false)
          form.render()
        })} /></li>) : (
          <li className='nav-item ms-auto nav-add-language'>
            <button className='btn btn-secondary btn-sm' onClick={() => setShowLanguagePicker(true)}>
              <Icon icon="fa6-solid:plus" />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Icon icon="ooui:language" style={{ fontSize: 20 }} />
            </button>
          </li>
        )}

      </ul>

      <div>{children}</div>
    </div>
  )
}