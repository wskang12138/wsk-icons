#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';
import { Worker } from 'worker_threads';
import os from 'os';
import { normalizePath } from './utils.js';
import { displayHelp } from './help.js';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// 动态设置最大并发数
const MAX_CONCURRENT_WORKERS = Math.max(os.cpus().length - 2, 1); // 使用 CPU 核心数，至少为 1

// 处理文件逻辑
function processFile(filePath: string, output: string, options: { vue?: boolean; react?: boolean; format?: string; base?: boolean }): Promise<void> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: { filePath, output, options },
    });

    worker.on('message', (message) => {
      resolve(message);
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// 处理输入路径
async function handleSvgToolkit(
  input: string,
  output: string = '',
  options: { vue?: boolean; react?: boolean; format?: string; base?: boolean }
): Promise<void> {
  const originalInput = normalizePath(path.resolve(process.cwd(), input));
  const resolvedOutput = output ? normalizePath(path.resolve(process.cwd(), output)) : '';

  console.log(`Resolved input path: ${originalInput}`);
  console.log(`Resolved output path: ${resolvedOutput}`);

  let successCount = 0;
  let failureCount = 0;
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let componentNames: string[] = []; // 收集生成的组件名

  try {
    const files = await getInputFiles(originalInput);
    console.log(`Processing ${files.length} files...`);

    // 批量处理文件的 Promise 数组
    const processingPromises: Promise<void>[] = [];

    for (const file of files) {
      let originalSize = fs.statSync(file).size; // 获取原始文件大小
      totalOriginalSize += originalSize;
      const promise = processFile(file, resolvedOutput, options)
        .then((result: any) => {
          successCount++;
          let optimizedSize = result?.optimizedSize || 0; // 确保存在优化后的大小
          totalOptimizedSize += optimizedSize;
          componentNames.push(result?.fileName); // 收集组件名
          updateProgress(successCount, failureCount, files.length);
        })
        .catch((error) => {
          failureCount++;
          updateProgress(successCount, failureCount, files.length);
        });

      processingPromises.push(promise);

      // 当达到最大并发数时，等待所有 Promise 完成
      if (processingPromises.length >= MAX_CONCURRENT_WORKERS) {
        await Promise.all(processingPromises);
        processingPromises.length = 0; // 清空已完成的 Promise
      }
    }

    // 等待最后一批 Promise 完成
     await Promise.all(processingPromises);
    if (options.vue || options.react) {
      const indexFileContent = componentNames.map((name) => `export { default as ${name} } from './${options.vue?name+'.vue':name}';`).join('\n')
      fs.writeFileSync(resolve(resolvedOutput, 'index.ts'), indexFileContent, 'utf-8')
    }

    console.log(`\nAll files processed successfully. Success: ${successCount}, Failures: ${failureCount}.`);
    console.log(`Total Original Size: ${totalOriginalSize} bytes`);
    console.log(`Total Optimized Size: ${totalOptimizedSize} bytes`);
    const optimizationPercent = totalOriginalSize > 0 ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2) : 0;
    console.log(`Optimization Percentage: ${optimizationPercent}%`);

  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function getInputFiles(inputPath: string): Promise<string[]> {
  if (fs.existsSync(inputPath)) {
    const stats = fs.statSync(inputPath);
    if (stats.isFile()) {
      return [inputPath];
    } else if (stats.isDirectory()) {
      const files = await fg(`${inputPath}/**/*.{svg,png,jpg,jpeg,gif,webp,tiff,bmp}`, { onlyFiles: true, dot: true });
      if (files.length === 0) {
        throw new Error(`No files found in directory ${inputPath}`);
      }
      return files;
    }
  }

  const filePattern = `${path.dirname(inputPath)}/${path.basename(inputPath)}*.*`;
  console.log(`Searching for files with pattern: ${filePattern}`);
  const matchedFiles = await fg(filePattern, { onlyFiles: true, dot: true });
  if (matchedFiles.length === 0) {
    throw new Error(`No files found matching ${inputPath}`);
  }
  return matchedFiles;
}

function updateProgress(successCount: number, failureCount: number, total: number) {
  const percent = ((successCount + failureCount) / total) * 100;
  process.stdout.write(`\rProgress: ${percent.toFixed(2)}% (Success: ${successCount}, Failures: ${failureCount})`);
}

// 支持的格式列表
const supportedFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'tiff', 'bmp'];

// 定义默认命令
program
  .description('Toolkit for optimizing SVG and other image files, and generating components')
  .argument('<input>', 'Input file or directory')
  .argument('[output]', 'Output directory or file', '')
  .option('--vue', 'Generate Vue components from SVG files')
  .option('--react', 'Generate React components from SVG files')
  .option('--base', 'Convert SVG files to Base64 encoded data')
  .option('--format <format>', 'Convert SVG files to specified format (png, jpg, webp, gif, tiff, bmp)')
  .action(async (input, output, options) => {
    if (options.help) {
      displayHelp();
    } else {
      if (!input) {
        console.error('Error: Missing required argument <input>.');
        displayHelp();
        process.exit(1);
      }
      if (options.format && !supportedFormats.includes(options.format.toLowerCase())) {
        console.error(`Error: Unsupported format "${options.format}". Supported formats are: ${supportedFormats.join(', ')}.`);
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
