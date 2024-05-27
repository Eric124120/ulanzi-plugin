(() => {
const action = new Action(ComUlanziUlanzideckVoicemodHearMyselfOff)

/* 
true = off
false = on
*/
let _MASTER_STATE = false;
let _BUTTON_PRESSED = false

function updateButtonBitmap(uuid, key, state) {
    $UD.setState(uuid, key, (state === true) ? 1 : 0)
}

action.onRun((evnt) => {
    _BUTTON_PRESSED = true
    //there is no need to update the state here, it is automatically updated by the deck
    if(!_MASTER_STATE) { //we only toggle the switch if it wasn't enabled already
        Voicemod.sendMessageToServer('toggleHearMyVoice')
    } 
})

// action.onRunAfter((evnt) => {
//     _BUTTON_PRESSED = false

//     if(_MASTER_STATE) {
//         updateButtonBitmap(evnt.uuid, evnt.key, true)
//     }
//     VVoicemod.sendMessageToServer('getHearMyselfStatus')
// })


action.onWillAppear((evnt) => {

    updateButtonBitmap(evnt.uuid, evnt.key, false)  //force the initial state of the button
    Voicemod.onHearMyselfDisabled(() => {
        _MASTER_STATE = true;
        if(!_BUTTON_PRESSED) {
            updateButtonBitmap(evnt.uuid, evnt.key, true)
        }

    })

    Voicemod.onHearMyselfEnabled(() => {
        _MASTER_STATE = false;
        if(!_BUTTON_PRESSED) {
            updateButtonBitmap(evnt.uuid, evnt.key, false)
        }
    })

    Voicemod.onToggleHearMyVoice(({actionObject}) => {
        _MASTER_STATE = !actionObject.value
        console.log("Updating the internal master state to: ", _MASTER_STATE)
        updateButtonBitmap(evnt.uuid, evnt.key, _MASTER_STATE)
    })

    if(Voicemod.connected) {
        Voicemod.sendMessageToServer('getHearMyselfStatus')
    } else {
        Voicemod.onConnected(evnt.context, () => Voicemod.sendMessageToServer('getHearMyselfStatus'))
    }
})


})()
