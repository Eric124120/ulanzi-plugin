import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function generateRandomPort() {
    const minPort = 49152; // 1024以上的随机端口
    const maxPort = 65535; // 最大的IP端口数
    const randomBuffer = crypto.randomBytes(2);
    const randomPort = minPort + randomBuffer.readUInt16BE(0) % (maxPort - minPort);
    return randomPort;
}

export function writePort(port, status) {
    return new Promise((resolve, reject) => {
        // 要写入的内容
        const content = `window.__port = ${port};`;
        // 文件路径
        // console.log(__filename)
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.resolve(__dirname, '../../') + '\\ws-port.js';
        // 写入文件
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                console.error('写入文件时发生错误:', err);
                reject(err);
            } else {
                console.log('文件写入成功');
                resolve({port, status});
            }
        });
    })
}

export function createRandomPort() {
    const randomPort = generateRandomPort();
     return writePort(randomPort, '1');
}