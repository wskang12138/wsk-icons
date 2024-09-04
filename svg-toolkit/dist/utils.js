// 处理图片
import fs from 'fs';
import path from 'path';
// 创建目录（如果不存在的话）
export const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};
// 处理文件名以添加 .copy 后缀
export const getOutputFilePath = (outputPath, fileName, extension) => {
    const outputFilePath = path.resolve(outputPath, `${fileName}${extension}`);
    // 如果文件已经存在，直接返回原路径；否则，添加 .copy 后缀
    return fs.existsSync(outputFilePath) ? path.resolve(outputPath, `${fileName}.copy${extension}`) : outputFilePath;
};
// 将路径中的反斜杠替换为正斜杠
export const normalizePath = (filePath) => filePath.replace(/\\/g, '/');
