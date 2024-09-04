// 处理图片
import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists } from './utils';
import sharp from 'sharp';

export async function processImageFile(filePath: string, output: string) {
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