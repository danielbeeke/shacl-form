import { bestLanguage } from '../../helpers/bestLanguage'
import { rdfs, shFrm } from '../../helpers/namespaces'
import { GrapoiPointer } from '../../types'
import { useEffect, useRef, useState } from 'react'
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

  return <>{label ?? ' '}</>
}

export default function LanguageTabs ({ children, form, groupPointer }: { children: any, form: any, groupPointer: GrapoiPointer }) {
  const name = bestLanguage(groupPointer.out([rdfs('label')]), form.uiLanguagePriorities)

  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const machineName = groupPointer?.term?.value.split(/\/|#/g).pop() ?? ''
  const element = useRef<HTMLUListElement>(null)

  let isDown = false
  let startX: number
  let scrollLeft: number
  
  return (
    <div className={`group group-language-tabs ${machineName}`}>
      {name ? (<h1 className='group-header'>{name}</h1>) : null}

      <div className='languages mb-3'>
        <ul className='nav nav-tabs' ref={element} onMouseDown={(e) => {
            isDown = true
            element.current?.classList.add('active')
            startX = e.pageX - (element.current?.offsetLeft ?? 0)
            scrollLeft = element.current?.scrollLeft ?? 0
        }} onMouseLeave={() => {
            isDown = false
            element.current?.classList.remove('active')
        }} onMouseUp={() => {
          isDown = false
          element.current?.classList.remove('active')
        }} onScroll={() => {
          const tabsWrapper = element.current

          if (!tabsWrapper?.scrollWidth) return
          
          tabsWrapper.classList.remove('hide-left-shadow')
          tabsWrapper.classList.remove('hide-right-shadow')
      
          if (tabsWrapper.scrollLeft === 0) {
            tabsWrapper.classList.add('hide-left-shadow')
          }
      
          if (tabsWrapper.scrollWidth - 1 <= tabsWrapper.clientWidth + tabsWrapper.scrollLeft) {
            tabsWrapper.classList.add('hide-right-shadow')
          }
        }} onMouseMove={(e) => {
          if(!isDown) return
          e.preventDefault()
          const x = e.pageX - (element.current?.offsetLeft ?? 0)
          const walk = x - startX
          if (element.current) element.current.scrollLeft = scrollLeft - walk
        }}>
        {form.contentLanguages.map((languageCode: string) => { 
          return (
          <li key={languageCode} className={`nav-item language-tab ${form.activeContentLanguages.includes(languageCode) ? 'active' : ''}`}>
            <span className={`nav-link ${form.activeContentLanguages.includes(languageCode) ? 'active' : ''}`}>
              <span onClick={(event) => {
                form.activeContentLanguages = [languageCode]
                ;(event.target as HTMLElement).scrollIntoView({
                  inline: 'center',
                  behavior: 'smooth',
                  block: 'nearest', 
                })
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
        </ul>
      </div>

      {showLanguagePicker ? (<div className="expanded nav-add-language"><bcp47-picker ref={(element: any) => {
          setTimeout(() => {
            element?.querySelector('.bcp47-search')?.focus()
          })

          element?.addEventListener('change', () => {
            const languageCode = element.value.toLowerCase()
            if (languageCode) {
              form.contentLanguages = [...new Set([...form.contentLanguages, languageCode])]
              form.activeContentLanguages = [languageCode]  
            }
            setShowLanguagePicker(false)
            form.render()
          })
        }} /></div>) : (
          <div className='nav-add-language'>
            <button className='btn btn-secondary btn-sm' onClick={() => setShowLanguagePicker(true)}>
              <Icon icon="fa6-solid:plus" />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Icon icon="ooui:language" style={{ fontSize: 20 }} />
            </button>
          </div>
        )}

      <div>{children}</div>
    </div>
  )
}