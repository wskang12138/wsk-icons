#!/usr/bin/env node
import { Command as A } from "commander";
import g from "fs";
import c from "path";
import { optimize as x } from "svgo";
import { transform as L } from "@svgr/core";
import { fileURLToPath as R } from "url";
import v from "fast-glob";
import I from "sharp";
function b(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var u = { exports: {} };
const G = /[\p{Lu}]/u, V = /[\p{Ll}]/u, h = /^[\p{Lu}](?![\p{Lu}])/gu, $ = /([\p{Alpha}\p{N}_]|$)/u, C = /[_.\- ]+/, F = new RegExp("^" + C.source), y = new RegExp(C.source + $.source, "gu"), w = new RegExp("\\d+" + $.source, "gu"), z = (e, t, s) => {
  let r = !1, a = !1, o = !1;
  for (let l = 0; l < e.length; l++) {
    const n = e[l];
    r && G.test(n) ? (e = e.slice(0, l) + "-" + e.slice(l), r = !1, o = a, a = !0, l++) : a && o && V.test(n) ? (e = e.slice(0, l - 1) + "-" + e.slice(l - 1), o = a, a = !1, r = !0) : (r = t(n) === n && s(n) !== n, o = a, a = s(n) === n && t(n) !== n);
  }
  return e;
}, O = (e, t) => (h.lastIndex = 0, e.replace(h, (s) => t(s))), T = (e, t) => (y.lastIndex = 0, w.lastIndex = 0, e.replace(y, (s, r) => t(r)).replace(w, (s) => t(s))), E = (e, t) => {
  if (!(typeof e == "string" || Array.isArray(e)))
    throw new TypeError("Expected the input to be `string | string[]`");
  if (t = {
    pascalCase: !1,
    preserveConsecutiveUppercase: !1,
    ...t
  }, Array.isArray(e) ? e = e.map((o) => o.trim()).filter((o) => o.length).join("-") : e = e.trim(), e.length === 0)
    return "";
  const s = t.locale === !1 ? (o) => o.toLowerCase() : (o) => o.toLocaleLowerCase(t.locale), r = t.locale === !1 ? (o) => o.toUpperCase() : (o) => o.toLocaleUpperCase(t.locale);
  return e.length === 1 ? t.pascalCase ? r(e) : s(e) : (e !== s(e) && (e = z(e, s, r)), e = e.replace(F, ""), t.preserveConsecutiveUppercase ? e = O(e, s) : e = s(e), t.pascalCase && (e = r(e.charAt(0)) + e.slice(1)), T(e, r));
};
u.exports = E;
u.exports.default = E;
var N = u.exports;
const S = /* @__PURE__ */ b(N), _ = {
  js2svg: {
    indent: 2,
    // string with spaces or number of spaces. 4 by default
    pretty: !0
    // boolean, false by default
  },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: !1,
          inlineStyles: {
            onlyMatchedOnce: !1
          }
        }
      }
    },
    "removeXMLNS",
    "convertStyleToAttrs",
    {
      name: "convertColors",
      params: { currentColor: /^(?!url|none)./ }
    },
    {
      name: "removeAttrs",
      params: { attrs: ["opacity", "svg:width", "svg:height"] }
    },
    {
      name: "addAttributesToSVGElement",
      params: {
        attributes: [{
          fill: "currentColor",
          width: "1em",
          height: "1em",
          "aria-hidden": !0,
          focusable: "false"
        }]
      }
    }
  ]
}, U = {
  js2svg: {
    indent: 2,
    // string with spaces or number of spaces. 4 by default
    pretty: !0
    // boolean, false by default
  },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: !1,
          inlineStyles: {
            onlyMatchedOnce: !1
          }
        }
      }
    },
    "removeXMLNS",
    "convertStyleToAttrs",
    {
      name: "removeAttrs",
      params: { attrs: ["svg:width", "svg:height"] }
    },
    {
      name: "addAttributesToSVGElement",
      params: {
        attributes: [{
          width: "1em",
          height: "1em",
          "aria-hidden": !0,
          focusable: "false"
        }]
      }
    }
  ]
}, D = R(import.meta.url);
c.dirname(D);
const d = new A(), f = () => {
  console.log(`
Usage:
  svg-toolkit <input> [output] [options]

Commands:
  <input>         The path to the SVG file or directory containing SVG files.
  [output]        The path to the output directory or file. If not specified, the output will be in the same directory with a ".copy" suffix.

Options:
  --vue           Generate Vue components from SVG files.
  --react         Generate React components from SVG files.
  -h, --help      Display this help message.

Examples:
  svg-toolkit ./rawSvg
  svg-toolkit ./rawSvg ./testVue
  svg-toolkit ./rawSvg ./testVue --vue
  svg-toolkit ./rawSvg ./testVue --react
  svg-toolkit ./rawImages ./optimizedImages
  `);
};
async function j(e, t, s) {
  const r = g.readFileSync(e, "utf-8"), a = c.basename(e, ".svg"), o = c.dirname(e), l = Buffer.byteLength(r, "utf-8"), n = e.includes("-raw.svg") ? U : _;
  if (s.vue) {
    const i = S(a, { pascalCase: !0 }), p = `
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
    `, m = t ? c.resolve(process.cwd(), t, `${i}.vue`) : c.resolve(o, `${a}.copy.vue`);
    g.writeFileSync(m, p, "utf-8"), console.log(`Generated Vue component ${i}.vue`);
  } else if (s.react) {
    const i = S(a, { pascalCase: !0 }), p = await L(r, {
      plugins: ["@svgr/plugin-jsx", "@svgr/plugin-prettier"],
      icon: !0,
      typescript: !1
    }, { componentName: i }), m = t ? c.resolve(process.cwd(), t, `${i}.tsx`) : c.resolve(o, `${a}.copy.tsx`);
    g.writeFileSync(m, p, "utf-8"), console.log(`Generated React component ${i}.tsx`);
  } else {
    const i = x(r, n), p = Buffer.byteLength(i.data, "utf-8"), m = t ? c.resolve(process.cwd(), t, `${a}.copy.svg`) : c.resolve(o, `${a}.copy.svg`);
    g.writeFileSync(m, i.data, "utf-8"), console.log(`Optimized ${c.basename(e)} -> ${m}`), console.log(`Original Size: ${l} bytes`), console.log(`Optimized Size: ${p} bytes`);
  }
}
async function B(e, t) {
  const s = c.basename(e, c.extname(e)), r = c.dirname(e), a = g.readFileSync(e), o = Buffer.byteLength(a);
  let l;
  await I(a).resize({ withoutEnlargement: !0 }).toBuffer().then((n) => {
    const i = Buffer.byteLength(n);
    return l = t ? c.resolve(process.cwd(), t, `${s}.copy${c.extname(e)}`) : c.resolve(r, `${s}.copy${c.extname(e)}`), g.writeFileSync(l, n), console.log(`Optimized ${c.basename(e)} -> ${l}`), console.log(`Original Size: ${o} bytes`), console.log(`Optimized Size: ${i} bytes`), n;
  });
}
async function k(e, t = "", s) {
  const r = c.resolve(process.cwd(), e), a = t ? c.resolve(process.cwd(), t) : "";
  console.log(`Resolved input path: ${r}`), console.log(`Resolved output path: ${a}`);
  try {
    const o = `${r.replace(/\\/g, "/")}/**/*.svg`, l = `${r.replace(/\\/g, "/")}/**/*.{png,jpg,jpeg}`;
    console.log(`Searching for SVG files with pattern: ${o}`), console.log(`Searching for image files with pattern: ${l}`);
    const n = await v(o, { onlyFiles: !0, dot: !0 }), i = await v(l, { onlyFiles: !0, dot: !0 });
    console.log(`Found SVG files: ${n}`), console.log(`Found image files: ${i}`), n.length === 0 && i.length === 0 && (console.error(`No files found matching ${r}`), process.exit(1)), n.forEach((p) => {
      j(p, a, s).catch((m) => {
        console.error(`Error processing SVG file ${p}: ${m.message}`);
      });
    }), i.forEach((p) => {
      B(p, a).catch((m) => {
        console.error(`Error processing image file ${p}: ${m.message}`);
      });
    });
  } catch (o) {
    console.error(`Error: ${o.message}`), process.exit(1);
  }
}
d.description("Toolkit for optimizing SVG and other image files, and generating components").argument("<input>", "Input file or directory").argument("[output]", "Output directory or file", "").option("--vue", "Generate Vue components from SVG files").option("--react", "Generate React components from SVG files").action(async (e, t, s) => {
  s.help ? f() : (e || (console.error("Error: Missing required argument <input>."), f(), process.exit(1)), await k(e, t, s));
});
d.on("--help", () => {
  f();
});
d.parse(process.argv);
