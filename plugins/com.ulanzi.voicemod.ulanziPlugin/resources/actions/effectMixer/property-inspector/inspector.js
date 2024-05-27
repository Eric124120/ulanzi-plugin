/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />
/// <reference path="../../../libs/js/voicemod.js" />

const actionUUID = 'com.voicemodplus.actions.voicechanger'

let __VOICES = null;
let __SETTINGS = {}

$PI.onDidReceiveSettings(actionUUID, ({payload}) => {
    console.log('onDidReceiveSettings', payload);
    __SETTINGS = payload.settings
    updateVoicesUI()
    
})

$PI.on('allVoicesBitmapsLoaded' ,() => {
    updateButtonWithVoiceBitmap(__SETTINGS['selected-voice'])
})

$PI.onConnected((jsn) => {
    const form = document.querySelector('#property-inspector');
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {payload, context} = actionInfo;
    const {settings} = payload;

    Utils.setFormValue(settings, form);

    form.addEventListener(
        'input',
        Utils.debounce(150, () => {
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);
        })
    );


    $PI.sendToPlugin({
        action: 'getVoices'
    })


    console.log("requesting global settings...")
    $PI.getSettings()

    $PI.onSendToPropertyInspector(actionUUID, ({payload}) => {
        console.log('send property to inspector triggered....')
        if(payload.action == 'changeVoice') {
            Voicemod.sendMessageToServer('selectVoice', __SETTINGS['selected-voice'])
        }
        if(payload.action == 'loadVoices') {
            Voicemod.sendMessageToServer('getVoices')
        }

        if(payload.action == 'getVoices') {
            console.log("voices. ", payload.voices)
            __VOICES = payload.voices
            updateVoicesUI()
                  
        }
    })


});



/**
 * Provide window level functions to use in the external window
 * (this can be removed if the external window is not used)
 */
window.sendToInspector = (data) => {
    console.log(data);
};


function updateVoicesUI() {
    loadListOfVoices(__SETTINGS['voice-type-selected'] || 'all')
    if(__SETTINGS['selected-voice']) {
        selectDefaultVoice(__SETTINGS['selected-voice'])
        updateButtonWithVoiceBitmap(__SETTINGS['selected-voice'])
    }
}


//clean up the options from a dropdown
function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}

function selectDefaultVoice(voice) {
    const select = document.querySelector("#list-of-voices")
    select.value = voice
}


async function loadListOfVoices(type) {
    if(__VOICES == null) return;
    const select = document.querySelector("#list-of-voices")
    removeOptions(select)
    console.log("loading the list of voices. ", type)
    let voices = __VOICES['all']

    __SETTINGS['voice-type-selected'] = type
    $PI.setSettings(__SETTINGS)
    
    if(type == "favs") {
        voices = __VOICES['fav']
    }
    
    if(type == "custom") {
        voices = __VOICES['custom']
    } 
        
    voices.forEach( v => {
        select.appendChild(new Option(v.friendlyName, v.id))
    })
}

document.querySelectorAll('input[type=radio][name="voice-list-type"]').forEach( radio => {
    radio.addEventListener('change', (evnt) => {
        console.log("The type of list was changed")
        console.log(evnt)
        if(evnt.target.checked) {
            loadListOfVoices(evnt.target.value)
        }
    })
})

document.querySelector('#list-of-voices').addEventListener('change', (evnt) => {
    const voiceId = __SETTINGS['selected-voice'] = evnt.target.value
    updateButtonWithVoiceBitmap(voiceId)

    console.log("saving settings: ", __SETTINGS)
    $PI.setSettings(__SETTINGS)
})



function getVoiceBitmap(vid) {
    if(__VOICES == null) return //we haven't loaded the data from the plugin yet
    let v = __VOICES['all'].find( v => v.id == vid)
    console.log("images for this voice")
    console.log(v.images)
    return v.images
}

function updateButtonWithVoiceBitmap(voiceId) {
    const voiceImg = getVoiceBitmap(voiceId)
    if(!voiceImg) return //probably voice data hasn't been loaded yet
    if(!voiceImg.default) return //there is no image to set
    $PI.sendToPlugin({
        action: 'setImage',
        image: voiceImg.default
    })
}

