/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />
/// <reference path="../../../libs/js/voicemod.js" />


let __SOUNDBOARDS = null;
let __SETTINGS = {}
let __UI_STATUS = null;


$PI.on('allVoicesBitmapsLoaded' ,() => {
    updateButtonWithVoiceBitmap(__SETTINGS['selected-voice'])
})
$PI.connect(UlanzideckPort, ComUlanziUlanzideckVoicemodSoundboard);
$PI.onConnected((jsn) => {
    uuid = jsn['uuid'];
    key = jsn['key'];
    actionid = jsn['actionid'];
    console.log('--------------------<>', jsn)
    $PI.onWillAppear((data) => {
        const payload = data.param;
        const globalSettings = window.getUlanziGlobalSettings();
        __SOUNDBOARDS = globalSettings.sounds;
        /** ReceiveSettings */
        __SETTINGS = {...__SETTINGS, ...(payload.settings || {}), ...globalSettings}
        updateUI()
        let idx = __SOUNDBOARDS[__SETTINGS['selected-profile']].sounds.findIndex( s => s.id == __SETTINGS['selected-sound'])
        if(idx >= 0) {
            __SOUNDBOARDS[__SETTINGS['selected-profile']].sounds[idx].image = __SETTINGS['button-images']?.default
        }
        $PI.sendToPlugin({
            action: 'getSoundboards',
            currentSettings: __SETTINGS
        })
       
        /** ReceiveSettings */

        // 状态显示设置
        if(globalSettings.status == VoicemodStatus.offline) {
            blockUI()
        } else {
            if(__UI_STATUS == VoicemodStatus.offline ||__UI_STATUS == null) {
                enableUI()
            }
        }
        __UI_STATUS = globalSettings.status;
    })
});


function updateUI() {
    loadListOfProfiles(__SETTINGS['selected-profile'] || 'all')
    if(__SETTINGS['selected-sound']) {
        selectDefaultSound(__SETTINGS['selected-sound'])
        updateButtonWithVoiceBitmap(__SETTINGS['selected-sound'])
    }
}


//clean up the options from a dropdown
function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}

function selectDefaultSound(sound) {
    console.log("Updaing the selected sound to: ", sound)
    console.log("global settings: ")
    console.log(__SETTINGS)
    const select = document.querySelector("#list-of-sounds")
    select.value = sound
}


async function loadListOfProfiles(type) {
    if(__SOUNDBOARDS == null) return;
    const select = document.querySelector("#selected-profile")

    console.log("Loading list of profiles, type: ", type)

    removeOptions(select)
    //select.appendChild(new Option($PI.localize("All"), "All"))
    Object.keys(__SOUNDBOARDS).forEach( sb_name => {
        select.appendChild(new Option(sb_name, sb_name))
    })
    select.value = (type == 'all') ? 'All' : type
    __SETTINGS['selected-profile'] = select.value
    loadListOfSounds(select.value,
                        __SETTINGS['selected-sound'])

    //select.dispatchEvent(new Event('change'))
}

async function loadListOfSounds(list, defaultValue = null) {
    if(__SOUNDBOARDS == null) return;
    const select = document.querySelector("#list-of-sounds")
    let defaultValueSelectable = false; //indicates if the default value belongs to the currently selected list

    removeOptions(select)

    select.appendChild(new Option('Select a sound', -1))
    console.log("List selected: ", list)
    console.log("Lists available: ", Object.keys(__SOUNDBOARDS))
    __SOUNDBOARDS[list].sounds.forEach( sound => {
        if(sound.id == defaultValue) {
            defaultValueSelectable = true;
        }
        select.appendChild(new Option(sound.name, sound.id))
    })
    if(defaultValue != null && defaultValueSelectable) {
        select.value = defaultValue
    } else {
        select.value = "All"; //__SOUNDBOARDS[list].sounds[0].id
    }

    //select.dispatchEvent(new Event('change'))
}

document.querySelector('#selected-profile').addEventListener('change', (evnt) => {
    console.log("The type of list was changed")
    console.log(evnt)
    __SETTINGS['selected-profile'] = evnt.target.value
    $PI.setSettings(__SETTINGS)
    if(evnt.target.value) {
        loadListOfSounds(evnt.target.value, 
                         __SETTINGS['selected-sound'])
    }
})
document.querySelector('#list-of-sounds').addEventListener('change', (evnt) => {
    const soundId = __SETTINGS['selected-sound'] = evnt.target.value

    updateButtonWithVoiceBitmap(soundId)

    console.log("saving settings: ", __SETTINGS)
    $PI.setSettings(__SETTINGS)
})

function listOfSoundsEmpty() {
    return document.querySelector('#list-of-sounds options').length == 0
}



function getSound(vid) {
    if(__SOUNDBOARDS == null) return //we haven't loaded the data from the plugin yet
    console.log("Selected profile: ", __SETTINGS['selected-profile'])
    let s = __SOUNDBOARDS[__SETTINGS['selected-profile']].sounds.find( s => s.id == vid)
    return s;
   
}

function updateButtonWithVoiceBitmap(soundId) {
    const sound = getSound(soundId)
    const soundImg = sound?.image
    if(!soundImg && !sound?.updated) {
        __SETTINGS['button-images'] = null; //we make sure remove existing images if they're from a past meme
        $PI.sendToPlugin({
            action: 'retrieveSoundBitmap',
            sound: soundId,
            currentSettings: __SETTINGS
        })
    } else {
        if(soundImg) {
            $PI.sendToPlugin({
                action: 'setImage',
                image: soundImg
            })
        }

    }
}

