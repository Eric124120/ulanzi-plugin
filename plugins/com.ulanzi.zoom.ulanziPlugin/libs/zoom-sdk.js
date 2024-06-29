const keyboard = require('../build/Release/zoom.node');

const keyASCIIMap = {
  /** 音频切换 */
  'A': 65,
  /** 视频切换 */
  'V': 86,
  /** 全屏切换 */
  'F': 70,
  /** 结束会议 */
  'Q': 81,
}
const keyCodeTransform = (key) => {
    const decimalNumber = keyASCIIMap[key];
    return `0x${decimalNumber.toString(16)}`;
}

function muteToggle() {
  keyboard.simulateAltKey(keyASCIIMap['A']);
}

function videoToggle() {
  keyboard.simulateAltKey(keyASCIIMap['V']);
}
keyboard.simulateAltKey(keyASCIIMap['Q']);