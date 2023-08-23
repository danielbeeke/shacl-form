/// <reference types="vite/client" />

declare module "*?raw" {
  const content: string;
  export default content;
}

declare module 'shacl-engine';
declare module 'shacl-engine/lib/parsePath.js';

declare module 'grapoi';

declare module JSX {
  interface IntrinsicElements {
    'bcp47-picker': any
  }
}

declare module '@editorjs/paragraph'
declare module '@editorjs/list'
declare module '@editorjs/link'
declare module '@editorjs/image'
declare module '@editorjs/header'
declare module '@editorjs/quote'
declare module '@editorjs/delimiter'
declare module '@editorjs/simple-image'
declare module '@editorjs/table'
declare module '@editorjs/marker'
declare module '@editorjs/code'
declare module 'editorjs-drag-drop';

declare module 'uhtml/async';