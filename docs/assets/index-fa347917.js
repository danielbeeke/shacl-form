var __defProp=Object.defineProperty;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value;var __name=(target,value)=>__defProp(target,"name",{value,configurable:!0});var __publicField=(obj,key,value)=>(__defNormalProp(obj,typeof key!="symbol"?key+"":key,value),value);import{S as ShaclFormSingleEditorUhtml}from"./ShaclFormSingleEditorUhtml-87a5e249.js";import{s as schema,r as rdfs,b as bestLanguage,a as sh,c as shFrm,d as defaultEnv,e as swapSubject}from"./index-0ca3f396.js";import{h as html}from"./async-2430f83d.js";import"./ShaclFormSingleEditor-852a3b3c.js";const _BlankNodeOrIri=class _BlankNodeOrIri extends ShaclFormSingleEditorUhtml{constructor(){super(...arguments);__publicField(this,"showIdentifier",!1);__publicField(this,"identifierSuggestion","")}template(){var _a,_b,_c,_d,_e,_f;const namesPointer=this.dataPointer().out([this.predicate]),indexSpecificNamesPointer=namesPointer.clone({ptrs:[namesPointer.ptrs[this.index]].filter(Boolean)}).trim().out([schema("name"),rdfs("label")]),name=bestLanguage(indexSpecificNamesPointer,this.uiLanguagePriorities),nodeKind=this.shaclPointer.out([sh("nodeKind")]).term,enforceIri=nodeKind==null?void 0:nodeKind.equals(sh("IRI"));return this.shaclPointer.out([shFrm("languageDiscriminator")]).term?(this.style.display="none",html``):html`
      <span class="d-flex align-items-center">
        <h4 class="me-2 mb-0">${name??((_a=this.value)==null?void 0:_a.value)}</h4>
        <em class="me-2">${(_b=this.value)==null?void 0:_b.value} (${(_c=this.value)==null?void 0:_c.termType})</em>

        ${((_d=this.value)==null?void 0:_d.termType)==="BlankNode"&&!this.showIdentifier&&!enforceIri?html`
        <button class="btn-secondary btn btn-sm" onClick=${()=>{this.showIdentifier=!0,this.render()}}>Add identifier</button>
        `:null}
        
        ${((_e=this.value)==null?void 0:_e.termType)==="NamedNode"&&!this.showIdentifier&&!enforceIri?html`
        <button class="btn-secondary btn btn-sm" onClick=${()=>{const store=this.dataPointer().ptrs[0].dataset,newSubject=defaultEnv.blankNode();swapSubject(store,namesPointer.terms[this.index],newSubject),this.renderAll()}}>Remove identifier</button>
        `:null}

      </span>

      ${this.showIdentifier||enforceIri&&((_f=this.value)==null?void 0:_f.termType)==="BlankNode"?html`
        <input class="" type="url" required placeholder="https://example.com" onChange=${event=>{this.identifierSuggestion=event.target.value}} />
        <button class="btn-secondary btn btn-sm" onClick=${()=>{if(!this.identifierSuggestion)return;const store=this.dataPointer().ptrs[0].dataset,newSubject=defaultEnv.namedNode(this.identifierSuggestion);swapSubject(store,namesPointer.terms[this.index],newSubject),this.showIdentifier=!1,this.renderAll()}}>Save identifier</button>
        ${enforceIri?null:html`
        <button class="btn-secondary btn btn-sm" onClick=${()=>{this.showIdentifier=!1,this.render()}}>Cancel</button>
        `}

      `:null}
    `}};__name(_BlankNodeOrIri,"BlankNodeOrIri");let BlankNodeOrIri=_BlankNodeOrIri;export{BlankNodeOrIri as default};
