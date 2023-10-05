import { ShaclFormType, Term, GrapoiPointer } from "../types"
import { sh, dash } from "../helpers/namespaces"
import parsePath from 'shacl-engine/lib/parsePath.js'
import { replaceList } from "../helpers/replaceList"

// Add item callback.
export const addCallback = (form: ShaclFormType, shaclPointer: GrapoiPointer, dataPointer: GrapoiPointer, createNewObject: any) => {
    const parentNode: GrapoiPointer = shaclPointer.in().out([sh('node')])
    const isOrderedList = !!parentNode.term?.equals(dash('ListShape'))

    if (isOrderedList) {
        const path = parsePath(shaclPointer.in().out([sh('path')]))
        const predicate = path[0].predicates[0]
        const newValues = [...dataPointer.in().out([predicate]).list()].map(part => part.term)
        newValues.push(createNewObject(form, shaclPointer))
        replaceList(newValues, dataPointer.in().out([predicate]))
    }
    else {
        const path = parsePath(shaclPointer.out([sh('path')]))
        const predicate = path[0].predicates[0]
        dataPointer.addOut(predicate, createNewObject(form, shaclPointer))
    }
}
