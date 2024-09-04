#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';
import { displayHelp } from './help';
import { processImageFile } from './processImageFile';
import { normalizePath } from './utils';
import { processSvgFile } from './processSvgFile';
// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// 处理文件逻辑
async function processFile(filePath: string, output: string, options: { vue: any; react: any; base: boolean; }) {
  const extname = path.extname(filePath).toLowerCase();

  // 判断是否是支持的图片格式
  if (['.svg', '.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
    if (extname === '.svg') {
      // 处理SVG文件
      await processSvgFile(filePath, output, options);
    } else if (extname === '.gif') {
      // 处理GIF文件
      await processImageFile(filePath, output);
    } else {
      // 处理其他图片格式（PNG, JPG, JPEG）
      await processImageFile(filePath, output);
    }
  } else {
    console.error(`Unsupported file type: ${extname}`);
    process.exit(1);
  }
}

// 处理输入路径
async function handleSvgToolkit(input: string, output = '', options: { vue: any; react: any; base: boolean; }) {
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
        const files = await fg(`${originalInput}/**/*.{svg,png,jpg,jpeg,gif}`, { onlyFiles: true, dot: true });
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
  .option('--base', 'Convert SVG files to Base64 encoded data')
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
