const { exec } = require('child_process');
const path = require('path');

// 如果 Electron 已经全局安装，可以直接使用全局路径
const electronPath = 'electron'; // 或者提供全局路径，例如 'C:\\path\\to\\electron'

// 获取主进程文件的路径
const mainPath = path.join(__dirname, 'main.js');

// 启动 Electron 应用，并添加 --no-sandbox 参数
exec(`${electronPath} ${mainPath} --no-sandbox`, (error, stdout, stderr) => {
  if (error) {
    console.error(`执行出错: ${error}`);
    return;
  }

  if (stdout) {
    console.log(`stdout: ${stdout}`);
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
});