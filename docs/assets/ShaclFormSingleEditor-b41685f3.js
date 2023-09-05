var __defProp=Object.defineProperty;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value;var __name=(target,value)=>__defProp(target,"name",{value,configurable:!0});var __publicField=(obj,key,value)=>(__defNormalProp(obj,typeof key!="symbol"?key+"":key,value),value),__accessCheck=(obj,member,msg)=>{if(!member.has(obj))throw TypeError("Cannot "+msg)};var __privateGet=(obj,member,getter)=>(__accessCheck(obj,member,"read from private field"),getter?getter.call(obj):member.get(obj)),__privateAdd=(obj,member,value)=>{if(member.has(obj))throw TypeError("Cannot add the same private member more than once");member instanceof WeakSet?member.add(obj):member.set(obj,value)},__privateSet=(obj,member,value,setter)=>(__accessCheck(obj,member,"write to private field"),setter?setter.call(obj,value):member.set(obj,value),value);import{d as defaultEnv,c as shFrm,q as replaceList,a as sh}from"./index-8abc5264.js";var _form;const _ShaclFormSingleEditor=class _ShaclFormSingleEditor extends HTMLElement{constructor(){super(...arguments);__publicField(this,"messages",{errors:[],infos:[],warnings:[]});__publicField(this,"isList",!1);__publicField(this,"path");__publicField(this,"predicate",defaultEnv.namedNode(""));__publicField(this,"index",0);__publicField(this,"shaclPointer",{});__publicField(this,"dataPointer",__name(()=>({}),"dataPointer"));__publicField(this,"df",defaultEnv);__publicField(this,"uiLanguagePriorities",[]);__publicField(this,"isHeader",!1);__publicField(this,"isFooter",!1);__privateAdd(this,_form,void 0);__publicField(this,"widgetSettings")}static get iri(){return shFrm(_ShaclFormSingleEditor.name).value}static set iri(_value){}static score(_shaclPointer,_dataPointer){return 0}static createNewObject(_form2,_shaclPointer){return defaultEnv.namedNode("")}get values(){return this.dataPointer().out([this.predicate]).isList()?[...this.dataPointer().out([this.predicate]).list()].map(part=>part.term):this.dataPointer().out([this.predicate]).terms}get value(){return this.values[this.index]}set value(newValue){if(newValue.equals(this.value))return;if(this.isList){const newValues=[...this.values];newValues[this.index]=newValue,replaceList(newValues,this.dataPointer().out([this.predicate]))}else this.dataPointer().deleteOut(this.predicate,this.value).addOut(this.predicate,newValue);const event=new CustomEvent("value.set",{detail:{predicate:this.predicate,object:newValue,dataPointer:this.dataPointer(),shaclPointer:this.shaclPointer,element:this}});this.form.dispatchEvent(event),this.renderAll()}addValue(newValue){if(this.isList){const newValues=[...this.values];newValues.push(newValue),replaceList(newValues,this.dataPointer().out([this.predicate]))}else this.dataPointer().addOut(this.predicate,newValue);const event=new CustomEvent("value.set",{detail:{predicate:this.predicate,object:newValue,dataPointer:this.dataPointer(),shaclPointer:this.shaclPointer,element:this}});this.form.dispatchEvent(event),this.renderAll()}renderAll(){this.form.render()}get rdfDataset(){return this.dataPointer().ptrs[0].dataset}get form(){return __privateGet(this,_form)?__privateGet(this,_form):(__privateSet(this,_form,this.closest(".shacl-form")),__privateGet(this,_form))}async beforeRemove(){return!0}async connectedCallback(){this.render()}render(){}header(){return null}template(_props){return null}footer(){return null}getInputProps(){var _a;const props={},maxCount=this.shaclPointer.out([sh("maxCount")]).value??1/0,minCount=this.shaclPointer.out([sh("minCount")]).value??0,nonEmptyValues=this.values.filter(value=>value.value);return minCount>0&&maxCount>=nonEmptyValues.length&&(props.required=!0),props.value=(_a=this.value)==null?void 0:_a.value,props.language=this.value.language,props.datatype=this.value.datatype,props}};_form=new WeakMap,__name(_ShaclFormSingleEditor,"ShaclFormSingleEditor"),__publicField(_ShaclFormSingleEditor,"type","single");let ShaclFormSingleEditor=_ShaclFormSingleEditor;export{ShaclFormSingleEditor as S};