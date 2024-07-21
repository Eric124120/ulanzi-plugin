/*
 * @Author: 黄承文 chengwen@ssc-hn.com
 * @Date: 2024-07-21 22:00:33
 * @LastEditors: 黄承文 chengwen@ssc-hn.com
 * @LastEditTime: 2024-07-22 01:35:09
 * @FilePath: /ulanzi-plugin/plugins/com.ulanzi.dialog.ulanziPlugin/server/electron/systemDialog/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');
const {exec} = require('child_process');

let mainWindow;
let systemInfoTimer;
const updateInfoTime = 5000;
let tryInstallOsxCpuTemp = true;
function systemDialog() {
  app.whenReady().then(() => {
    if (!mainWindow) {
      mainWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: 200,
        height: 240,
        transparent: true, // 设置窗口背景透明
        frame: false, // 隐藏窗口的标题栏和边框
        alwaysOnTop: true, // 使窗口保持在最上层
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          enableRemoteModule: false, // 禁用 remote 模块
          nodeIntegration: false
        }
      });
      mainWindow.loadFile(path.resolve(__dirname, 'index.html'));

      async function getCpuTemperature() {
        const cpuTemp = await si.cpuTemperature();
        if (cpuTemp.main) {
          return cpuTemp.main;
        } else {
          return new Promise((resolve, reject) => {
            exec('osx-cpu-temp', (error, stdout, stderr) => {
              if (error) {
                if (tryInstallOsxCpuTemp) {
                  // 通知客户端异常
                  mainWindow.webContents.send('osx-cpu-temp-fail');
                  // 若osx-cpu-temp未安装尝试安装osx-cpu-temp
                  exec('brew install osx-cpu-temp');
                  tryInstallOsxCpuTemp = false;
                }
                resolve(null);
              } else {
                resolve(stdout.trim().replace('°C', ''))
              }
            });
          });
        }
      }
      // 获取系统信息
      async function getSystemInfo() {
        try {
          const load = await si.currentLoad();
          const cpuTemp = await getCpuTemperature();
          const gpuData = await si.graphics();
          const memory = await si.mem();
          // 计算总体 GPU 使用率
          const totalGpuUsage = gpuData.controllers.reduce((total, controller) => {
            // console.log(controller)
            return total + (controller.utilizationGpu || 0);
          }, 0) / gpuData.controllers.length;
          
          const systemInfo = {
            cpu: load.currentLoad.toFixed(2),
            cpuTemp: cpuTemp || 'N/A',  // 如果温度为null，则显示 'N/A'
            gpu: totalGpuUsage.toFixed(2),
            mem: (memory.used / memory.total * 100).toFixed(2),
          };
          // 将系统信息发送到渲染进程
          mainWindow.webContents.send('system-info', systemInfo);
        } catch (err) {
          console.error(err);
        }
      }
      getSystemInfo();
      systemInfoTimer = setInterval(getSystemInfo, updateInfoTime);
      mainWindow.on('close', () => {
        mainWindow = null;
        systemInfoTimer && clearInterval(systemInfoTimer);
      });
      ipcMain.on('close-system-dialog', () => {
        if (mainWindow && typeof mainWindow.close === 'function') {
          mainWindow.close();
        }
      });
    } else {
      mainWindow.close();
    }
  }).catch((err) => {
    console.error(err);
  })
}

module.exports = systemDialog;