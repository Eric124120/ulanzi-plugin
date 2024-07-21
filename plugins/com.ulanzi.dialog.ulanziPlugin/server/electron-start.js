const { exec } = require('child_process');
const path = require('path');


function startElectron() {
  // const electronPath = 'electron'; // 或者提供全局路径，例如 'C:\\path\\to\\electron'
  const electronPath = path.join(__dirname, '../node_modules', '.bin', 'electron');
  // 获取主进程文件的路径
  const mainPath = path.join(__dirname, 'main.js');

  // 启动 Electron 应用，并添加 --no-sandbox 参数
  const electronProcess = exec(`${electronPath} ${mainPath} --no-sandbox`);
  electronProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  electronProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    if (code !== 0) {
      console.log('Restarting Electron...');
      startElectron();
    }
  });
}
// 如果 Electron 已经全局安装，可以直接使用全局路径
startElectron()