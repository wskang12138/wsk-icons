(function(u,m){typeof exports=="object"&&typeof module<"u"?m(require("commander"),require("fs"),require("path"),require("svgo"),require("@svgr/core"),require("url"),require("fast-glob"),require("sharp")):typeof define=="function"&&define.amd?define(["commander","fs","path","svgo","@svgr/core","url","fast-glob","sharp"],m):(u=typeof globalThis<"u"?globalThis:u||self,m(u.commander,u.fs,u.path,u.svgo,u.svgrCore,u.url,u.fg,u.sharp))})(this,function(u,m,c,R,I,G,h,T){"use strict";var y=typeof document<"u"?document.currentScript:null;function V(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var f={exports:{}};const F=/[\p{Lu}]/u,z=/[\p{Ll}]/u,S=/^[\p{Lu}](?![\p{Lu}])/gu,w=/([\p{Alpha}\p{N}_]|$)/u,$=/[_.\- ]+/,O=new RegExp("^"+$.source),C=new RegExp($.source+w.source,"gu"),E=new RegExp("\\d+"+w.source,"gu"),b=(e,s,o)=>{let r=!1,n=!1,t=!1;for(let l=0;l<e.length;l++){const a=e[l];r&&F.test(a)?(e=e.slice(0,l)+"-"+e.slice(l),r=!1,t=n,n=!0,l++):n&&t&&z.test(a)?(e=e.slice(0,l-1)+"-"+e.slice(l-1),t=n,n=!1,r=!0):(r=s(a)===a&&o(a)!==a,t=n,n=o(a)===a&&s(a)!==a)}return e},N=(e,s)=>(S.lastIndex=0,e.replace(S,o=>s(o))),U=(e,s)=>(C.lastIndex=0,E.lastIndex=0,e.replace(C,(o,r)=>s(r)).replace(E,o=>s(o))),x=(e,s)=>{if(!(typeof e=="string"||Array.isArray(e)))throw new TypeError("Expected the input to be `string | string[]`");if(s={pascalCase:!1,preserveConsecutiveUppercase:!1,...s},Array.isArray(e)?e=e.map(t=>t.trim()).filter(t=>t.length).join("-"):e=e.trim(),e.length===0)return"";const o=s.locale===!1?t=>t.toLowerCase():t=>t.toLocaleLowerCase(s.locale),r=s.locale===!1?t=>t.toUpperCase():t=>t.toLocaleUpperCase(s.locale);return e.length===1?s.pascalCase?r(e):o(e):(e!==o(e)&&(e=b(e,o,r)),e=e.replace(O,""),s.preserveConsecutiveUppercase?e=N(e,o):e=o(e),s.pascalCase&&(e=r(e.charAt(0))+e.slice(1)),U(e,r))};f.exports=x,f.exports.default=x;var _=f.exports;const A=V(_),j={js2svg:{indent:2,pretty:!0},plugins:[{name:"preset-default",params:{overrides:{removeViewBox:!1,inlineStyles:{onlyMatchedOnce:!1}}}},"removeXMLNS","convertStyleToAttrs",{name:"convertColors",params:{currentColor:/^(?!url|none)./}},{name:"removeAttrs",params:{attrs:["opacity","svg:width","svg:height"]}},{name:"addAttributesToSVGElement",params:{attributes:[{fill:"currentColor",width:"1em",height:"1em","aria-hidden":!0,focusable:"false"}]}}]},D={js2svg:{indent:2,pretty:!0},plugins:[{name:"preset-default",params:{overrides:{removeViewBox:!1,inlineStyles:{onlyMatchedOnce:!1}}}},"removeXMLNS","convertStyleToAttrs",{name:"removeAttrs",params:{attrs:["svg:width","svg:height"]}},{name:"addAttributesToSVGElement",params:{attributes:[{width:"1em",height:"1em","aria-hidden":!0,focusable:"false"}]}}]},L=G.fileURLToPath(typeof document>"u"&&typeof location>"u"?require("url").pathToFileURL(L).href:typeof document>"u"?location.href:y&&y.src||new URL("wsksvg.umd.js",document.baseURI).href);c.dirname(L);const d=new u.Command,v=()=>{console.log(`
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
  `)};async function q(e,s,o){const r=m.readFileSync(e,"utf-8"),n=c.basename(e,".svg"),t=c.dirname(e),l=Buffer.byteLength(r,"utf-8"),a=e.includes("-raw.svg")?D:j;if(o.vue){const i=A(n,{pascalCase:!0}),p=`
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
    `,g=s?c.resolve(process.cwd(),s,`${i}.vue`):c.resolve(t,`${n}.copy.vue`);m.writeFileSync(g,p,"utf-8"),console.log(`Generated Vue component ${i}.vue`)}else if(o.react){const i=A(n,{pascalCase:!0}),p=await I.transform(r,{plugins:["@svgr/plugin-jsx","@svgr/plugin-prettier"],icon:!0,typescript:!1},{componentName:i}),g=s?c.resolve(process.cwd(),s,`${i}.tsx`):c.resolve(t,`${n}.copy.tsx`);m.writeFileSync(g,p,"utf-8"),console.log(`Generated React component ${i}.tsx`)}else{const i=R.optimize(r,a),p=Buffer.byteLength(i.data,"utf-8"),g=s?c.resolve(process.cwd(),s,`${n}.copy.svg`):c.resolve(t,`${n}.copy.svg`);m.writeFileSync(g,i.data,"utf-8"),console.log(`Optimized ${c.basename(e)} -> ${g}`),console.log(`Original Size: ${l} bytes`),console.log(`Optimized Size: ${p} bytes`)}}async function k(e,s){const o=c.basename(e,c.extname(e)),r=c.dirname(e),n=m.readFileSync(e),t=Buffer.byteLength(n);let l;await T(n).resize({withoutEnlargement:!0}).toBuffer().then(a=>{const i=Buffer.byteLength(a);return l=s?c.resolve(process.cwd(),s,`${o}.copy${c.extname(e)}`):c.resolve(r,`${o}.copy${c.extname(e)}`),m.writeFileSync(l,a),console.log(`Optimized ${c.basename(e)} -> ${l}`),console.log(`Original Size: ${t} bytes`),console.log(`Optimized Size: ${i} bytes`),a})}async function B(e,s="",o){const r=c.resolve(process.cwd(),e),n=s?c.resolve(process.cwd(),s):"";console.log(`Resolved input path: ${r}`),console.log(`Resolved output path: ${n}`);try{const t=`${r.replace(/\\/g,"/")}/**/*.svg`,l=`${r.replace(/\\/g,"/")}/**/*.{png,jpg,jpeg}`;console.log(`Searching for SVG files with pattern: ${t}`),console.log(`Searching for image files with pattern: ${l}`);const a=await h(t,{onlyFiles:!0,dot:!0}),i=await h(l,{onlyFiles:!0,dot:!0});console.log(`Found SVG files: ${a}`),console.log(`Found image files: ${i}`),a.length===0&&i.length===0&&(console.error(`No files found matching ${r}`),process.exit(1)),a.forEach(p=>{q(p,n,o).catch(g=>{console.error(`Error processing SVG file ${p}: ${g.message}`)})}),i.forEach(p=>{k(p,n).catch(g=>{console.error(`Error processing image file ${p}: ${g.message}`)})})}catch(t){console.error(`Error: ${t.message}`),process.exit(1)}}d.description("Toolkit for optimizing SVG and other image files, and generating components").argument("<input>","Input file or directory").argument("[output]","Output directory or file","").option("--vue","Generate Vue components from SVG files").option("--react","Generate React components from SVG files").action(async(e,s,o)=>{o.help?v():(e||(console.error("Error: Missing required argument <input>."),v(),process.exit(1)),await B(e,s,o))}),d.on("--help",()=>{v()}),d.parse(process.argv)});
