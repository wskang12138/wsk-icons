import sharp from 'sharp';
import fs from 'fs';
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
// 使用 gifsicle 优化 GIF 图像
async function optimizeGifWithGifsicle(inputPath, outputPath) {
    try {
        await execPromise(`gifsicle --optimize=${config.gif?.optimizeLevel || 3} --colors=${config.gif?.colors || 256} ${inputPath} > ${outputPath}`);
        console.log(`GIF image optimized: ${inputPath} -> ${outputPath}`);
    }
    catch (error) {
        throw new Error(`Error optimizing GIF with gifsicle: ${error.stderr || error.message}`);
    }
}
// 处理 PNG、JPG、JPEG、WEBP 和 GIF 文件
export async function processImageFile(filePath, output) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileDir = path.dirname(filePath);
    const originalBuffer = fs.readFileSync(filePath);
    const originalSize = Buffer.byteLength(originalBuffer);
    const outputDir = output ? path.resolve(process.cwd(), output) : fileDir;
    ensureDirectoryExists(outputDir); // 确保输出目录存在
    const extname = path.extname(filePath).toLowerCase().slice(1); // 获取文件扩展名
    let outputPath = path.resolve(outputDir, `${fileName}.${extname}`);
    if (fs.existsSync(outputPath)) {
        outputPath = path.resolve(outputDir, `${fileName}.copy.${extname}`);
    }
    let optimizedBuffer;
    try {
        switch (extname) {
            case 'png':
                optimizedBuffer = await sharp(originalBuffer)
                    .png({
                    quality: config.png?.quality || 80, // PNG image quality
                    compressionLevel: config.png?.compressionLevel || 9, // Compression level
                    adaptiveFiltering: config.png?.adaptiveFiltering || true, // Adaptive filtering
                    palette: config.png?.palette || true, // Palette
                    dither: config.png?.dither || 1 // Dithering
                })
                    .toBuffer();
                break;
            case 'jpg':
            case 'jpeg':
                optimizedBuffer = await sharp(originalBuffer)
                    .jpeg({
                    quality: config.jpg?.quality || 80, // JPEG image quality
                    mozjpeg: config.jpg?.mozjpeg || true, // Use mozjpeg
                    progressive: config.jpg?.progressive || true, // Progressive encoding
                    trellisQuantisation: config.jpg?.trellisQuantisation || true // Trellis quantization
                })
                    .toBuffer();
                break;
            case 'webp':
                optimizedBuffer = await sharp(originalBuffer)
                    .webp({
                    quality: config.webp?.quality || 80, // WEBP image quality
                    lossless: config.webp?.lossless || false, // Lossless compression
                    alphaQuality: config.webp?.alphaQuality || 100 // Alpha quality
                })
                    .toBuffer();
                break;
            case 'gif':
                // 使用 sharp 生成中间文件
                const intermediatePath = path.resolve(outputDir, `${fileName}.intermediate.gif`);
                await sharp(originalBuffer).toFile(intermediatePath);
                // 使用 gifsicle 优化 GIF 图像
                await optimizeGifWithGifsicle(intermediatePath, outputPath);
                fs.unlinkSync(intermediatePath); // 删除中间文件
                break;
            default:
                console.error(`Unsupported image format: ${extname}`);
                process.exit(1);
        }
        if (extname !== 'gif') {
            // 对于非 GIF 图像，写入优化后的文件
            fs.writeFileSync(outputPath, optimizedBuffer);
            const newSize = Buffer.byteLength(optimizedBuffer);
            console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputPath)}`);
            console.log(`Original Size: ${originalSize} bytes`);
            console.log(`Optimized Size: ${newSize} bytes`);
        }
        else {
            // 对于 GIF 图像，直接输出优化信息
            console.log(`Optimized ${path.basename(filePath)} -> ${path.basename(outputPath)}`);
        }
    }
    catch (error) {
        console.error(`Error processing file ${filePath}: ${error.message}`);
        process.exit(1);
    }
}
