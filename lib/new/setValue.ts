import { ShaclFormType, Term, GrapoiPointer } from "../types"

export const setValue = (form: ShaclFormType, oldValue: Term, newValue: Term, pointer: GrapoiPointer) => {
    const [quad] = [...pointer.quads()]

    form.store.removeQuad(quad)
    form.store.addQuad({
        subject: quad.subject,
        predicate: quad.predicate,
        object: newValue,
    })

    form.render()
}
