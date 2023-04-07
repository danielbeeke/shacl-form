import language from '@rdfjs/score/language.js'

export const bestLanguage = (pointer: any, languagePriorities: Array<string>) => {
  const languageScorer = language(languagePriorities)
  const score = languageScorer(pointer)
  
  /** @ts-ignore */
  return score[0].term?.value 
}
