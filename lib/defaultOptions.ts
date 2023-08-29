import { importSingleWidgets } from './helpers/importSingleWidgets'
import { importMultiWidgets } from './helpers/importMultiWidgets'

// Groups
import Buttons, { iri as buttonsIri } from './components/groups/Buttons'
import LanguageTabs, { iri as languageTabsIri } from './components/groups/LanguageTabs'
import { DefaultGroup } from './components/groups/DefaultGroup'

// Plugins
import { PositionstackGeocoder } from './plugins/GeoCoder/PositionstackGeocoder'

/** @ts-ignore */
import { init as bcp47PickerInit } from 'bcp47-picker/init'

const singleEditors = importSingleWidgets(
  import.meta.glob('./editors/single/**/index*'),
  import.meta.glob('./editors/single/**/meta.ts', { eager: true })
)

const {
  String,
  Iconify,
  Reference,
  BlankNodeOrIri,
  Date,
  EnumSelect,
  Text,
  Switch,
  Color,
  WYSIWYG,
  FileUpload
} = singleEditors

bcp47PickerInit({ sources: ['https://bcp47.mediaworks.global/data/lmt.json']})

const uploadSetttings = {
  backend: import.meta.env.STORAGE_BACKEND ?? '/storage-service-worker'
}

const multiEditors = importMultiWidgets(
  import.meta.glob('./editors/multi/**/index*'),
  import.meta.glob('./editors/multi/**/meta.ts', { eager: true })
)

const {
  Address
} = multiEditors

export const defaultOptions = {
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
  enhancer: () => import('./core/Enhancer').then(module => module.default),
  plugins: {
    geocoder: new PositionstackGeocoder(import.meta.env.POSITIONSTACK),
  }
}