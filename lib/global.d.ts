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