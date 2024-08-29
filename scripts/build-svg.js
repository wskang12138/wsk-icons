import { optimize } from 'svgo';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entryDir = path.resolve(__dirname, '../rawSvg'); // 输入目录
const outDir = path.resolve(__dirname, '../src/optimizedSvg'); // 输出目录

// 确保输出目录存在
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 读取所有 SVG 文件
const files = fs.readdirSync(entryDir, 'utf-8');

// 处理 SVG 文件
const processFiles = files.filter(f => path.extname(f) === '.svg').map(async file => {
  try {
    const filePath = path.resolve(entryDir, file);
    const svgContent = fs.readFileSync(filePath, 'utf-8');

    // 优化 SVG 内容
    const result = optimize(svgContent, {
      multipass: true, // 多次优化
      // 其他配置选项可以在这里添加
    });

    // 写入优化后的 SVG 文件
    const outputPath = path.resolve(outDir, file);
    fs.writeFileSync(outputPath, result.data, 'utf-8');
    console.log(`Optimized ${file}`);
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
  }
});

// 等待所有文件处理完成
await Promise.all(processFiles);

console.log('SVG optimization completed successfully.');
