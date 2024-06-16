(() => {
const action = new Action(ComUlanziUlanzideckVoicemodHearMyselfOn)

/* 
true = On
false = Off
*/
let _MASTER_STATE = false;
let _BUTTON_PRESSED = false

function updateButtonBitmap(uuid, key, actionid, state) {
    $UD.setState(uuid, key, actionid, (state === true) ? 1 : 0)
}

action.onRun((evnt) => {
    _BUTTON_PRESSED = true
    if(!_MASTER_STATE) {
        Voicemod.sendMessageToServer('toggleHearMyVoice')
    } 
})

// action.onRunAfter((evnt) => {
//     _BUTTON_PRESSED = false

//     if(_MASTER_STATE) {
//         updateButtonBitmap(evnt.context, true)
//     }
//     Voicemod.sendMessageToServer('getHearMyselfStatus')
// })
action.onSetActive((evnt) => {
    updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, _MASTER_STATE)
})
action.onWillAppear((evnt) => {

    updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, false)  //force the initial state of the button
    Voicemod.onHearMyselfDisabled(() => {
        _MASTER_STATE = false;
        if(!_BUTTON_PRESSED) {
            updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, false)
        }

    })

    Voicemod.onHearMyselfEnabled(() => {
        _MASTER_STATE = true;
        if(!_BUTTON_PRESSED) {
            updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, true)
        }
    })

    Voicemod.onToggleHearMyVoice(({actionObject}) => {
        _MASTER_STATE = actionObject.value
        console.log("Updating the internal master state to: ", _MASTER_STATE)
        updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, _MASTER_STATE)
    })

    if(Voicemod.connected) {
        Voicemod.sendMessageToServer('getHearMyselfStatus')
    } else {
        Voicemod.onConnected(evnt.context, () => Voicemod.sendMessageToServer('getHearMyselfStatus'))
    }
})


})()
