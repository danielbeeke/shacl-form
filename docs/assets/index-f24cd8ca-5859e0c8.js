var __defProp=Object.defineProperty;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value;var __name=(target,value)=>__defProp(target,"name",{value,configurable:!0});var __publicField=(obj,key,value)=>(__defNormalProp(obj,typeof key!="symbol"?key+"":key,value),value);import{S as ShaclFormSingleEditorUhtml}from"./ShaclFormSingleEditorUhtml-37f5b89c-b1e271b6.js";import{s as schema,a as rdfs,b as bestLanguage,d as sh$1,h as html,e as defaultEnv,f as swapSubject}from"./index-80dcc8fe.js";import"./ShaclFormSingleEditor-5e801041-4800b026.js";var __defProp2=Object.defineProperty,__name2=__name((target,value)=>__defProp2(target,"name",{value,configurable:!0}),"__name");class BlankNodeOrIri extends ShaclFormSingleEditorUhtml{constructor(){super(...arguments);__publicField(this,"showIdentifier",!1);__publicField(this,"identifierSuggestion","")}template(){var _a,_b,_c,_d,_e,_f,_g;const namesPointer=this.dataPointer().out([this.predicate]),indexSpecificNamesPointer=namesPointer.clone({ptrs:[namesPointer.ptrs[this.index]].filter(Boolean)}).trim().out([schema("name"),rdfs("label")]),name=bestLanguage(indexSpecificNamesPointer,this.uiLanguagePriorities),enforceIri=(_a=this.shaclPointer.out([sh$1("nodeKind")]).term)==null?void 0:_a.equals(sh$1("IRI"));return html`
      <span class="d-flex align-items-center">
        <h4 class="me-2 mb-0">${name??((_b=this.value)==null?void 0:_b.value)}</h4>
        <em class="me-2">${(_c=this.value)==null?void 0:_c.value} (${(_d=this.value)==null?void 0:_d.termType})</em>

        ${((_e=this.value)==null?void 0:_e.termType)==="BlankNode"&&!this.showIdentifier&&!enforceIri?html`
        <button class="btn-secondary btn btn-sm" onClick=${()=>{this.showIdentifier=!0,this.render()}}>Add identifier</button>
        `:null}
        
        ${((_f=this.value)==null?void 0:_f.termType)==="NamedNode"&&!this.showIdentifier&&!enforceIri?html`
        <button class="btn-secondary btn btn-sm" onClick=${()=>{const store=this.dataPointer().ptrs[0].dataset,newSubject=defaultEnv.blankNode();swapSubject(store,namesPointer.terms[this.index],newSubject),this.renderAll()}}>Remove identifier</button>
        `:null}

      </span>

      ${this.showIdentifier||enforceIri&&((_g=this.value)==null?void 0:_g.termType)==="BlankNode"?html`
        <input class="" type="url" required placeholder="https://example.com" onChange=${event=>{this.identifierSuggestion=event.target.value}} />
        <button class="btn-secondary btn btn-sm" onClick=${()=>{if(!this.identifierSuggestion)return;const store=this.dataPointer().ptrs[0].dataset,newSubject=defaultEnv.namedNode(this.identifierSuggestion);swapSubject(store,namesPointer.terms[this.index],newSubject),this.showIdentifier=!1,this.renderAll()}}>Save identifier</button>
        ${enforceIri?null:html`
        <button class="btn-secondary btn btn-sm" onClick=${()=>{this.showIdentifier=!1,this.render()}}>Cancel</button>
        `}

      `:null}
    `}}__name(BlankNodeOrIri,"BlankNodeOrIri");__name2(BlankNodeOrIri,"BlankNodeOrIri");export{BlankNodeOrIri as default};
