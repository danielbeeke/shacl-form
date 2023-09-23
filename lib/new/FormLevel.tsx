import { GrapoiPointer, ShaclFormType } from "../types"
import { rdf, sh, dash } from '../helpers/namespaces'
import parsePath from 'shacl-engine/lib/parsePath.js'
import { FieldWrapper } from '../new/FieldWrapper'

export type FormLevelProps = { 
    form: ShaclFormType,
    shaclPointer: GrapoiPointer,
    dataPointer: GrapoiPointer,
    report: any,
    uiLanguagePriorities: Array<string>
}

export function FormLevel ({ shaclPointer, dataPointer, report, form, uiLanguagePriorities }: FormLevelProps) {
    const shaclShapes = shaclPointer.hasOut([rdf('type')], [sh('NodeShape')])
    const shaclProperties = shaclShapes.hasOut([sh('property')]).distinct()

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

            // We will determine for the whole field (all values) what widget to load.
            let editorTerm = shaclProperty.out([dash('editor')]).term
            let editorAndOptionsTuple

            if (editorTerm) {
                editorAndOptionsTuple = Object.values(normalizedEditors)
                    .find(singleEditor => singleEditor[0].iri === editorTerm.value)
            }

            // We will determine per value what widget to load.
            for (const [index, term] of pointer.terms.entries()) {
                if (!editorAndOptionsTuple) {
                    const singlePointer = pointer.clone({ ptrs: [pointer.ptrs[index]] })
                    const scores = Object.entries(normalizedEditors)
                        .map(([editorName, singleEditor]) => [editorName, singleEditor[0].score ? singleEditor[0].score(shaclProperty, singlePointer) : 0])
                        .sort((a, b) => b[1] - a[1])
                    const finalWidget = scores[0][0]
                    editorAndOptionsTuple = normalizedEditors[finalWidget]
                }

                const errors = report.results.filter((result: any) => result.value.term.equals(term))

                // Widget, isOrderedList, children, structure, errors, uiLanguagePriorities, dataPointer, form

                level.push(<FieldWrapper 
                    uiLanguagePriorities={uiLanguagePriorities}
                    widgetClass={editorAndOptionsTuple[0]}
                    widgetOptions={editorAndOptionsTuple[1]}
                    shaclPointer={shaclPropertyInner.distinct()}
                    isOrderedList={false}
                    key={JSON.stringify([path, index])}
                    form={form}
                    errors={errors}
                    dataPointer={() => dataPointer}
                  >
                  </FieldWrapper>)
            }
        }
    }

    return level
}