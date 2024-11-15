import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import { transform } from '@svgr/core';
import camelCase from 'camelcase';
import { ensureDirectoryExists, getOutputFilePath } from './utils.js';
import { Buffer } from 'buffer';
import sharp from 'sharp';
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
export async function processSvgFile(filePath, output, options, totalFiles, currentFileIndex) {
    const svgContent = fs.readFileSync(filePath, 'utf-8');
    let fileName = path.basename(filePath, '.svg');
    if (options.vue || options.react) {
        fileName = camelCase(fileName, { pascalCase: true });
    }
    const fileDir = path.dirname(filePath);
    // 计算原始文件大小
    const originalSize = Buffer.byteLength(svgContent, 'utf-8');
    const outputPath = output ? path.resolve(process.cwd(), output) : fileDir;
    ensureDirectoryExists(outputPath);
    let optimizedSize = originalSize;
    if (options.base) {
        const base64Data = Buffer.from(svgContent).toString('base64');
        const base64FileContent = `data:image/svg+xml;base64,${base64Data}`;
        const outputFilePath = getOutputFilePath(outputPath, fileName, '.txt');
        fs.writeFileSync(outputFilePath, base64FileContent, 'utf-8');
    }
    else if (options.vue || options.react) {
        const result = optimize(svgContent, config?.svgo);
        const componentCode = options.vue
            ? `
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
`
            : await transform(result.data, {
                plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
                icon: true,
                typescript: true
            }, { componentName: fileName });
        const outputFilePath = getOutputFilePath(outputPath, fileName, options.vue ? '.vue' : '.tsx');
        fs.writeFileSync(outputFilePath, componentCode, 'utf-8');
        optimizedSize = Buffer.byteLength(result.data, 'utf-8');
    }
    else if (options.format) {
        const outputFilePath = getOutputFilePath(outputPath, fileName, `.${options.format}`);
        await sharp(Buffer.from(svgContent)).toFile(outputFilePath);
        optimizedSize = Buffer.byteLength(svgContent, 'utf-8'); // 使用原始大小
    }
    else {
        const result = optimize(svgContent, config?.svgo);
        optimizedSize = Buffer.byteLength(result.data, 'utf-8');
        const outputFilePath = getOutputFilePath(outputPath, fileName, '.svg');
        fs.writeFileSync(outputFilePath, result.data, 'utf-8');
    }
    return { originalSize, optimizedSize, fileName };
}
