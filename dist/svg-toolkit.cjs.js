#!/usr/bin/env node
"use strict";const L=require("commander"),u=require("fs"),c=require("path"),x=require("svgo"),R=require("@svgr/core"),I=require("url"),v=require("fast-glob"),b=require("sharp");var h=typeof document<"u"?document.currentScript:null;function G(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var f={exports:{}};const V=/[\p{Lu}]/u,F=/[\p{Ll}]/u,y=/^[\p{Lu}](?![\p{Lu}])/gu,C=/([\p{Alpha}\p{N}_]|$)/u,E=/[_.\- ]+/,T=new RegExp("^"+E.source),S=new RegExp(E.source+C.source,"gu"),w=new RegExp("\\d+"+C.source,"gu"),z=(e,t,o)=>{let r=!1,a=!1,s=!1;for(let l=0;l<e.length;l++){const n=e[l];r&&V.test(n)?(e=e.slice(0,l)+"-"+e.slice(l),r=!1,s=a,a=!0,l++):a&&s&&F.test(n)?(e=e.slice(0,l-1)+"-"+e.slice(l-1),s=a,a=!1,r=!0):(r=t(n)===n&&o(n)!==n,s=a,a=o(n)===n&&t(n)!==n)}return e},O=(e,t)=>(y.lastIndex=0,e.replace(y,o=>t(o))),N=(e,t)=>(S.lastIndex=0,w.lastIndex=0,e.replace(S,(o,r)=>t(r)).replace(w,o=>t(o))),A=(e,t)=>{if(!(typeof e=="string"||Array.isArray(e)))throw new TypeError("Expected the input to be `string | string[]`");if(t={pascalCase:!1,preserveConsecutiveUppercase:!1,...t},Array.isArray(e)?e=e.map(s=>s.trim()).filter(s=>s.length).join("-"):e=e.trim(),e.length===0)return"";const o=t.locale===!1?s=>s.toLowerCase():s=>s.toLocaleLowerCase(t.locale),r=t.locale===!1?s=>s.toUpperCase():s=>s.toLocaleUpperCase(t.locale);return e.length===1?t.pascalCase?r(e):o(e):(e!==o(e)&&(e=z(e,o,r)),e=e.replace(T,""),t.preserveConsecutiveUppercase?e=O(e,o):e=o(e),t.pascalCase&&(e=r(e.charAt(0))+e.slice(1)),N(e,r))};f.exports=A;f.exports.default=A;var _=f.exports;const $=G(_),U={js2svg:{indent:2,pretty:!0},plugins:[{name:"preset-default",params:{overrides:{removeViewBox:!1,inlineStyles:{onlyMatchedOnce:!1}}}},"removeXMLNS","convertStyleToAttrs",{name:"convertColors",params:{currentColor:/^(?!url|none)./}},{name:"removeAttrs",params:{attrs:["opacity","svg:width","svg:height"]}},{name:"addAttributesToSVGElement",params:{attributes:[{fill:"currentColor",width:"1em",height:"1em","aria-hidden":!0,focusable:"false"}]}}]},j={js2svg:{indent:2,pretty:!0},plugins:[{name:"preset-default",params:{overrides:{removeViewBox:!1,inlineStyles:{onlyMatchedOnce:!1}}}},"removeXMLNS","convertStyleToAttrs",{name:"removeAttrs",params:{attrs:["svg:width","svg:height"]}},{name:"addAttributesToSVGElement",params:{attributes:[{width:"1em",height:"1em","aria-hidden":!0,focusable:"false"}]}}]},D=I.fileURLToPath(typeof document>"u"?require("url").pathToFileURL(__filename).href:h&&h.src||new URL("wsksvg.cjs.js",document.baseURI).href);c.dirname(D);const d=new L.Command,m=()=>{console.log(`
Usage:
  wsksvg <input> [output] [options]

Commands:
  <input>         The path to the SVG file or directory containing SVG files.
  [output]        The path to the output directory or file. If not specified, the output will be in the same directory with a ".copy" suffix.

Options:
  --vue           Generate Vue components from SVG files.
  --react         Generate React components from SVG files.
  -h, --help      Display this help message.

Examples:
  wsksvg ./rawSvg
  wsksvg ./rawSvg ./testVue
  wsksvg ./rawSvg ./testVue --vue
  wsksvg ./rawSvg ./testVue --react
  wsksvg ./rawImages ./optimizedImages
  `)};async function q(e,t,o){const r=u.readFileSync(e,"utf-8"),a=c.basename(e,".svg"),s=c.dirname(e),l=Buffer.byteLength(r,"utf-8"),n=e.includes("-raw.svg")?j:U;if(o.vue){const i=$(a,{pascalCase:!0}),p=`
<template>
  <svg xmlns="http://www.w3.org/2000/svg" v-html="icon" />
</template>

<script setup>
import { ref } from 'vue';

const icon = \`${r}\`;
<\/script>

<style scoped>
svg {
  width: 1em;
  height: 1em;
}
</style>
    `,g=t?c.resolve(process.cwd(),t,`${i}.vue`):c.resolve(s,`${a}.copy.vue`);u.writeFileSync(g,p,"utf-8"),console.log(`Generated Vue component ${i}.vue`)}else if(o.react){const i=$(a,{pascalCase:!0}),p=await R.transform(r,{plugins:["@svgr/plugin-jsx","@svgr/plugin-prettier"],icon:!0,typescript:!1},{componentName:i}),g=t?c.resolve(process.cwd(),t,`${i}.tsx`):c.resolve(s,`${a}.copy.tsx`);u.writeFileSync(g,p,"utf-8"),console.log(`Generated React component ${i}.tsx`)}else{const i=x.optimize(r,n),p=Buffer.byteLength(i.data,"utf-8"),g=t?c.resolve(process.cwd(),t,`${a}.copy.svg`):c.resolve(s,`${a}.copy.svg`);u.writeFileSync(g,i.data,"utf-8"),console.log(`Optimized ${c.basename(e)} -> ${g}`),console.log(`Original Size: ${l} bytes`),console.log(`Optimized Size: ${p} bytes`)}}async function k(e,t){const o=c.basename(e,c.extname(e)),r=c.dirname(e),a=u.readFileSync(e),s=Buffer.byteLength(a);let l;await b(a).resize({withoutEnlargement:!0}).toBuffer().then(n=>{const i=Buffer.byteLength(n);return l=t?c.resolve(process.cwd(),t,`${o}.copy${c.extname(e)}`):c.resolve(r,`${o}.copy${c.extname(e)}`),u.writeFileSync(l,n),console.log(`Optimized ${c.basename(e)} -> ${l}`),console.log(`Original Size: ${s} bytes`),console.log(`Optimized Size: ${i} bytes`),n})}async function B(e,t="",o){const r=c.resolve(process.cwd(),e),a=t?c.resolve(process.cwd(),t):"";console.log(`Resolved input path: ${r}`),console.log(`Resolved output path: ${a}`);try{const s=`${r.replace(/\\/g,"/")}/**/*.svg`,l=`${r.replace(/\\/g,"/")}/**/*.{png,jpg,jpeg}`;console.log(`Searching for SVG files with pattern: ${s}`),console.log(`Searching for image files with pattern: ${l}`);const n=await v(s,{onlyFiles:!0,dot:!0}),i=await v(l,{onlyFiles:!0,dot:!0});console.log(`Found SVG files: ${n}`),console.log(`Found image files: ${i}`),n.length===0&&i.length===0&&(console.error(`No files found matching ${r}`),process.exit(1)),n.forEach(p=>{q(p,a,o).catch(g=>{console.error(`Error processing SVG file ${p}: ${g.message}`)})}),i.forEach(p=>{k(p,a).catch(g=>{console.error(`Error processing image file ${p}: ${g.message}`)})})}catch(s){console.error(`Error: ${s.message}`),process.exit(1)}}d.description("Toolkit for optimizing SVG and other image files, and generating components").argument("<input>","Input file or directory").argument("[output]","Output directory or file","").option("--vue","Generate Vue components from SVG files").option("--react","Generate React components from SVG files").action(async(e,t,o)=>{o.help?m():(e||(console.error("Error: Missing required argument <input>."),m(),process.exit(1)),await B(e,t,o))});d.on("--help",()=>{m()});d.parse(process.argv);
