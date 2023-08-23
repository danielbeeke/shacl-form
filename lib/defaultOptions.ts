import { Enhancer } from './core/Enhancer'

// Single Widgets
import String from './editors/single/String'
import BlankNodeOrIri from './editors/single/BlankNodeOrIri'
import Date from './editors/single/Date'
import FileUpload from './editors/single/FileUpload'
import Iconify from './editors/single/Iconify'
import Reference from './editors/single/Reference'
import WYSIWYG from './editors/single/WYSIWYG'
import EnumSelect from './editors/single/EnumSelect'
import Text from './editors/single/Text'
import Switch from './editors/single/Switch'
import Color from './editors/single/Color'

// multi Widgets
import Address from './editors/multi/Address'

// Groups
import Buttons, { iri as buttonsIri } from './components/groups/Buttons'
import LanguageTabs, { iri as languageTabsIri } from './components/groups/LanguageTabs'
import { DefaultGroup } from './components/groups/DefaultGroup'

// Plugins
import { PositionstackGeocoder } from './plugins/GeoCoder/PositionstackGeocoder'

/** @ts-ignore */
import { init as bcp47PickerInit } from 'bcp47-picker/init'

bcp47PickerInit({ sources: ['https://bcp47.danielbeeke.nl/data/lmt.json']})

const uploadSetttings = {
  backend: import.meta.env.STORAGE_BACKEND ?? 'http://localhost:8008/local'
}

export default {
  widgets: {
    single: {
      String,
      Iconify,
      Reference,
      BlankNodeOrIri,
      Date,
      EnumSelect,
      Text,
      Switch,
      Color,
      WYSIWYG: [WYSIWYG, uploadSetttings],
      FileUpload: [FileUpload, uploadSetttings]
    },
    multi: {
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

// 