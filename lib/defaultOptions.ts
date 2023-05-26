import { Enhancer } from './core/Enhancer'

// Single Widgets
import String from './editors/single/String'
import BlankNodeOrIri from './editors/single/BlankNodeOrIri'
import Date from './editors/single/Date'
import LanguageString from './editors/single/LanguageString'
import createFileUpload from './editors/single/FileUpload'

// Merged Widgets
import Address from './editors/merged/Address'

// Groups
import Buttons, { iri as buttonsIri } from './components/groups/Buttons'
import LanguageTabs, { iri as languageTabsIri } from './components/groups/LanguageTabs'
import { DefaultGroup } from './components/groups/DefaultGroup'

// Plugins
import { PositionstackGeocoder } from './plugins/GeoCoder/PositionstackGeocoder'

/** @ts-ignore */
import { init as bcp47PickerInit } from 'bcp47-picker/init'

bcp47PickerInit({ sources: ['https://bcp47.danielbeeke.nl/data/lmt.json']})

export default {
  widgets: {
    single: {
      String,
      LanguageString,
      BlankNodeOrIri,
      Date,
      FileUpload: createFileUpload({
        backend: import.meta.env.STORAGE_BACKEND ?? 'http://localhost:8000/local'
      })
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
    geocoder: new PositionstackGeocoder(import.meta.env.POSITIONSTACK),
  }
}