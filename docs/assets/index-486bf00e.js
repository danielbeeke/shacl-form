var __defProp=Object.defineProperty;var __name=(target,value)=>__defProp(target,"name",{value,configurable:!0});import{j as jsxRuntimeExports}from"./index-a55d7649.js";import{S as ShaclFormSingleEditorReact}from"./ShaclFormSingleEditorReact-35a0c75d.js";import"./ShaclFormSingleEditor-b958674c.js";const _Color=class _Color extends ShaclFormSingleEditorReact{template(){var _a;return jsxRuntimeExports.jsxs("div",{className:"d-flex",children:[this.value.value?null:jsxRuntimeExports.jsx("label",{className:"empty-label",children:"No color added"}),jsxRuntimeExports.jsx("input",{className:"form-control",onChange:event=>{this.value=this.df.literal(event.target.value)},type:"color",defaultValue:((_a=this.value)==null?void 0:_a.value)??""})]})}};__name(_Color,"Color");let Color=_Color;export{Color as default};