import sharp from 'sharp';
import fs from 'fs/promises'; // 使用异步文件操作
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ensureDirectoryExists } from './utils.js';
import { fileURLToPath } from 'url';

// 将 exec 函数 promisify，以便使用 async/await
const execPromise = promisify(exec);

// 获取当前模块的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 默认配置文件路径
const defaultConfigPath = path.resolve(__dirname, 'wsksvg.json');

// 加载默认配置
let config = await loadConfig(defaultConfigPath);

// 特定配置文件路径
const specificConfigPath = path.resolve(process.cwd(), 'wsksvg.json');
if (await fileExists(specificConfigPath)) {
  const specificConfig = await loadConfig(specificConfigPath);
  config = { ...config, ...specificConfig }; // 合并配置
}

async function loadConfig(filePath: string): Promise<any> {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

// 使用 gifsicle 优化 GIF 图像
async function optimizeGifWithGifsicle(inputPath: string, outputPath: string) {
  try {
    await execPromise(`gifsicle --optimize=${config.gif?.optimizeLevel || 3} --colors=${config.gif?.colors || 256} ${inputPath} -o ${outputPath}`);
    console.log(`GIF image optimized: ${inputPath} -> ${outputPath}`);
  } catch (error: any) {
    throw new Error(`Error optimizing GIF with gifsicle: ${error.stderr || error.message}`);
  }
}

// 处理 PNG、JPG、JPEG、WEBP 和 GIF 文件
export async function processImageFile(filePath: string, output: string, totalFiles: number, currentFileIndex: number) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileDir = path.dirname(filePath);
  const originalBuffer = await fs.readFile(filePath);
  const originalSize = Buffer.byteLength(originalBuffer);
  const outputDir = output ? path.resolve(process.cwd(), output) : fileDir;
  await ensureDirectoryExists(outputDir); // 确保输出目录存在
  const extname = path.extname(filePath).toLowerCase().slice(1); // 获取文件扩展名
  let outputPath = path.resolve(outputDir, `${fileName}.${extname}`);

  if (await fileExists(outputPath)) {
    outputPath = path.resolve(outputDir, `${fileName}.copy.${extname}`);
  }

  let optimizedBuffer: Buffer | undefined;
  let optimizedSize = originalSize;

  try {
    switch (extname) {
      case 'png':
        optimizedBuffer = await sharp(originalBuffer)
          .png({
            quality: config.png?.quality || 80,
            compressionLevel: config.png?.compressionLevel || 9,
            adaptiveFiltering: config.png?.adaptiveFiltering || true,
            palette: config.png?.palette || true,
            dither: config.png?.dither || 1
          })
          .toBuffer();
        break;

      case 'jpg':
      case 'jpeg':
        optimizedBuffer = await sharp(originalBuffer)
          .jpeg({
            quality: config.jpg?.quality || 80,
            mozjpeg: config.jpg?.mozjpeg || true,
            progressive: config.jpg?.progressive || true,
            trellisQuantisation: config.jpg?.trellisQuantisation || true
          })
          .toBuffer();
        break;

      case 'webp':
        optimizedBuffer = await sharp(originalBuffer)
          .webp({
            quality: config.webp?.quality || 80,
            lossless: config.webp?.lossless || false,
            alphaQuality: config.webp?.alphaQuality || 100
          })
          .toBuffer();
        break;

      case 'gif':
        const intermediatePath = path.resolve(outputDir, `${fileName}.intermediate.gif`);
        await sharp(originalBuffer).toFile(intermediatePath);
        await optimizeGifWithGifsicle(intermediatePath, outputPath);
        await fs.unlink(intermediatePath); // 删除中间文件
        break;

      default:
        console.error(`Unsupported image format: ${extname}`);
        process.exit(1);
    }

    if (extname !== 'gif') {
      await fs.writeFile(outputPath, optimizedBuffer!);
      optimizedSize = Buffer.byteLength(optimizedBuffer!);
      // console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputPath)}`);
      // console.log(`Original Size: ${originalSize} bytes`);
      // console.log(`Optimized Size: ${optimizedSize} bytes`);
    } else {
      // console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputPath)}`);
    }


  } catch (error: any) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
    process.exit(1);
  }

  return { originalSize, optimizedSize }; // 返回原始和优化后的大小
}
