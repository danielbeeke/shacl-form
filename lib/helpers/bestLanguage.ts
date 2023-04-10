import language from '@rdfjs/score/language.js'

export const bestLanguage = (pointer: any, languagePriorities: Array<string>) => {
  const languageScorer = language(languagePriorities)
  const terms = pointer.terms.filter(Boolean)
  if (!terms.length) return ''

  const score = languageScorer(pointer)
  
  /** @ts-ignore */
  return score[0].term?.value 
}
