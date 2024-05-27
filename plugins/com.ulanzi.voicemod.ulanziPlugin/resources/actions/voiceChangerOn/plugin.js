(() => {
const action = new Action(ComUlanziUlanzideckVoicemodChangerOn)

/* 
true = On
false = Off
*/
let _MASTER_STATE = false;
let _BUTTON_PRESSED = false

function updateButtonBitmap(uuid, key, state) {
    $UD.setState(uuid, key, (state === true) ? 1 : 0)
}

// action.onRunAffet((evnt) => {
//     BUTTON_PRESSED = false
//     Voicemod.sendMessageToServer('getVoiceChangerStatus')
// })

action.onRun((evnt) => {
    _BUTTON_PRESSED = true
    //there is no need to update the state here, it is automatically updated by the deck
    if(!_MASTER_STATE) { //we only toggle the voicechanger if it wasn't enabled already
        Voicemod.sendMessageToServer('toggleVoiceChanger')
    } 
})

action.onWillAppear((evnt) => {
    updateButtonBitmap(evnt.uuid, evnt.key, false)  //force the initial state of the button
    Voicemod.onVoiceChangerDisabled(() => {
        _MASTER_STATE = false;
        if(!_BUTTON_PRESSED) {
            updateButtonBitmap(evnt.uuid, evnt.key, false)
        }

    })

    Voicemod.onVoiceChangerEnabled(() => {
        _MASTER_STATE = true;
        if(!_BUTTON_PRESSED) {
            updateButtonBitmap(evnt.uuid, evnt.key, true)
        }
    })

    Voicemod.onToggleVoiceChanger(({actionObject}) => {
        _MASTER_STATE = actionObject.value
        console.log("Updating the internal master state to: ", _MASTER_STATE)
        updateButtonBitmap(evnt.uuid, evnt.key, _MASTER_STATE)
    })

    if(Voicemod.connected) {
        Voicemod.sendMessageToServer('getVoiceChangerStatus')
    } else {
        Voicemod.onConnected(evnt.uuid, evnt.key, () => Voicemod.sendMessageToServer('getVoiceChangerStatus'))
    }
})

})()
