#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import { transform } from '@svgr/core';
import camelCase from 'camelcase';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';
import sharp from 'sharp';
const svgoRawConfig = {
    js2svg: {
        indent: 2, // string with spaces or number of spaces. 4 by default
        pretty: true, // boolean, false by default
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
            name: 'removeAttrs',
            params: { attrs: ['svg:width', 'svg:height'] }
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
const svgoConfig = {
    js2svg: {
        indent: 2, // string with spaces or number of spaces. 4 by default
        pretty: true, // boolean, false by default
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
            params: { currentColor: /^(?!url|none)./ },
        },
        {
            name: 'removeAttrs',
            params: { attrs: ['opacity', 'svg:width', 'svg:height'] }
        },
        {
            name: 'addAttributesToSVGElement',
            params: {
                attributes: [{
                        fill: 'currentColor',
                        width: '1em',
                        height: '1em',
                        'aria-hidden': true,
                        focusable: 'false',
                    }]
            }
        }
    ],
};
// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const program = new Command();
// 显示帮助信息
const displayHelp = () => {
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
  svg-toolkit ./rawSvg ./testReact --react
  svg-toolkit ./rawImages ./optimizedImages
  `);
};
// 处理 SVG 文件
async function processSvgFile(filePath, output, options) {
    const svgContent = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.svg');
    const fileDir = path.dirname(filePath);
    // 计算原始文件大小
    const originalSize = Buffer.byteLength(svgContent, 'utf-8');
    // 选择优化配置
    const config = filePath.includes('-raw.svg') ? svgoRawConfig : svgoConfig;
    if (options.vue) {
        // 生成 Vue 组件
        const componentName = camelCase(fileName, { pascalCase: true });
        const vueCode = `
<template>
  <svg xmlns="http://www.w3.org/2000/svg" v-html="icon" />
</template>

<script setup>
import { ref } from 'vue';

const icon = \`${svgContent}\`;
</script>

<style scoped>
svg {
  width: 1em;
  height: 1em;
}
</style>
    `;
        const outputPath = output ? path.resolve(process.cwd(), output, `${componentName}.vue`) : path.resolve(fileDir, `${fileName}.copy.vue`);
        fs.writeFileSync(outputPath, vueCode, 'utf-8');
        console.log(`Generated Vue component ${componentName}.vue`);
    }
    else if (options.react) {
        // 生成 React 组件
        const componentName = camelCase(fileName, { pascalCase: true });
        const jsxCode = await transform(svgContent, {
            plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
            icon: true,
            typescript: false
        }, { componentName });
        const outputPath = output ? path.resolve(process.cwd(), output, `${componentName}.tsx`) : path.resolve(fileDir, `${fileName}.copy.tsx`);
        fs.writeFileSync(outputPath, jsxCode, 'utf-8');
        console.log(`Generated React component ${componentName}.tsx`);
    }
    else {
        // 默认优化 SVG 文件
        const result = optimize(svgContent, config);
        const optimizedSize = Buffer.byteLength(result.data, 'utf-8');
        const outputPath = output ? path.resolve(process.cwd(), output, `${fileName}.copy.svg`) : path.resolve(fileDir, `${fileName}.copy.svg`);
        fs.writeFileSync(outputPath, result.data, 'utf-8');
        console.log(`Optimized ${path.basename(filePath)} -> ${outputPath}`);
        console.log(`Original Size: ${originalSize} bytes`);
        console.log(`Optimized Size: ${optimizedSize} bytes`);
    }
}
// 处理 PNG 或 JPG 文件
async function processImageFile(filePath, output) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileDir = path.dirname(filePath);
    const originalBuffer = fs.readFileSync(filePath);
    // 计算原始文件大小
    const originalSize = Buffer.byteLength(originalBuffer);
    let outputPath;
    const optimizedBuffer = await sharp(originalBuffer)
        .resize({ withoutEnlargement: true }) // 根据需要调整大小
        .toBuffer()
        .then(buffer => {
        const newSize = Buffer.byteLength(buffer);
        outputPath = output ? path.resolve(process.cwd(), output, `${fileName}.copy${path.extname(filePath)}`) : path.resolve(fileDir, `${fileName}.copy${path.extname(filePath)}`);
        fs.writeFileSync(outputPath, buffer);
        console.log(`Optimized ${path.basename(filePath)} -> ${outputPath}`);
        console.log(`Original Size: ${originalSize} bytes`);
        console.log(`Optimized Size: ${newSize} bytes`);
        return buffer;
    });
}
// 主处理逻辑
async function handleSvgToolkit(input, output = '', options) {
    // 解析路径
    const resolvedInput = path.resolve(process.cwd(), input);
    const resolvedOutput = output ? path.resolve(process.cwd(), output) : '';
    // 打印调试信息
    console.log(`Resolved input path: ${resolvedInput}`);
    console.log(`Resolved output path: ${resolvedOutput}`);
    // 使用 fast-glob 进行模糊匹配
    try {
        // 确保使用正确的模式匹配文件
        const svgPattern = `${resolvedInput.replace(/\\/g, '/')}/**/*.svg`;
        const imagePattern = `${resolvedInput.replace(/\\/g, '/')}/**/*.{png,jpg,jpeg}`;
        console.log(`Searching for SVG files with pattern: ${svgPattern}`);
        console.log(`Searching for image files with pattern: ${imagePattern}`);
        const svgFiles = await fg(svgPattern, { onlyFiles: true, dot: true });
        const imageFiles = await fg(imagePattern, { onlyFiles: true, dot: true });
        console.log(`Found SVG files: ${svgFiles}`);
        console.log(`Found image files: ${imageFiles}`);
        if (svgFiles.length === 0 && imageFiles.length === 0) {
            console.error(`No files found matching ${resolvedInput}`);
            process.exit(1);
        }
        svgFiles.forEach(file => {
            processSvgFile(file, resolvedOutput, options).catch(error => {
                console.error(`Error processing SVG file ${file}: ${error.message}`);
            });
        });
        imageFiles.forEach(file => {
            processImageFile(file, resolvedOutput).catch(error => {
                console.error(`Error processing image file ${file}: ${error.message}`);
            });
        });
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}
// 定义默认命令
program
    .description('Toolkit for optimizing SVG and other image files, and generating components')
    .argument('<input>', 'Input file or directory')
    .argument('[output]', 'Output directory or file', '')
    .option('--vue', 'Generate Vue components from SVG files')
    .option('--react', 'Generate React components from SVG files')
    .action(async (input, output, options) => {
    if (options.help) {
        displayHelp();
    }
    else {
        if (!input) {
            console.error('Error: Missing required argument <input>.');
            displayHelp();
            process.exit(1);
        }
        await handleSvgToolkit(input, output, options);
    }
});
// 显示默认帮助信息
program.on('--help', () => {
    displayHelp();
});
program.parse(process.argv);
