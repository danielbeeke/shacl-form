# SHACL Form

SHACL form is a frontend library that shows forms from a SHACL shape.
It uses customElements, also for the widgets, this will enable a third party developer to bring their own widgets that might be made with any other technology as long as it is exported as a customElement.

### Future usage

HTML attributes on the customElement:

- __subject__   - Useful when creating data. It will set the subject to this uri. It is possible to rename the subject when using the form.
- __shacl-url__ - The place where the SHACL turtle is stored, it should allow CORS.
- __shape-uri__ - Set this attribute if you have multiple shapes in your shape turtle file and do not want to use the first shape.

```html
<shacl-form shacl-url="YOUR_SHACL_TTL"></shacl-form>
```

### Priorities

- Decouple the widget algorythm from the FieldLevel component. The algo should run on the SHACL and set the dash:viewer.

### Ideas

- Use IRIs as object for sh:group to create a special widget / group such as the language tabs and the subject iri widget.
- Allow invalid data and a way to recover so invalid data can be reshaped to valid data
- Allow form buttons (agent has to click to update) or binding to triple change events (instant update)
- Create a preprocess hook that filters the GrapoiPointer contextually so that we can have language tabs.

### Questions

- Can Hydra be used to rename a subject?
- Would it be wise to include or exclude Hydra? (couple or decouple)

### Interesting links

- The browser does not support namespacing customElements: https://github.com/WICG/webcomponents/issues/488

#### Documents of UGent

- https://docs.google.com/document/d/1hOTMH9mhzSjVzCK0HL5f_B8GHie9PcsXqYAFxr-nPNM/edit#heading=h.4ikvkr55u1o1
- https://docs.google.com/document/d/1U1fHwFZUKjjIRG7gxsJrBNMHXkEs7pR2e3IkeK7qh5U/edit#heading=h.4ikvkr55u1o1
