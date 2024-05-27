(() => {
const action = new Action(ComUlanziUlanzideckVoicemodStopallsounds)

/* 
true = On
false = Off
*/
let _MASTER_STATE = false;
let _BUTTON_PRESSED = false

function updateButtonBitmap(uuid, key, state) {
    $UD.setState(uuid, key, (state === true) ? 1 : 0)
}

action.onRun((evnt) => {
    _BUTTON_PRESSED = true
    //there is no need to update the state here, it is automatically updated by the deck
    if(!_MASTER_STATE) { //we only toggle the voicechanger if it wasn't enabled already
        Voicemod.sendMessageToServer('stopAllMemeSounds')
        //updateButtonBitmap(evnt.uuid, evnt.key, true) 
    } 
})

// action.onRunAfter((evnt) => {
//     _BUTTON_PRESSED = false

//     if(_MASTER_STATE) {
//         updateButtonBitmap(evnt.uuid, evnt.key, true)
//     }
// })

action.onWillAppear((evnt) => {

   
})

})()
