# SHACL Form

SHACL form is a frontend library to show forms that conform to a SHACL shape.
It will be based on customElements, also for the widgets, this will enable a third party developer to bring their own widgets that might be made with any other technology as long as it is exported as a customElement.

### Priorities

- Get a proof of concept for:
  - The nested rendering including:
    - SHACL Property path: ( ex:parent ex:firstName )
    - SHACL Property path: [ sh:alternativePath ( ex:father ex:mother  ) ]

### Interesting links

- The browser does not support namespacing customElements: https://github.com/WICG/webcomponents/issues/488
