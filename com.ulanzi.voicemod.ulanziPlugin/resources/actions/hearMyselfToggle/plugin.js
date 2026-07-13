(() => {
const action = new Action(ComUlanziUlanzideckVoicemodHearMyselfToggle)

let BUTTON_PRESSED = false

function updateButtonBitmap(uuid, key, actionid, state) {
    $UD.setState(uuid, key, actionid, (state === true) ? 1 : 0)
}

action.onRun((evnt) => {
    BUTTON_PRESSED = true
    Voicemod.sendMessageToServer('toggleHearMyVoice')
})


// action.onRunAfter((evnt) => {
//     BUTTON_PRESSED = false
//     Voicemod.sendMessageToServer('getHearMyselfStatus')
// })

action.onSetActive((evnt) => {
    updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, _MASTER_STATE)
})

action.onWillAppear((evnt) => {
    Voicemod.sendMessageToServer('getHearMyselfStatus')
    //any prep for this action should go here...
    Voicemod.onToggleHearMyVoice((payload) => {
        updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, payload.actionObject.value)
    })
    //any prep for this action should go here...
    Voicemod.onHearMyselfDisabled((payload) => {
        Voicemod.sendMessageToServer('getHearMyselfStatus')
    })
    Voicemod.onHearMyselfEnabled((payload) => {
        Voicemod.sendMessageToServer('getHearMyselfStatus')
    })

    if(Voicemod.connected) {
        Voicemod.sendMessageToServer('getHearMyselfStatus')
    } else {
        Voicemod.onConnected(evnt.context, () => Voicemod.sendMessageToServer('getHearMyselfStatus')
)
    }



})


})()
