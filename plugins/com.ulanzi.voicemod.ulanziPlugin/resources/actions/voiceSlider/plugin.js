(() => {
const action = new Action('com.voicemodplus.actions.voiceslider')

let MASTER_VALUE = 0

action.onDialRotate((evnt) => {
    console.log('the action is here..#')
    console.log(evnt)
    const settings = evnt.payload.settings
    const list = settings['voice-list-type']
    MASTER_VALUE = MASTER_VALUE + evnt.payload.ticks

    let voices = Voicemod.__voicesLists[list]
    if(MASTER_VALUE >= voices.length) {
        MASTER_VALUE = 0
    }

    if(MASTER_VALUE < 0) {
        MASTER_VALUE = voices.length - 1
    }

    $SD.setFeedback(evnt.context, {
        title: "Voice: " + voices[MASTER_VALUE].friendlyName,
        indicator: {
            value: MASTER_VALUE,
            enabled: true
        }})
    
    Voicemod.sendMessageToServer('selectVoice', voices[MASTER_VALUE].id)
    
})

action.onWillAppear((evnt) => {
   
    //any prep for this action should go here...
})


})()
