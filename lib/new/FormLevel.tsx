import { GrapoiPointer, Literal, ShaclFormType, NamedNode } from "../types"
import { rdf, sh, dash, shFrm } from '../helpers/namespaces'
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

    const groups = new Map()

    for (const shaclProperty of shaclProperties.out([sh('property')]).trim()) {
        const path = parsePath(shaclProperty.out([sh('path')]))
        const groupName = shaclProperty.out([sh('group')]).term

        if (groupName && !groups.has(groupName.value)) {
            const groupItems: Array<any> = []
            groups.set(groupName.value, groupItems)
            const groupPointer = shaclPointer.node([groupName])
            const groupTypes = groupPointer.out([rdf('type')]).terms
            let [Group] = groupTypes.map(groupType => form.options.groups[groupType.value]).filter(Boolean)
            if (!Group) Group = form.options.groups.default

            level.push(<Group key={groupName.value} groupPointer={groupPointer} form={form}>
                {groupItems}
            </Group>)
        }

        if (path) {
            const pointer = dataPointer.executeAll(path)
            const items = []

            // If this property has this special property.
            const languageDiscriminator = shaclProperty.out([shFrm('languageDiscriminator')]).term as NamedNode | null

            // If this is the inner language field to be rendered we skip rendering.
            const isLanguageDiscriminatorField = shaclProperty.in().in().out([shFrm('languageDiscriminator')]).term as NamedNode | null
            if (
                isLanguageDiscriminatorField 
                && path[0].predicates[0].equals(isLanguageDiscriminatorField)
            ) continue

            const filteredTerms = pointer.terms
                .filter(term => {
                    const language = languageDiscriminator ? dataPointer.node([term]).out([languageDiscriminator]).value : (term as Literal).language

                    return !language
                    || form.activeContentLanguages.includes(language)
                })

            // We will determine per value what widget to load.
            for (const term of filteredTerms) {
                const singlePointer = pointer.node([term])

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
                        return [editorName, score]
                    })
                    .sort((a, b) => b[1] - a[1])

                const finalWidget = scores[0][0]
                editorAndOptionsTuple = normalizedEditors[finalWidget]

                const errors = report.results.filter((result: any) => result.value.term.equals(term))

                const node: GrapoiPointer = shaclProperty.out([sh('node')])

                // Nested nodes.
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
                    shaclPointer={shaclProperty}
                    key={JSON.stringify([path, term])}
                    form={form}
                    term={term}
                    errors={errors}
                    dataPointer={singlePointer}
                >{children}</FieldItem>)
            }

            const field = languageDiscriminator ? items[0].props.children : <FieldWrapper
                uiLanguagePriorities={uiLanguagePriorities}
                shaclPointer={shaclProperty}
                key={JSON.stringify([path, pointer.terms])}
                form={form}
            >{items}</FieldWrapper>

            if (groupName) {
                const groupItems = groups.get(groupName.value)
                groupItems.push(field)
            }
            else {
                level.push(field)
            }
        }
    }

    return level
}