const { BrowserWindow } = require('electron');

function createDialog(parentWindow, options) {
  // 创建一个新的弹窗
  const modalWindow = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    show: false,
    width: options.width || 400,
    height: options.height || 300,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // 加载弹窗的内容
  options.url && modalWindow.loadFile(options.url);

  // 显示弹窗
  modalWindow.once('ready-to-show', () => {
    modalWindow.show();
  });

  return modalWindow;
}

module.exports = {
  createDialog
};
