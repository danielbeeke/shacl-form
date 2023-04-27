import language from '@rdfjs/score/language.js'

/**
 * Given a set of ordered BCP47 language codes, returns the best value of a Grapoi pointer.
 */
export const bestLanguage = (pointer: any, languagePriorities: Array<string>) => {
  const languageScorer = language(languagePriorities)
  const terms = pointer.terms.filter(Boolean)
  if (!terms.length) return ''

  const score = languageScorer(pointer)
  
  /** @ts-ignore */
  return score[0].term?.value 
}
