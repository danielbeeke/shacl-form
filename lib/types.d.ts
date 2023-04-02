declare module "*?raw" {
  const content: string;
  export default content;
}

declare module 'shacl-engine';
declare module 'grapoi';

type ShaclPropertes = {
  description?: { [key: string]: string },
  group?: string,
  languageIn?: Array<string>,
  minCount?: number,
  name?: { [key: string]: string },
  order?: number,
  qualifiedMaxCount?: number,
  qualifiedMinCount?: number,
  uniqueLang?: boolean
  path?: string
}