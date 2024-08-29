#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const svgo_1 = require("svgo");
const core_1 = require("@svgr/core");
const camelcase_1 = __importDefault(require("camelcase"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const sharp_1 = __importDefault(require("sharp"));
const svgo_config_js_1 = __importDefault(require("../svgo.config.js"));
const svgo_raw_config_js_1 = __importDefault(require("../svgo.raw.config.js"));
// 获取 __dirname
const program = new commander_1.Command();
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
function processSvgFile(filePath, output, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const svgContent = fs_1.default.readFileSync(filePath, 'utf-8');
        const fileName = path_1.default.basename(filePath, '.svg');
        const fileDir = path_1.default.dirname(filePath);
        // 计算原始文件大小
        const originalSize = Buffer.byteLength(svgContent, 'utf-8');
        // 选择优化配置
        const config = filePath.includes('-raw.svg') ? svgo_raw_config_js_1.default : svgo_config_js_1.default;
        if (options.vue) {
            // 生成 Vue 组件
            const componentName = (0, camelcase_1.default)(fileName, { pascalCase: true });
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
            const outputPath = output ? path_1.default.resolve(process.cwd(), output, `${componentName}.vue`) : path_1.default.resolve(fileDir, `${fileName}.copy.vue`);
            fs_1.default.writeFileSync(outputPath, vueCode, 'utf-8');
            console.log(`Generated Vue component ${componentName}.vue`);
        }
        else if (options.react) {
            // 生成 React 组件
            const componentName = (0, camelcase_1.default)(fileName, { pascalCase: true });
            const jsxCode = yield (0, core_1.transform)(svgContent, {
                plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
                icon: true,
                typescript: false
            }, { componentName });
            const outputPath = output ? path_1.default.resolve(process.cwd(), output, `${componentName}.tsx`) : path_1.default.resolve(fileDir, `${fileName}.copy.tsx`);
            fs_1.default.writeFileSync(outputPath, jsxCode, 'utf-8');
            console.log(`Generated React component ${componentName}.tsx`);
        }
        else {
            // 默认优化 SVG 文件
            const result = (0, svgo_1.optimize)(svgContent, config);
            const optimizedSize = Buffer.byteLength(result.data, 'utf-8');
            const outputPath = output ? path_1.default.resolve(process.cwd(), output, `${fileName}.copy.svg`) : path_1.default.resolve(fileDir, `${fileName}.copy.svg`);
            fs_1.default.writeFileSync(outputPath, result.data, 'utf-8');
            console.log(`Optimized ${path_1.default.basename(filePath)} -> ${outputPath}`);
            console.log(`Original Size: ${originalSize} bytes`);
            console.log(`Optimized Size: ${optimizedSize} bytes`);
        }
    });
}
// 处理 PNG 或 JPG 文件
function processImageFile(filePath, output) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = path_1.default.basename(filePath, path_1.default.extname(filePath));
        const fileDir = path_1.default.dirname(filePath);
        const originalBuffer = fs_1.default.readFileSync(filePath);
        // 计算原始文件大小
        const originalSize = Buffer.byteLength(originalBuffer);
        let outputPath;
        const optimizedBuffer = yield (0, sharp_1.default)(originalBuffer)
            .resize({ withoutEnlargement: true }) // 根据需要调整大小
            .toBuffer()
            .then(buffer => {
            const newSize = Buffer.byteLength(buffer);
            outputPath = output ? path_1.default.resolve(process.cwd(), output, `${fileName}.copy${path_1.default.extname(filePath)}`) : path_1.default.resolve(fileDir, `${fileName}.copy${path_1.default.extname(filePath)}`);
            fs_1.default.writeFileSync(outputPath, buffer);
            console.log(`Optimized ${path_1.default.basename(filePath)} -> ${outputPath}`);
            console.log(`Original Size: ${originalSize} bytes`);
            console.log(`Optimized Size: ${newSize} bytes`);
            return buffer;
        });
    });
}
// 主处理逻辑
function handleSvgToolkit(input_1) {
    return __awaiter(this, arguments, void 0, function* (input, output = '', options) {
        // 解析路径
        const resolvedInput = path_1.default.resolve(process.cwd(), input);
        const resolvedOutput = output ? path_1.default.resolve(process.cwd(), output) : '';
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
            const svgFiles = yield (0, fast_glob_1.default)(svgPattern, { onlyFiles: true, dot: true });
            const imageFiles = yield (0, fast_glob_1.default)(imagePattern, { onlyFiles: true, dot: true });
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
    });
}
// 定义默认命令
program
    .description('Toolkit for optimizing SVG and other image files, and generating components')
    .argument('<input>', 'Input file or directory')
    .argument('[output]', 'Output directory or file', '')
    .option('--vue', 'Generate Vue components from SVG files')
    .option('--react', 'Generate React components from SVG files')
    .action((input, output, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (options.help) {
        displayHelp();
    }
    else {
        if (!input) {
            console.error('Error: Missing required argument <input>.');
            displayHelp();
            process.exit(1);
        }
        yield handleSvgToolkit(input, output, options);
    }
}));
// 显示默认帮助信息
program.on('--help', () => {
    displayHelp();
});
program.parse(process.argv);
