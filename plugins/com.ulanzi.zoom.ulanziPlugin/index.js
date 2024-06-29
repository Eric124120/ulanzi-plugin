const keyboard = require('./build/Release/keyboard');

const keyASCIIMap = {
    'A': 65,
    'V': 86,

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
videoToggle();
// console.log("Simulating Alt + A key press...");
// keyboard.simulateAltKey(0x41);
// console.log("Done!");
