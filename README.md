# SHACL Form

SHACL form is a frontend library that shows forms from a SHACL shape.
It uses customElements, also for the widgets, this will enable a third party developer to bring their own widgets that might be made with any other technology as long as it is exported as a customElement.

## Progress

This library is in development

## Screenshot

![Screenshot of SHACL-form](/demo/shacl-form.png)

## Usage

HTML attributes on the customElement:

- __subject__   - Useful when creating data. It will set the subject to this uri. It is possible to rename the subject when using the form.
- __shacl-url__ - The place where the SHACL turtle is stored, it should allow CORS.
- __shape-uri__ - Set this attribute if you have multiple shapes in your shape turtle file and do not want to use the first shape.

```html
<shacl-form shacl-url="YOUR_SHACL_TTL"></shacl-form>
```
