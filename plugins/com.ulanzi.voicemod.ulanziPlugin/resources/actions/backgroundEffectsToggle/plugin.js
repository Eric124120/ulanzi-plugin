(() => {
const action = new Action(ComUlanziUlanzideckVoicemodBackgroundswitch)

let BUTTON_PRESSED = false

function updateButtonBitmap(uuid, key, actionid, value) {
    $UD.setState(uuid, key, actionid, (value === true) ? 1 : 0)
}

action.onRun((evnt) => {
    BUTTON_PRESSED = true
    Voicemod.sendMessageToServer('toggleBackground')
})

// action.onSetActive((evnt) => {
//     let btnSettings = window.getUlanziPluginSettings(evnt.actionid)
//     requestVoiceBitMap({uuid: evnt.uuid, key: evnt.key, actionid: evnt.actionid, ...btnSettings})
// })

action.onWillAppear((evnt) => {
   
    //any prep for this action should go here...
    Voicemod.onToggleBackgroundEffects((payload) => {
        if(BUTTON_PRESSED) return
        console.log("getting status of the voice changer: ", payload)
        updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, payload.actionObject.value)
    })


    Voicemod.onVoiceLoaded(evnt.context ,(payload) => {
        Voicemod.sendMessageToServer('getBackgroundEffectStatus')
    })
    //any prep for this action should go here...
    Voicemod.onBackgroundEffectsDisabled((payload) => {
        Voicemod.sendMessageToServer('getBackgroundEffectStatus')
    })
    Voicemod.onBackgroundEffectsEnabled((payload) => {
        Voicemod.sendMessageToServer('getBackgroundEffectStatus')
    })
    Voicemod.sendMessageToServer('getBackgroundEffectStatus')

})

action.onWillDisappear((evnt) => {
    Voicemod.removeEventListeners(evnt.context)
})

})()
