import fs from 'fs';
import path from 'path';
//写入错误日志
// 日志文件路径
const logFilePath = path.resolve(process.cwd(), 'wskplugin.log');
// 写入日志的函数
export function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf-8');
}
