import { init } from './core/ShaclForm'

// Widgets
import String from './widgets/String'
import BlankNodeOrIri from './widgets/BlankNodeOrIri'
import Date from './widgets/Date'
import LanguageString from './widgets/LanguageString'

// Groups
import Buttons, { iri as buttonsIri } from './components/groups/Buttons'
import LanguageTabs, { iri as languageTabsIri } from './components/groups/LanguageTabs'
import { DefaultGroup } from './components/groups/DefaultGroup'

/** @ts-ignore */
import { init as bcp47PickerInit } from 'bcp47-picker/init'

bcp47PickerInit({ sources: ['https://bcp47.danielbeeke.nl/data/lmt.json']})

init({
  widgets: {
    String,
    LanguageString,
    BlankNodeOrIri,
    Date
  },
  groups: {
    default: DefaultGroup,
    [buttonsIri.value]: Buttons,
    [languageTabsIri.value]: LanguageTabs
  }
})