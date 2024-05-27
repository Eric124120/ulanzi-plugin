/// <reference path="../../../libs/js/constants.js" />
/// <reference path="../../../libs/js/events.js" />
/// <reference path="../../../libs/js/utils.js"/>
/// <reference path="../../../libs/js/storage.js"/>
/// <reference path="../../../libs/js/ulanzi-plugin.js" />
/// <reference path="../../../libs/js/dynamic-styles.js" />
/// <reference path="../../../libs/js/action.js" />
/// <reference path="../../../libs/js/voicemod.js" />

window.__VOICES = null;
window.__SETTINGS = {}
window.__LICENSE_TYPE = "free";
window.__UI_STATUS = null;
let uuid = ComUlanziUlanzideckVoicemodChanger;
let key = '';
let actionid = '';


const VoiceTypes = {
    all: 'allVoices',
    fav: 'favoriteVoices',
    custom: 'customVoices'
}

$PI.connect(UlanzideckPort, ComUlanziUlanzideckVoicemodChanger);

$PI.onConnected((jsn) => {
    uuid = jsn['uuid'];
    key = jsn['key'];
    actionid = jsn['actionid'];
    console.log('--------------------<>', jsn)
    $PI.onWillAppear((data) => {
        const payload = data.param;
        const globalSettings = window.getUlanziGlobalSettings();
        if (payload.settings) {
            __SETTINGS = payload.settings
            $PI.sendToPlugin({
                action: 'getVoices',
                voiceId: __SETTINGS['selected-voice'],
                currentSettings: __SETTINGS
            })
        }
        // 状态显示设置
        if(globalSettings.status == VoicemodStatus.offline) {
            blockUI()
        } else {
            if(__UI_STATUS == VoicemodStatus.offline ||__UI_STATUS == null) {
                enableUI()
            }
        }
        __UI_STATUS = globalSettings.status;
        // 权限显示设置
        if(globalSettings.licenseType == VoicemodLicenseType.free) {
            showFREEUI()
        } else {
            showPROUI()
        }
        // 列表显示设置
         // 设置列表
         if(globalSettings.voices) {
            __VOICES = globalSettings.voices
            updateVoicesUI()
        }
    })
});


function updateVoicesUI() {
    console.log("Doing update voice uI with settings: ", __SETTINGS)
    loadListOfVoices(__SETTINGS['voice-type-selected'] || 'all')
    if(__SETTINGS['selected-voice']) {
        selectDefaultVoice(__SETTINGS['selected-voice'])
        updateButtonWithVoiceBitmap(__SETTINGS['selected-voice'])
    }

}

function showFREEUI() {
    __LICENSE_TYPE = VoicemodLicenseType.free
    document.querySelector("#lists-of-voices").classList.add("hidden")
}

function showPROUI() {
    __LICENSE_TYPE = VoicemodLicenseType.pro
    document.querySelector("#lists-of-voices").classList.remove("hidden")
}




//clean up the options from a dropdown
function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}

function selectDefaultVoice(voice) {
    console.log(":::: selecting default voice...", voice)
    const select = document.querySelector("#list-of-voices")
    select.value = voice
}


function loadListOfVoices(type) {
    if(__VOICES == null) return;
    const select = document.querySelector("#list-of-voices")
    removeOptions(select)
    console.log("loading the list of voices. ", type)
    let voices = __VOICES[VoiceTypes.all]
    console.log("Voices at the start: ", voices.length)

    __SETTINGS['voice-type-selected'] = type

    document.querySelectorAll('input[type=radio][name="voice-type-selected"]').forEach( radio => {
        radio.removeAttribute("checked")
    })

    if(type == "all") {
        document.querySelector("#all-voices").setAttribute("checked", true)
    }
    
    if(type == "favs") {
        voices = __VOICES[VoiceTypes.fav]
        document.querySelector("#fav-voices").setAttribute("checked", true)
    }
    
    if(type == "custom") {
        document.querySelector("#custom-voices").setAttribute("checked", true)
        voices = __VOICES[VoiceTypes.custom]
    } 
    console.log("Voices at the end: ", voices.length)
        
    select.appendChild(new Option('Select a voice', -1))
    //select.value = __SETTINGS['selected-voice'] || -1
    voices.forEach( v => {
        select.appendChild(new Option(v.friendlyName, v.id))
    })
}

document.querySelectorAll('input[type=radio][name="voice-type-selected"]').forEach( radio => {
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
    console.log("---setting settings: ", __SETTINGS)
    $PI.setSettings(__SETTINGS)
    $PI.sendToPlugin({
        action: 'updateBtnVoice',
        voiceId: voiceId,
        currentSettings: __SETTINGS
    })
})



function getVoiceBitmap(vid) {
    if (__SETTINGS['button-images']) {
        return __SETTINGS['button-images'];
    }
    if(__VOICES == null) return //we haven't loaded the data from the plugin yet
    let v = __VOICES[VoiceTypes.all].find( v => v.id == vid)
    console.log("images for this voice: ", vid)
    console.log(v.images)
    return v.images
}

function updateButtonWithVoiceBitmap(voiceId) {
    const voiceImg = getVoiceBitmap(voiceId)
    if(!voiceImg) return //probably voice data hasn't been loaded yet
    if(!voiceImg.default) return //there is no image to set
    $PI.sendToPlugin({
        action: 'setImage',
        image: __SETTINGS['is-active'] ? voiceImg.selected : voiceImg.transparent,
    })
}

