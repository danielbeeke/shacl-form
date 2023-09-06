var __defProp=Object.defineProperty;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value;var __name=(target,value)=>__defProp(target,"name",{value,configurable:!0});var __publicField=(obj,key,value)=>(__defNormalProp(obj,typeof key!="symbol"?key+"":key,value),value);import{s as schema,r as rdfs,b as bestLanguage,a as sh,c as shFrm,j as jsxRuntimeExports,d as defaultEnv,e as swapSubject}from"./index-132d62c0.js";import{S as ShaclFormSingleEditorUhtml}from"./ShaclFormSingleEditorUhtml-0f2489dd.js";import{h as html}from"./async-229685ad.js";import"./ShaclFormSingleEditor-899dde30.js";const _BlankNodeOrIri=class _BlankNodeOrIri extends ShaclFormSingleEditorUhtml{constructor(){super(...arguments);__publicField(this,"showIdentifier",!1);__publicField(this,"identifierSuggestion","")}template(){var _a,_b,_c,_d,_e,_f;const namesPointer=this.dataPointer().out([this.predicate]),indexSpecificNamesPointer=namesPointer.clone({ptrs:[namesPointer.ptrs[this.index]].filter(Boolean)}).trim().out([schema("name"),rdfs("label")]),name=bestLanguage(indexSpecificNamesPointer,this.uiLanguagePriorities),nodeKind=this.shaclPointer.out([sh("nodeKind")]).term,enforceIri=nodeKind==null?void 0:nodeKind.equals(sh("IRI"));return this.shaclPointer.out([shFrm("languageDiscriminator")]).term?(this.style.display="none",jsxRuntimeExports.jsx("div",{})):jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment,{children:[jsxRuntimeExports.jsxs("span",{className:"d-flex align-items-center",children:[jsxRuntimeExports.jsxs("h4",{className:"me-2 mb-0",children:["$",name??((_a=this.value)==null?void 0:_a.value)]}),jsxRuntimeExports.jsxs("em",{className:"me-2",children:["$",(_b=this.value)==null?void 0:_b.value," ($",(_c=this.value)==null?void 0:_c.termType,")"]}),((_d=this.value)==null?void 0:_d.termType)==="BlankNode"&&!this.showIdentifier&&!enforceIri?jsxRuntimeExports.jsx("button",{className:"btn-secondary btn btn-sm",onClick:()=>{this.showIdentifier=!0,this.render()},children:"Add identifier"}):null,((_e=this.value)==null?void 0:_e.termType)==="NamedNode"&&!this.showIdentifier&&!enforceIri?html`
        <button class="btn-secondary btn btn-sm" onClick=${()=>{const store=this.dataPointer().ptrs[0].dataset,newSubject=defaultEnv.blankNode();swapSubject(store,namesPointer.terms[this.index],newSubject),this.renderAll()}}>Remove identifier</button>
        `:null]}),this.showIdentifier||enforceIri&&((_f=this.value)==null?void 0:_f.termType)==="BlankNode"?jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment,{children:[jsxRuntimeExports.jsx("input",{type:"url",required:!0,placeholder:"https://example.com",onChange:event=>{this.identifierSuggestion=event.target.value}}),jsxRuntimeExports.jsx("button",{className:"btn-secondary btn btn-sm",onClick:()=>{if(!this.identifierSuggestion)return;const store=this.dataPointer().ptrs[0].dataset,newSubject=defaultEnv.namedNode(this.identifierSuggestion);swapSubject(store,namesPointer.terms[this.index],newSubject),this.showIdentifier=!1,this.renderAll()},children:"Save identifier"}),enforceIri?null:jsxRuntimeExports.jsx("button",{className:"btn-secondary btn btn-sm",onClick:()=>{this.showIdentifier=!1,this.render()},children:"Cancel"})]}):null]})}};__name(_BlankNodeOrIri,"BlankNodeOrIri");let BlankNodeOrIri=_BlankNodeOrIri;export{BlankNodeOrIri as default};
