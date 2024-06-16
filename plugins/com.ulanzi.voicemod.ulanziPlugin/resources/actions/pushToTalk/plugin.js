(() => {
const action = new Action(ComUlanziUlanzideckVoicemodChangerPushToTalk)

/* 
true = On
false = Off
*/
let _MASTER_STATE = false;

function updateButtonBitmap(uuid, key, actionid, state) {
    $UD.setState(uuid, key, actionid, (state === true) ? 1 : 0)
}

action.onRun((evnt) => {
    //there is no need to update the state here, it is automatically updated by the deck
    if(!_MASTER_STATE) { //we only toggle the voicechanger if it wasn't enabled already
        Voicemod.sendMessageToServer('toggleVoiceChanger')
        updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, true) 
    }
})
// action.onRunAfter((evnt) => {
//     if(_MASTER_STATE) { //
//         Voicemod.sendMessageToServer('toggleVoiceChanger')
//         updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, false) 
//     }
// })

action.onSetActive((evnt) => {
    updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, _MASTER_STATE) 
})

action.onWillAppear((evnt) => {

    updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, false)  //force the initial state of the button
    Voicemod.onVoiceChangerDisabled(() => {
        _MASTER_STATE = false;
    })

    Voicemod.onVoiceChangerEnabled(() => {
        _MASTER_STATE = true;
    })

    Voicemod.onToggleVoiceChanger(({actionObject}) => {
        _MASTER_STATE = actionObject.value
        console.log("Updating the internal master state to: ", _MASTER_STATE)
    })
})


})()
