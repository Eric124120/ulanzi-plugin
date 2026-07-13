(() => {
const action = new Action(ComUlanziUlanzideckVoicemodRandomVoice)

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

action.onRun((evnt) => {
    let settings = evnt.param.settings;
    settings = settings.settings || settings;

    let newVoice = null;
    let newIndex = 0;
    let list = settings['listRandomVoices_selected'] || 'allVoices'

    if(Voicemod.__voicesLists[list]) {
        newIndex = randomInt(
            0,
            Voicemod.__voicesLists[list].length - 1
        )
       newVoice =  Voicemod.__voicesLists[list][newIndex]
       Voicemod.sendMessageToServer('selectVoice', newVoice.id)
    } else if(list == 'favoriteCustomVoices') {
        let newList = [...Voicemod.__voicesLists['favoriteVoices'], ...Voicemod.__voicesLists['customVoices']]
        newIndex = randomInt(
            0,
            newList.length - 1
        )
       newVoice =  newList[newIndex]
    }
    if(newVoice) {
        Voicemod.sendMessageToServer('selectVoice', newVoice.id)
    } else {
        console.log("ERROR voice not found for index: ",newIndex)
    }
})

function parseSettings(settings) {

    let newSettings = {}

    if(settings?.settings) { //we're dealing with an older version of the plugin
        newSettings = settings.settings
        return newSettings
    }
    return settings;
}


action.onWillAppear((evnt) => {
    
    let settings = parseSettings(evnt.param?.settings || {})

    $UD.setSettings(evnt.uuid, evnt.key, evnt.actionid, settings)
    

})


})()
