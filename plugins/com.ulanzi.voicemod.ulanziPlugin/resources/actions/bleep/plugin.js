(() => {
const action = new Action(ComUlanziUlanzideckVoicemodBleep)


action.onRun((evnt) => {
    //there is no need to update the state here, it is automatically updated by the deck
    Voicemod.sendMessageToServer('setBeepSound', true)
})

// action.onRunAfter((evnt) => {
//     //there is no need to update the state here, it is automatically updated by the deck
//     Voicemod.sendMessageToServer('setBeepSound', false)
// })


action.onWillAppear((evnt) => {


})


})()
