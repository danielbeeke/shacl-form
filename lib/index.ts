import { init } from './core/ShaclForm'
import { Enhancer } from './core/Enhancer'

// Single Widgets
import String from './widgets/single/String'
import BlankNodeOrIri from './widgets/single/BlankNodeOrIri'
import Date from './widgets/single/Date'
import LanguageString from './widgets/single/LanguageString'

// Merged Widgets
import Address from './widgets/merged/Address'

// Groups
import Buttons, { iri as buttonsIri } from './components/groups/Buttons'
import LanguageTabs, { iri as languageTabsIri } from './components/groups/LanguageTabs'
import { DefaultGroup } from './components/groups/DefaultGroup'

// Plugins
import { PositionstackGeocoder } from './plugins/GeoCoder/PositionstackGeocoder'

/** @ts-ignore */
import { init as bcp47PickerInit } from 'bcp47-picker/init'

bcp47PickerInit({ sources: ['https://bcp47.danielbeeke.nl/data/lmt.json']})

init({
  widgets: {
    single: {
      String,
      LanguageString,
      BlankNodeOrIri,
      Date
    },
    merged: {
      Address
    }
  },
  groups: {
    default: DefaultGroup,
    [buttonsIri.value]: Buttons,
    [languageTabsIri.value]: LanguageTabs
  },
  enhancer: Enhancer,
  plugins: {
    geocoder: new PositionstackGeocoder(import.meta.env.POSITIONSTACK)
  }
})