import { init } from './core/ShaclForm'
import String from './widgets/String'
import BlankNodeOrIri from './widgets/BlankNodeOrIri'
import Date from './widgets/Date'
import LanguageString from './widgets/LanguageString'

init({
  widgets: {
    String,
    LanguageString,
    BlankNodeOrIri,
    Date
  }
})