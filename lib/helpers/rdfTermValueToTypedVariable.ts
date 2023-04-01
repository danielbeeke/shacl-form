export const rdfTermValueToTypedVariable = (value: any) => {
  if (value.datatypeString === 'http://www.w3.org/2001/XMLSchema#boolean') return value.value === 'true'
  if (value.datatypeString === 'http://www.w3.org/2001/XMLSchema#date') return new Date(value.value)
  if (value.datatypeString === 'http://www.w3.org/2001/XMLSchema#integer') return parseInt(value.value)
  if (value.datatypeString === 'http://www.w3.org/2001/XMLSchema#string') return value.value
  if (value.datatypeString === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') return value.value
  if (value.termType === 'literal') return value.value
  if (value.termType === 'uri') return value.value
  return value.value
}
