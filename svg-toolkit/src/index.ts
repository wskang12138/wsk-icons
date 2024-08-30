import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import { transform } from '@svgr/core';
import camelCase from 'camelcase';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';
import sharp from 'sharp';

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

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// 显示帮助信息
const displayHelp = () => {
  console.log(`
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
  wsksvg ./rawSvg ./testReact --react
  wsksvg ./rawImages ./optimizedImages
  `);
};

// 将路径中的反斜杠替换为正斜杠
const normalizePath = (filePath: string) => filePath.replace(/\\/g, '/');

// 创建目录（如果不存在的话）
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 处理文件名以添加 .copy 后缀
const getOutputFilePath = (outputPath: string, fileName: string, extension: string) => {
  const outputFilePath = path.resolve(outputPath, `${fileName}${extension}`);
  // 如果文件已经存在，直接返回原路径；否则，添加 .copy 后缀
  return fs.existsSync(outputFilePath) ? path.resolve(outputPath, `${fileName}.copy${extension}`) : outputFilePath;
};

async function processSvgFile(filePath: string, output: string, options: { vue: any; react: any; }) {
  const svgContent = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.svg');
  const fileDir = path.dirname(filePath);

  // 计算原始文件大小
  const originalSize = Buffer.byteLength(svgContent, 'utf-8');

  // 选择优化配置
  const config = svgoConfig;

  const outputPath = output ? path.resolve(process.cwd(), output) : fileDir;
  ensureDirectoryExists(outputPath);

  if (options.vue) {
    // 生成 Vue 组件
    const componentName = camelCase(fileName, { pascalCase: true });
    const vueCode = `
<template>
  <svg xmlns="http://www.w3.org/2000/svg" v-html="icon"></svg>
</template>

<script setup>

const icon = \`${svgContent}\`;
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
    // 生成 React 组件
    const componentName = camelCase(fileName, { pascalCase: true });
    const jsxCode = await transform(svgContent, {
      plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
      icon: true,
      typescript: false
    }, { componentName });
    const outputFilePath = getOutputFilePath(outputPath, fileName, '.tsx');
    fs.writeFileSync(outputFilePath, jsxCode, 'utf-8');
    console.log(`Generated React component ${componentName}.tsx`);
  } else {
    // 默认优化 SVG 文件
    const result = optimize(svgContent, config as any);
    const optimizedSize = Buffer.byteLength(result.data, 'utf-8');
    const outputFilePath = getOutputFilePath(outputPath, fileName, '.svg');
    fs.writeFileSync(outputFilePath, result.data, 'utf-8');
    console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputFilePath)}`);
    console.log(`Original Size: ${originalSize} bytes`);
    console.log(`Optimized Size: ${optimizedSize} bytes`);
  }
}

// 处理 PNG 或 JPG 文件
async function processImageFile(filePath: string, output: string) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileDir = path.dirname(filePath);
  const originalBuffer = fs.readFileSync(filePath);

  // 计算原始文件大小
  const originalSize = Buffer.byteLength(originalBuffer);

  // 生成输出目录路径
  const outputDir = output ? path.resolve(process.cwd(), output) : fileDir;
  ensureDirectoryExists(outputDir); // 确保输出目录存在

  // 生成输出文件路径
  const extname = path.extname(filePath);
  let outputPath = path.resolve(outputDir, `${fileName}${extname}`);

  // 检查输出路径是否已存在
  if (fs.existsSync(outputPath)) {
    outputPath = path.resolve(outputDir, `${fileName}.copy${extname}`);
  }

  // 计算优化后的文件缓冲区
  const optimizedBuffer = await sharp(originalBuffer)
    .resize({ withoutEnlargement: true })  // 根据需要调整大小
    .toBuffer();

  // 写入优化后的文件
  fs.writeFileSync(outputPath, optimizedBuffer);

  // 打印优化信息
  const newSize = Buffer.byteLength(optimizedBuffer);
  console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputPath)}`);
  console.log(`Original Size: ${originalSize} bytes`);
  console.log(`Optimized Size: ${newSize} bytes`);
}

// 处理文件逻辑
async function processFile(filePath: string, output: string, options: { vue: any; react: any; }) {
  const extname = path.extname(filePath).toLowerCase();
  
  if (extname === '.svg' || extname === '.png' || extname === '.jpg' || extname === '.jpeg') {
    if (extname === '.svg') {
      await processSvgFile(filePath, output, options);
    } else {
      await processImageFile(filePath, output);
    }
  } else {
    console.error(`Unsupported file type: ${extname}`);
    process.exit(1);
  }
}

// 处理输入路径
async function handleSvgToolkit(input: string, output = '', options: { vue: any; react: any; }) {
  const originalInput = normalizePath(path.resolve(process.cwd(), input));
  const resolvedOutput = output ? normalizePath(path.resolve(process.cwd(), output)) : '';

  console.log(`Resolved input path: ${originalInput}`);
  console.log(`Resolved output path: ${resolvedOutput}`);

  try {
    if (fs.existsSync(originalInput)) {
      const stats = fs.statSync(originalInput);

      if (stats.isFile()) {
        // 处理单个文件
        await processFile(originalInput, resolvedOutput, options);
        return;
      }

      if (stats.isDirectory()) {
        // 处理目录下的所有匹配文件
        const files = await fg(`${originalInput}/**/*.{svg,png,jpg,jpeg}`, { onlyFiles: true, dot: true });
        if (files.length === 0) {
          throw new Error(`No files found in directory ${originalInput}`);
        }
        for (const file of files) {
          await processFile(file, resolvedOutput, options);
        }
        return;
      }
    }

    // 输入路径不是文件也不是目录，尝试模糊匹配
    const filePattern = `${path.dirname(originalInput)}/${path.basename(originalInput)}*.*`;
    console.log(`Searching for files with pattern: ${filePattern}`);
    const matchedFiles = await fg(filePattern, { onlyFiles: true, dot: true });

    if (matchedFiles.length === 0) {
      throw new Error(`No files found matching ${originalInput}`);
    }

    // 处理找到的文件
    for (const file of matchedFiles) {
      const stats = fs.statSync(file);
      if (stats.isFile()) {
        await processFile(file, resolvedOutput, options);
      }
    }

  } catch (err: any) {
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
    } else {
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
