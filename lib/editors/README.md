To implement a widget you need to extend ShaclFormEditor in the following way:

```TypeScript
export default class YourWidgetName extends ShaclFormEditor<typeof YourWidgetName> {

  static score(shaclPointer: GrapoiPointer): number {
    return scorer(shaclPointer)
      .datatypes([xsd('langString'), xsd('string')])
      .toNumber()
  }

  static createNewObject () {
    return factory.literal('')
  }

}

```