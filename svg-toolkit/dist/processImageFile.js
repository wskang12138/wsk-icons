import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ensureDirectoryExists } from './utils';
const execPromise = promisify(exec);
async function optimizeGifWithGifsicle(inputPath, outputPath) {
    try {
        await execPromise(`gifsicle --optimize=3 ${inputPath} > ${outputPath}`);
        console.log(`GIF optimized: ${inputPath} -> ${outputPath}`);
    }
    catch (error) {
        throw new Error(`Error optimizing GIF with gifsicle: ${error.stderr || error.message}`);
    }
}
// 处理PNG、JPG、JPEG、WEBP和GIF文件
export async function processImageFile(filePath, output) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileDir = path.dirname(filePath);
    const originalBuffer = fs.readFileSync(filePath);
    // 计算原始文件大小
    const originalSize = Buffer.byteLength(originalBuffer);
    // 生成输出目录路径
    const outputDir = output ? path.resolve(process.cwd(), output) : fileDir;
    ensureDirectoryExists(outputDir); // 确保输出目录存在
    // 生成输出文件路径
    const extname = path.extname(filePath).toLowerCase();
    let outputPath = path.resolve(outputDir, `${fileName}${extname}`);
    // 检查输出路径是否已存在
    if (fs.existsSync(outputPath)) {
        outputPath = path.resolve(outputDir, `${fileName}.copy${extname}`);
    }
    let optimizedBuffer;
    try {
        switch (extname) {
            case '.png':
                optimizedBuffer = await sharp(originalBuffer)
                    .png({ quality: 80, compressionLevel: 9 }) // 优化PNG图像
                    .toBuffer();
                break;
            case '.jpg':
            case '.jpeg':
                optimizedBuffer = await sharp(originalBuffer)
                    .jpeg({ quality: 80, mozjpeg: true }) // 优化JPG/JPEG图像
                    .toBuffer();
                break;
            case '.webp':
                optimizedBuffer = await sharp(originalBuffer)
                    .webp({ quality: 80 }) // 优化WEBP图像
                    .toBuffer();
                break;
            case '.gif':
                // 先使用 sharp 处理图像以生成中间文件
                const intermediatePath = path.resolve(outputDir, `${fileName}.intermediate.gif`);
                await sharp(originalBuffer).toFile(intermediatePath);
                await optimizeGifWithGifsicle(intermediatePath, outputPath);
                fs.unlinkSync(intermediatePath); // 删除中间文件
                return; // 对于GIF，处理完后直接返回，不需要写入优化后的文件
            default:
                throw new Error(`Unsupported image format: ${extname}`);
        }
        if (optimizedBuffer) {
            // 写入优化后的文件（非GIF图像）
            fs.writeFileSync(outputPath, optimizedBuffer);
            // 打印优化信息
            const newSize = Buffer.byteLength(optimizedBuffer);
            console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputPath)}`);
            console.log(`Original Size: ${originalSize} bytes`);
            console.log(`Optimized Size: ${newSize} bytes`);
        }
        else {
            console.error(`No optimized buffer found for ${filePath}`);
        }
    }
    catch (error) {
        console.error(`Error processing file ${filePath}: ${error.message}`);
    }
}
