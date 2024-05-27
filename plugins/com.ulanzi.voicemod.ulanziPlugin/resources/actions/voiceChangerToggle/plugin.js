(() => {
    const action = new Action(ComUlanziUlanzideckVoicemodChangerToggle)

    let BUTTON_PRESSED = false

    function updateButtonBitmap(uuid, key, value) {
        $UD.setState(uuid, key, (value === true) ? 1 : 0)
    }

    action.onRun((evnt) => {
        BUTTON_PRESSED = true
        Voicemod.sendMessageToServer('toggleVoiceChanger')
    })

    // action.onRunAffet((evnt) => {
    //     BUTTON_PRESSED = false
    //     Voicemod.sendMessageToServer('getVoiceChangerStatus')
    // })

    action.onWillAppear((evnt) => {
        Voicemod.sendMessageToServer('getVoiceChangerStatus')
        Voicemod.onToggleVoiceChanger((payload) => {
            updateButtonBitmap(evnt.uuid, evnt.key, payload.actionObject.value)
        })
        //any prep for this action should go here...
        Voicemod.onVoiceChangerDisabled((payload) => {
            Voicemod.sendMessageToServer('getVoiceChangerStatus')
        })
        Voicemod.onVoiceChangerEnabled((payload) => {
            Voicemod.sendMessageToServer('getVoiceChangerStatus')
        })

        if(Voicemod.connected) {
            Voicemod.sendMessageToServer('getVoiceChangerStatus')
        } else {
            Voicemod.onConnected(evnt.context ,() => Voicemod.sendMessageToServer('getVoiceChangerStatus'))
        }
    })
})()
