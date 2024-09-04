import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import { transform } from '@svgr/core';
import camelCase from 'camelcase';
import { ensureDirectoryExists, getOutputFilePath } from "./utils.js";
import { Buffer } from 'buffer';
// SVGO 配置
const svgoConfig = {
    js2svg: {
        indent: 2,
        pretty: true,
    },
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    removeViewBox: false, // 保持 viewBox
                    inlineStyles: {
                        onlyMatchedOnce: false,
                    },
                },
            },
        },
        {
            name: 'convertStyleToAttrs',
            params: {
                onlyMatchedOnce: false,
            },
        },
        {
            name: 'removeAttrs',
            params: {
                attrs: ['svg:style'], // 可选：移除内联样式，但保留 width 和 height
            },
        },
        {
            name: 'addAttributesToSVGElement',
            params: {
                attributes: [{
                    width: '1em',
                    height: '1em',
                    'aria-hidden': true,
                    focusable: 'false',
                }]
            }
        }
    ],
};

const svgoComConfig = {
    js2svg: {
        indent: 2,
        pretty: true,
    },
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    removeViewBox: false,
                    inlineStyles: {
                        onlyMatchedOnce: false,
                    },
                },
            },
        },
        'removeXMLNS',
        'convertStyleToAttrs',
        {
            name: 'convertColors',
            params: {
                attrs: ['svg:style'], // 可选：移除内联样式，但保留 width 和 height
            },
        },
        {
            name: 'removeAttrs',
            params: { attrs: ['opacity'] }, // 移除不需要的 opacity 属性，但保留 width 和 height
        },
        {
            name: 'addAttributesToSVGElement',
            params: {
                attributes: [{
                    'aria-hidden': true,
                    focusable: 'false',
                    // 不设置 width 和 height，以保持原始大小
                }]
            }
        }
    ],
};

export async function processSvgFile(filePath: string, output: string, options: { vue: any; react: any; base: boolean; }) {
    const svgContent = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.svg');
    const fileDir = path.dirname(filePath);
  
    // 计算原始文件大小
    const originalSize = Buffer.byteLength(svgContent, 'utf-8');
  
    // 选择优化配置
    let config = svgoConfig;
  
    // 生成输出路径
    const outputPath = output ? path.resolve(process.cwd(), output) : fileDir;
    ensureDirectoryExists(outputPath);
  
    if (options.base) {
      // 转换为Base64并保存到文件
      const base64Data = Buffer.from(svgContent).toString('base64');
      const base64FileContent = `data:image/svg+xml;base64,${base64Data}`;
      const outputFilePath = getOutputFilePath(outputPath, fileName, '.txt'); // 保存为.txt文件
      fs.writeFileSync(outputFilePath, base64FileContent, 'utf-8');
      console.log(`Generated Base64 file ${path.basename(outputFilePath)}`);
      console.log(`Original Size: ${originalSize} bytes`);
      console.log(`Base64 Size: ${Buffer.byteLength(base64FileContent, 'utf-8')} bytes`);
    } else if (options.vue) {
      // 生成Vue组件
      const componentName = camelCase(fileName, { pascalCase: true });
      const result = optimize(svgContent, svgoComConfig as any);
      const vueCode = `
  <template>
    <svg xmlns="http://www.w3.org/2000/svg" v-html="icon"></svg>
  </template>
  
  <script setup>
  
  const icon = \`${result.data}\`;
  </script>
  
  <style scoped>
  svg {
    width: 1em;
    height: 1em;
  }
  </style>
      `;
      const outputFilePath = getOutputFilePath(outputPath, fileName, '.vue');
      fs.writeFileSync(outputFilePath, vueCode, 'utf-8');
      console.log(`Generated Vue component ${componentName}.vue`);
    } else if (options.react) {
      // 生成React组件
      const componentName = camelCase(fileName, { pascalCase: true });
      const result = optimize(svgContent, svgoComConfig as any);
      const jsxCode = await transform(result.data, {
        plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
        icon: true,
        typescript: false
      }, { componentName });
      const outputFilePath = getOutputFilePath(outputPath, fileName, '.tsx');
      fs.writeFileSync(outputFilePath, jsxCode, 'utf-8');
      console.log(`Generated React component ${componentName}.tsx`);
    } else {
      // 默认优化SVG文件
      const result = optimize(svgContent, config as any);
      const optimizedSize = Buffer.byteLength(result.data, 'utf-8');
      const outputFilePath = getOutputFilePath(outputPath, fileName, '.svg');
      fs.writeFileSync(outputFilePath, result.data, 'utf-8');
      console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputFilePath)}`);
      console.log(`Original Size: ${originalSize} bytes`);
      console.log(`Optimized Size: ${optimizedSize} bytes`);
    }
  }