import { GrapoiPointer, Literal, ShaclFormType } from "../types"
import { rdf, sh, dash } from '../helpers/namespaces'
import parsePath from 'shacl-engine/lib/parsePath.js'
import { FieldWrapper } from '../new/FieldWrapper'
import { FieldItem } from '../new/FieldItem'

export type FormLevelProps = { 
    form: ShaclFormType,
    shaclPointer: GrapoiPointer,
    dataPointer: GrapoiPointer,
    report: any,
    uiLanguagePriorities: Array<string>
}

export function FormLevel ({ shaclPointer, dataPointer, report, form, uiLanguagePriorities }: FormLevelProps) {
    const shaclProperties = shaclPointer.hasOut([sh('property')]).distinct()

    const normalizedEditors = Object.fromEntries(
        Object.entries(form.options.widgets.single).map(([name, editorOrArray]) => {
            return [name, Array.isArray(editorOrArray) ? editorOrArray : [editorOrArray]]
        })
    )

    const level = []

    for (const shaclProperty of shaclProperties.out([sh('property')])) {
        const shaclPropertyInner = shaclProperty.trim()

        const path = parsePath(shaclPropertyInner.out([sh('path')]))

        if (path) {
            const pointer = dataPointer.executeAll(path)

            const items = []

            const filteredTerms = pointer.terms
                .filter(term => 
                    !(term as Literal).language 
                    || form.activeContentLanguages.includes((term as Literal).language)
                )

            // We will determine per value what widget to load.
            for (const [index, term] of filteredTerms.entries()) {
                const singlePointer = pointer.clone({ ptrs: [pointer.ptrs[index]] })

                // We will determine for the whole field (all values) what widget to load.
                let editorTerm = shaclProperty.out([dash('editor')]).term
                let editorAndOptionsTuple

                if (editorTerm) {
                    editorAndOptionsTuple = Object.values(normalizedEditors)
                        .find(singleEditor => singleEditor[0].iri === editorTerm.value)
                }

                const scores = Object.entries(normalizedEditors)
                    .map(([editorName, singleEditor]) => {
                        let score = singleEditor[0].score ? singleEditor[0].score(shaclProperty, singlePointer) : 0

                        if (singleEditor[0].iri === editorTerm?.value && score > -1) score += 100

                        return [
                            editorName, 
                            score
                        ]
                    })
                    .sort((a, b) => b[1] - a[1])

                const finalWidget = scores[0][0]
                editorAndOptionsTuple = normalizedEditors[finalWidget]

                const errors = report.results.filter((result: any) => result.value.term.equals(term))

                const node: GrapoiPointer = shaclProperty.out([sh('node')])

                const children = node.term ?
                <FormLevel 
                    shaclPointer={node} 
                    dataPointer={singlePointer} 
                    form={form} 
                    key={JSON.stringify([path, term, 'nested'])}
                    report={report} 
                    uiLanguagePriorities={uiLanguagePriorities} 
                /> : null

                items.push(<FieldItem 
                    uiLanguagePriorities={uiLanguagePriorities}
                    widgetMeta={editorAndOptionsTuple[0]}
                    widgetOptions={editorAndOptionsTuple[1]}
                    shaclPointer={shaclPropertyInner}
                    key={JSON.stringify([path, term])}
                    form={form}
                    term={term}
                    errors={errors}
                    dataPointer={singlePointer}
                  >
                    {children}
                </FieldItem>)
            }

            level.push(<FieldWrapper
                uiLanguagePriorities={uiLanguagePriorities}
                shaclPointer={shaclPropertyInner}
                key={JSON.stringify([path, pointer.terms])}
                form={form}
            >{items}</FieldWrapper>)
        }
    }

    return level
}