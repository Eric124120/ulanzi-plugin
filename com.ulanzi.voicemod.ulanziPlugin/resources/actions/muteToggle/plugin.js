(() => {
const action = new Action(ComUlanziUlanzideckVoicemodMuteSwitch)

let BUTTON_PRESSED = false

function updateButtonBitmap(uuid, key, actionid, state) {
    $UD.setState(uuid, key, actionid, (state === true) ? 1 : 0)
}

action.onRun((evnt) => {
    BUTTON_PRESSED = true
    Voicemod.sendMessageToServer('toggleMuteMic')
})
// action.onRunAfter((evnt) => {
//     BUTTON_PRESSED = false
//     Voicemod.sendMessageToServer('getMuteMicStatus');
// })

action.onSetActive((evnt) => {
    Voicemod.sendMessageToServer('getMuteMicStatus');
})

action.onWillAppear((evnt) => {
   
    //any prep for this action should go here...
    Voicemod.onToggleMuteMic((payload) => {
        updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, payload.actionObject.value)
    })


   //any prep for this action should go here...
    Voicemod.onMuteMicDisabled((payload) => {
        Voicemod.sendMessageToServer('getMuteMicStatus');
    })
    Voicemod.onMuteMicEnabled((payload) => {
        Voicemod.sendMessageToServer('getMuteMicStatus');
    })

    if(Voicemod.connected) {
        Voicemod.sendMessageToServer('getMuteMicStatus');
    } else {
        Voicemod.onConnected(evnt.uuid,
            () => Voicemod.sendMessageToServer('getMuteMicStatus'))
    }
})

})()
