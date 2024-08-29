import { optimize } from 'svgo';
import fs from 'fs';
import path from 'path';
import camelCase from 'camelcase';
import { fileURLToPath } from 'url';

import svgoConfig from '../svgo.config.js';
import svgoRawConfig from '../svgo.raw.config.js';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryDir = path.resolve(__dirname, '../rawSvg');
const outDir = path.resolve(__dirname, '../src/VueIcons');

// 确保输出目录存在
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 读取所有 SVG 文件
const files = fs.readdirSync(entryDir, 'utf-8');

// 处理 SVG 文件
const batches = files.filter(f => path.extname(f) === '.svg').map(async file => {
  try {
    const svgFileName = path.basename(file, '.svg');
    const componentName = camelCase(svgFileName, { pascalCase: true });
    const vueFileName = `${componentName}.vue`;
    const svgContent = fs.readFileSync(path.resolve(entryDir, file), 'utf-8');

    // 选择适当的 SVGO 配置
    const config = file.includes('-raw.svg') ? svgoRawConfig : svgoConfig;
    const result = optimize(svgContent, config);

    // 创建 Vue 组件模板
    const vueCode = `
<template>
  <svg xmlns="http://www.w3.org/2000/svg" v-html="icon" />
</template>

<script setup>
import { ref } from 'vue';

const icon = \`${result.data}\`;
</script>

<style scoped>
svg {
  width: 1em;
  height: 1em;
}
</style>
    `;

    // 将 Vue 组件写入文件
    fs.writeFileSync(path.resolve(outDir, vueFileName), vueCode, 'utf-8');
    return { fileName: vueFileName, componentName };
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
    throw error;
  }
});

// 生成 index.ts 文件
const arr = await Promise.all(batches);
const indexFileContent = arr.map(a => `export { default as ${a.componentName} } from './${a.componentName}.vue';`).join('\n');
fs.writeFileSync(path.resolve(outDir, 'index.ts'), indexFileContent, 'utf-8');

console.log('SVG to Vue components conversion completed successfully.');
