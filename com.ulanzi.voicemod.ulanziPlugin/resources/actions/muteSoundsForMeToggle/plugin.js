(() => {
const action = new Action(ComUlanziUlanzideckVoicemodMutesoundsForMeToggle)

let BUTTON_PRESSED = false

function updateButtonBitmap(uuid, key, actionid, state) {
    $UD.setState(uuid, key, actionid, (state === true) ? 1 : 0)
}

action.onRun((evnt) => {
    BUTTON_PRESSED = true
    Voicemod.sendMessageToServer('toggleMuteMemeForMe')
})

// action.onRunAfter((evnt) => {
//     BUTTON_PRESSED = false
//     Voicemod.sendMessageToServer('getMuteMemeForMeStatus');
// })

action.onSetActive((evnt) => {
    Voicemod.sendMessageToServer('getMuteMemeForMeStatus');
})

action.onWillAppear((evnt) => {
   
    //any prep for this action should go here...
    Voicemod.onMuteMemeForMeToggle((payload) => {
        if(BUTTON_PRESSED) return
        console.log("getting status of the mute meme for me flag: ", payload)
        updateButtonBitmap(evnt.uuid, evnt.key, evnt.actionid, payload.actionObject.value )
    })


    Voicemod.onMuteMemeForMeDisabled((payload) => {
        Voicemod.sendMessageToServer('getMuteMemeForMeStatus');
    })
    Voicemod.onMuteMemeForMeEnabled((payload) => {
        Voicemod.sendMessageToServer('getMuteMemeForMeStatus');
    })
    if(Voicemod.connected) {
        Voicemod.sendMessageToServer('getMuteMemeForMeStatus');
    } else {
        Voicemod.onConnected(evnt.uuid, () => Voicemod.sendMessageToServer('getMuteMemeForMeStatus'))
    }

})


})()
