import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import { transform } from '@svgr/core';
import camelCase from 'camelcase';
import { ensureDirectoryExists, getOutputFilePath } from "./utils.js";
import { Buffer } from 'buffer';
// SVGO 配置
import { fileURLToPath } from 'url';
// 获取当前模块的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 默认配置文件路径
const defaultConfigPath = path.resolve(__dirname, 'wsksvg.json');
// 加载默认配置
const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'));
// 特定配置文件路径
const specificConfigPath = path.resolve(process.cwd(), 'wsksvg.json');
let config = { ...defaultConfig };
// 合并特定配置与默认配置
const mergeConfig = (defaultConfig, specificConfig) => {
    return { ...defaultConfig, ...specificConfig };
};
// 如果存在特定配置文件，则加载并合并配置
if (fs.existsSync(specificConfigPath)) {
    const specificConfig = JSON.parse(fs.readFileSync(specificConfigPath, 'utf-8'));
    config = mergeConfig(defaultConfig, specificConfig);
}
export async function processSvgFile(filePath, output, options) {
    const svgContent = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.svg');
    const fileDir = path.dirname(filePath);
    // 计算原始文件大小
    const originalSize = Buffer.byteLength(svgContent, 'utf-8');
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
    }
    else if (options.vue) {
        // 生成Vue组件
        const componentName = camelCase(fileName, { pascalCase: true });
        const result = optimize(svgContent, config?.svgo);
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
    }
    else if (options.react) {
        // 生成React组件
        const componentName = camelCase(fileName, { pascalCase: true });
        const result = optimize(svgContent, config?.svgo);
        const jsxCode = await transform(result.data, {
            plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
            icon: true,
            typescript: false
        }, { componentName });
        const outputFilePath = getOutputFilePath(outputPath, fileName, '.tsx');
        fs.writeFileSync(outputFilePath, jsxCode, 'utf-8');
        console.log(`Generated React component ${componentName}.tsx`);
    }
    else {
        // 默认优化SVG文件
        const result = optimize(svgContent, config?.svgo);
        const optimizedSize = Buffer.byteLength(result.data, 'utf-8');
        const outputFilePath = getOutputFilePath(outputPath, fileName, '.svg');
        fs.writeFileSync(outputFilePath, result.data, 'utf-8');
        console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputFilePath)}`);
        console.log(`Original Size: ${originalSize} bytes`);
        console.log(`Optimized Size: ${optimizedSize} bytes`);
    }
}
