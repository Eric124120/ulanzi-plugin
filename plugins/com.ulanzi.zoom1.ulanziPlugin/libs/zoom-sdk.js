const keyboard = require('../build/Release/zoom.node');
// import keyboard from "../build/Release/zoom.node";

const keyASCIIMap = {
  /** 静音切换 */
  'A': 65,
  /** 视频切换 */
  'V': 86,
  /** 全屏切换 */
  'F': 70,
  /** 结束会议 */
  'Q': 81,
  /** 本地录制 */
  'R': 82,
  /** 云录制 */
  'C': 67,
  /** 暂停/继续录制 */
  'P': 80,
  /** 开始/停止屏幕共享 */
  'S': 83,
  /** 全局静音/取消静音切换 */
  'M': 77,
}

/** 静音切换 */
function muteToggle() {
  keyboard.simulateAltKey(keyASCIIMap['A']);
}
/** 视频切换 */
function videoToggle() {
  keyboard.simulateAltKey(keyASCIIMap['V']);
}

/** 窗口聚焦 */
function zoomFocus() {
  keyboard.zoomFocus();
}

/** 离开会议 */
function zoomLeave() {
  keyboard.simulateAltKey(keyASCIIMap['Q']);
}

/** 云端录制 */
function zoomRecordcloudtoggle() {
  keyboard.simulateAltKey(keyASCIIMap['C']);
}

/** 本地录制 */
function zoomRecordlocaltoggle() {
  keyboard.simulateAltKey(keyASCIIMap['R']);
}

/** 共享桌面 */
function zoomShare() {
  keyboard.simulateAltKey(keyASCIIMap['S']);
}
/** 全局静音/解除静音 */
function zoomUnmuteall() {
  keyboard.simulateAltKey(keyASCIIMap['M']);
}
/** 全局静音/解除静音 */
function zoomMuteall() {
  keyboard.simulateAltKey(keyASCIIMap['M']);
}

// module.exports = {
//   muteToggle,
//   videoToggle,
//   zoomFocus,
//   zoomLeave,
//   zoomRecordcloudtoggle,
//   zoomRecordlocaltoggle,
//   zoomShare,
//   zoomUnmuteall,
//   zoomMuteall
// }

muteToggle()

// export {
//   muteToggle,
//   videoToggle,
//   zoomFocus,
//   zoomLeave,
//   zoomRecordcloudtoggle,
//   zoomRecordlocaltoggle,
//   zoomShare,
//   zoomUnmuteall,
//   zoomMuteall
// }