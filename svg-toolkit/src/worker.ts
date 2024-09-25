import { parentPort, workerData } from 'worker_threads';
import { processSvgFile } from './processSvgFile.js';
import { processImageFile } from './processImageFile.js';
import path from 'path';

interface Options {
    vue: any;
    react: any;
    base: boolean;
    format: any;
}

async function processFile(filePath: string, output: string, options: Options, totalFiles: number, currentFileIndex: number): Promise<{ originalSize: number; optimizedSize: number }> {
    const extname = path.extname(filePath).toLowerCase();
    if (extname === '.svg') {
        const result:any = await processSvgFile(filePath, output, options, totalFiles, currentFileIndex);
  
        return { originalSize: result.originalSize, optimizedSize: result.optimizedSize };
    } else if (['.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
        const result:any = await processImageFile(filePath, output, totalFiles, currentFileIndex);
        return { originalSize: result?.originalSize, optimizedSize: result?.optimizedSize || 0 };
    } else {
        throw new Error(`Unsupported file type: ${extname}`);
    }
}

// 执行处理并发送结果
(async () => {
    try {
        const { filePath, output, options, totalFiles, currentFileIndex } = workerData;
        const { originalSize, optimizedSize } = await processFile(filePath, output, options, totalFiles, currentFileIndex);
        
        if (parentPort) {
            parentPort.postMessage({ status: 'done', filePath, originalSize, optimizedSize });
        } else {
            console.error('Error: parentPort is null');
        }
    } catch (error: any) {
        if (parentPort) {
            parentPort.postMessage({ status: 'error', error: error.message });
        } else {
            console.error('Error: parentPort is null', error);
        }
    }
})();
