import { init } from './core/ShaclForm'
import String from './widgets/String'
import BlankNodeOrIri from './widgets/BlankNodeOrIri'
import Date from './widgets/Date'

init({
  widgets: {
    String,
    BlankNodeOrIri,
    Date
  }
})