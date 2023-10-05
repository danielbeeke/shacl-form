import { GrapoiPointer, Literal, ShaclFormType, NamedNode, Term } from "../types"
import { rdf, sh, dash, shFrm } from '../helpers/namespaces'
import parsePath from 'shacl-engine/lib/parsePath.js'
import { FieldWrapper } from '../new/FieldWrapper'
import { FieldItem } from '../new/FieldItem'
import { setValue } from "./setValue"
import { addCallback } from "./addCallback"
import factory from 'rdf-ext'

export type FormLevelProps = { 
    form: ShaclFormType,
    shaclPointer: GrapoiPointer,
    dataPointer: GrapoiPointer,
    report: any,
    uiLanguagePriorities: Array<string>
}

type DetermineWidgetProps = {
    form: ShaclFormType, 
    shaclPointer: GrapoiPointer, 
    dataPointer: GrapoiPointer
}

const determineWidget = ({ form, shaclPointer, dataPointer }: DetermineWidgetProps) => {
    const normalizedEditors = Object.fromEntries(
        Object.entries(form.options.widgets.single).map(([name, editorOrArray]) => {
            return [name, Array.isArray(editorOrArray) ? editorOrArray : [editorOrArray]]
        })
    )

    // We will determine for the whole field (all values) what widget to load.
    let editorTerm = shaclPointer.out([dash('editor')]).term

    const scores = Object.entries(normalizedEditors)
        .map(([editorName, singleEditor]) => {
            let score = singleEditor[0].score ? singleEditor[0].score(shaclPointer, dataPointer) : 0
            if (singleEditor[0].iri === editorTerm?.value && score > -1) score += 100
            return [editorName, score]
        })
        .sort((a, b) => b[1] - a[1])

    const finalWidget = scores[0][0]
    return {
        Widget: normalizedEditors[finalWidget],
        scores
    }
}

export function FormLevel ({ shaclPointer, dataPointer, report, form, uiLanguagePriorities }: FormLevelProps) {
    const shaclProperties = shaclPointer.hasOut([sh('property')]).distinct()
    const level = []
    const groups = new Map()

    for (const shaclProperty of shaclProperties.out([sh('property')])) {
        const path = parsePath(shaclProperty.out([sh('path')]))
        const groupName = shaclProperty.out([sh('group')]).term
        const node: GrapoiPointer = shaclProperty.out([sh('node')])
        const isOrderedList = !!node.term?.equals(dash('ListShape'))

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
            let pointer = dataPointer.executeAll(path)
            const items = []

            const { Widget: fieldWrapperWidgetTuple, scores: WrapperScores } = determineWidget({ form, shaclPointer: shaclProperty, dataPointer: pointer })

            // If this property has this special property.
            const languageDiscriminator = shaclProperty.out([shFrm('languageDiscriminator')]).term as NamedNode | null
            // If this is the inner language field to be rendered we skip rendering.
            const isLanguageDiscriminatorField = shaclProperty.in().in().out([shFrm('languageDiscriminator')]).term as NamedNode | null
            if (
                isLanguageDiscriminatorField 
                && path[0].predicates[0].equals(isLanguageDiscriminatorField)
            ) continue

            const getFilteredPointers = () => {
                pointer = dataPointer.executeAll(path)

                return pointer.filter(pointer => {
                    const language = languageDiscriminator ? dataPointer.node([pointer.term]).out([languageDiscriminator]).value : (pointer.term as Literal).language
                    return !language || form.activeContentLanguages.includes(language)
                })
            }

            let filteredPointers = getFilteredPointers()

            if (!filteredPointers.ptrs.length) {
                const pathCopy = [...path]
                const lastPathPart = Object.assign({}, pathCopy.at(-1))
                const object = fieldWrapperWidgetTuple[0].createNewObject(form, shaclProperty)
                pathCopy.pop()
                pathCopy.push(Object.assign(lastPathPart, {
                    operation: 'add',
                    graphs: [factory.defaultGraph()],
                    objects: [object]
                }))

                pointer = dataPointer.executeAll(pathCopy)
                filteredPointers = getFilteredPointers()
            }

            // We will determine per value what widget to load.
            for (const filteredPointer of filteredPointers) {
                const { Widget: editorAndOptionsTuple, scores: fieldScores } = determineWidget({ form, shaclPointer: shaclProperty, dataPointer: filteredPointer })
                const errors = report.results.filter((result: any) => result.value.term.equals(filteredPointer.term))

                const children: Array<any> = []

                // Nested nodes.
                if (node.term && node.hasOut([sh('property')]).distinct().terms.length) {
                    children.push(<FormLevel 
                        shaclPointer={node} 
                        dataPointer={filteredPointer} 
                        form={form} 
                        key={JSON.stringify([path, filteredPointer.term, 'nested-node'])}
                        report={report} 
                        uiLanguagePriorities={uiLanguagePriorities} 
                    />)
                }

                const subProperties = shaclProperty.hasOut([sh('property')]).distinct()

                if (subProperties.terms.length) {
                    children.push(<FormLevel 
                        shaclPointer={subProperties} 
                        dataPointer={filteredPointer} 
                        form={form} 
                        key={JSON.stringify([path, filteredPointer.term, 'nested-properties'])}
                        report={report} 
                        uiLanguagePriorities={uiLanguagePriorities} 
                    />)
                }

                if (isOrderedList || languageDiscriminator) {
                    items.push(...children)
                }
                else {
                    items.push(<FieldItem 
                        uiLanguagePriorities={uiLanguagePriorities}
                        widgetMeta={editorAndOptionsTuple[0]}
                        widgetOptions={editorAndOptionsTuple[1]}
                        shaclPointer={shaclProperty}
                        scores={fieldScores}
                        key={JSON.stringify([path])}
                        form={form}
                        setValue={(term: Term) => setValue(form, filteredPointer.term, term, filteredPointer)}
                        term={filteredPointer.term}
                        errors={errors}
                        dataPointer={filteredPointer}
                        parentDataPointer={dataPointer}
                    >{children}</FieldItem>)    
                }
            }

            const field = languageDiscriminator || isOrderedList ? items : <FieldWrapper
                uiLanguagePriorities={uiLanguagePriorities}
                shaclPointer={shaclProperty}
                dataPointer={dataPointer}
                scores={WrapperScores}
                addCallback={() => {
                    addCallback(
                        form, 
                        shaclProperty, 
                        dataPointer, 
                        fieldWrapperWidgetTuple[0].createNewObject
                    )

                    form.render()
                }}
                key={JSON.stringify([path, pointer.terms])}
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