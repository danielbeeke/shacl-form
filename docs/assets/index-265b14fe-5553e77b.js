var __defProp=Object.defineProperty;var __name=(target,value)=>__defProp(target,"name",{value,configurable:!0});import{d as sh$1,j as jsxRuntimeExports}from"./index-80dcc8fe.js";import{S as ShaclFormSingleEditorReact}from"./ShaclFormSingleEditorReact-b62777e4-20829fdf.js";import"./ShaclFormSingleEditor-5e801041-4800b026.js";var __defProp2=Object.defineProperty,__name2=__name((target,value)=>__defProp2(target,"name",{value,configurable:!0}),"__name");class EnumSelect extends ShaclFormSingleEditorReact{template(){var _a,_b;const options=[...this.shaclPointer.out([sh$1("in")]).list()].map(pointer=>pointer.value);return jsxRuntimeExports.jsx("div",{className:"d-flex",children:jsxRuntimeExports.jsxs("select",{className:"form-select",defaultValue:(_a=this.value)==null?void 0:_a.value,onChange:event=>{this.value=this.df.literal(event.target.value)},children:[(_b=this.value)!=null&&_b.value?null:jsxRuntimeExports.jsx("option",{children:"- Select -"}),options.map(option=>jsxRuntimeExports.jsx("option",{value:option,children:option},option))]})})}}__name(EnumSelect,"EnumSelect");__name2(EnumSelect,"EnumSelect");export{EnumSelect as default};
