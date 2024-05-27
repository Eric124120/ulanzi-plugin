/// <reference path="resources/libs/js/timers.js"/>
/// <reference path="resources/libs/js/constants.js"/>
/// <reference path="resources/libs/js/events.js"/>
/// <reference path="resources/libs/js/storage.js"/>
/// <reference path="resources/libs/js/ulanzi-deck.js"/>
/// <reference path="resources/libs/js/voicemod.js"/>

const VoiceLists = {
    all: 'allVoices',
    fav: 'favoriteVoices',
    custom: 'customVoices'
}

let __STATE = {
    pendingLoadingVoiceImages: 0,
    pendingLoadingSoundImages: 0
}

const SoundsLists = {
    all: "All"
}

function sortByName(prop) {
    return (a,b) => {
        if ( a[prop] < b[prop]){
            return -1;
        }
        if ( a[prop] > b[prop] ){
            return 1;
        }
        return 0;
    }
}

/* This function overwrites the "target" list with the content of "newList", however, in process it:

- Iterates over every voice in the new list
- If the voice isn't on the target list being re-writen, then we trigger a 'getVoiceBitmap' event for this new voice.
- However, if the voice is not new, we check the value of "bitmapChecksum" and compare it to the same voice in the target list.
    - This is relevant for when you as a user update the bitmap of a voice. 
    - By comparing the bitmapChecksum values of both versions of the voice, we can tell if we need to request the new image or not.
    if the checksum is different, then we'll trigger a 'getVoiceBitmap' message for the voice.
*/
function updateListOfVoices(target, newList) {
    newList.forEach( newVoice => {
        let existingVoice = target[VoiceLists.all].find( voice => {
            return voice.id == newVoice.id
        })

        if(!existingVoice) {
            Voicemod.sendMessageToServer('getVoiceBitmap', newVoice.id, newVoice.id)
            __STATE.pendingLoadingVoiceImages++;
        } else {
            if( (existingVoice.bitmapChecksum != newVoice.bitmapChecksum)) {
                __STATE.pendingLoadingVoiceImages++;
                Voicemod.sendMessageToServer('getVoiceBitmap', existingVoice.id, existingVoice.id)
            }
        }
    })
    target[VoiceLists.all] = newList
    return target
}

function updateListOfSounds(target, newList) {
    newList.forEach( newSoundBoard => {

        //in case the collection comes empty (if we remove all sounds from our custom collection for example)
        if(!newSoundBoard.sounds || !Array.isArray(newSoundBoard.sounds)) {
            target[newSoundBoard.name] = newSoundBoard
            return;
        }

        newSoundBoard.sounds.forEach( newSound => {
            let existingSound = target[newSoundBoard.name] ? target[newSoundBoard.name].sounds.find( s => s.id == newSound.id ) : false

            if(!existingSound) {
                Voicemod.sendMessageToServer('getMemeBitmap', newSound.id, newSoundBoard.name)
                __STATE.pendingLoadingSoundImages++;
            } else {
                //existingSound.updated = true

                if( (newSound.bitmapChecksum != existingSound.bitmapChecksum)) {
                    __STATE.pendingLoadingSoundImages++;
                    Voicemod.sendMessageToServer('getMemeBitmap', existingSound.id, newSoundBoard.name)
                }
                
                existingSound.name = newSound.name
                existingSound.playbackMode = newSound.playbackMode
                let idx = newSoundBoard.sounds.findIndex( s => s.id == existingSound.id)
                newSoundBoard.sounds[idx] = existingSound //updated voice name
            }
        })
        target[newSoundBoard.name] = newSoundBoard
    })
    let previousSBNames = Object.keys(target)
    //we remove soundboards from the previous version of the list if they're not part of the new list
    // this can happen if on FS you rename some collections
    previousSBNames.forEach( sbname => {
        if(!newList[sbname]) {
            delete target[sbname]
        }
    })
}

/**
 * Updates the collection of voices to make sure the selected voice has its images loaded 
 * @param {string} voiceID  The voice ID inside the complete collection
 * @param {object} images  An object with all 3 versions of the bitmap
 */
function updateVoiceBitmap(voiceID, images) {
    let voice = Voicemod.__voicesLists[VoiceLists.all].find( v =>{
        return v.id == voiceID
    })
    console.log("CURRENT VERSION OF THE VOICE: ", voice)
    if(voice) {
        voice.images = images

        __STATE.pendingLoadingVoiceImages--;
        if(__STATE.pendingLoadingVoiceImages == 0) {
            Voicemod.emit(VoicemodEventKeys.allVoicesLoaded, null) //we've successfully loaded all voices, let pending events know that.
        }
        if(__STATE.pendingLoadingVoiceImages < 0) {
            __STATE.pendingLoadingVoiceImages  = 0; //correct the number
        }

        console.log("FINAL STATUS: ")
        console.log("Voice: ", voice)
        let idx = Voicemod.__voicesLists[VoiceLists.all].findIndex( v => v.id == voiceID)
        console.log("Voice in the list: ", Voicemod.__voicesLists[VoiceLists.all][idx])
    }

}

//we reset the "updated" parameter on every sound to FALSE
function resetAllSoundboards() {
    if(! Voicemod.__soundLists) return //if this happens before we even create this, then don't bother
    Object.keys(Voicemod.__soundLists).forEach(sb => {
        Voicemod.__soundLists[sb].sounds = Voicemod.__soundLists[sb].sounds.map(  s => {
            s.updated =  false
            return s
        })
    })
}

/**
 *  Updates the collection's item to also have the image for it 
 * @param {string} sb_name The soundboard name (its ID)
 * @param {string} memeId  The ID of the sound to update inside its soundboard
 * @param {string} bm  The actual image BASE64-encoded
 */
function updateSoundBitMap(sb_name, memeId, bm) {
    let sound = Voicemod.__soundLists[sb_name].sounds.find( s => s.id == memeId)
    if(sound) {
        sound.image = bm
    }
    let index = Voicemod.__soundLists[sb_name].sounds.findIndex( s => s.id == memeId)
    Voicemod.__soundLists[sb_name].sounds[index] = sound
    __STATE.pendingLoadingSoundImages--;
    if(__STATE.pendingLoadingSoundImages == 0) {
        Voicemod.emit(VoicemodEventKeys.allSoundsLoaded, null) //we've successfully loaded all voices, let pending events know that.
    }
    if(__STATE.pendingLoadingSoundImages < 0) {
        __STATE.pendingLoadingSoundImages = 0;
    }
    setGlobalSettings({sounds: Voicemod.__soundLists});
}


//Standard initialization code.
/*
Once we connect with VM, we do the following:

1. Send the registerClient message with SD's unique key.
2. Set the SD's global configuration to have the "status" of connected.
3. We then request the global settings from SD and once we get them, we set a fake 
SID (this is calculated by VM directly) and a flag determining if we've downloaded the VM app by clicking on the 
"Download Voicemod" button (for revenue share purposes with Elgato).
4. We then send the "registerPlugin" with that information


Once the code receives the "registerClient" response, we'll then send messages to get the status of every toggle, voice and sound.

The messages sent are: 
- 'getVoices'
- 'getCurrentVoice'
- 'getVoiceChangerStatus'
- 'getHearMyselfStatus'
- 'getBackgroundEffectStatus'
- 'getMuteMicStatus'
- 'getAllSoundboard'
- 'getMuteMemeForMeStatus'

We're also sendig the 'getUserLicense' every 10 seconds as long as the response to that event is "free".
Once the user becomes "pro" we stop the interval.


*/

function getGlobalSettings() {
    return window.getUlanziGlobalSettings() || window.__GLOBAL_SETTINGS;
}

function setGlobalSettings(newSettings) {
    // 本地设置
    window.__GLOBAL_SETTINGS = {...window.__GLOBAL_SETTINGS, ...newSettings};
    $UD.setGlobalSettings(window.__GLOBAL_SETTINGS)
}

function getGlobalSettingsAndThen(fn) {
    const settings = getGlobalSettings();
    fn(settings);
}

Voicemod.init({
    port: [59129,20000,39273,42152,43782,46667,35679,37170,38501,33952,30546],
    autoRetry: true,
    onConnect: function(){
        console.log("onConnect Delegado");        
        Voicemod.sendMessageToServer('registerClient', 'streamdeck-v2');
        setGlobalSettings({
            status: VoicemodStatus.connected 
        })
        getGlobalSettingsAndThen((settings) => {
            const msgPayload = {
                SID: 123,
                downloadedFromSD: settings.downloadedFromSD || 0
            }
            console.log("registering plugin with: ", msgPayload)
            Voicemod.sendMessageToServer('registerPlugin', msgPayload)
        })
    },
    onDisconnect: function(){
        console.log("onDisconnect Delegado");
        resetAllSoundboards()
        setGlobalSettings({
            status: VoicemodStatus.offline
        })

    },
    onError: function(){
        console.log("onError Delegado");        
    },        
    onMessage: function(actionType, actionObject, actionID){        
        if(actionObject != null && typeof(actionObject) === "string")
        {
            actionObject = JSON.parse(actionObject);
        }
        
        switch(actionType){                        
            case 'updateSDPluginData':
                console.log("Updated sd plugin data from API: ", actionObject)
                getGlobalSettingsAndThen((settings) => {
                    setGlobalSettings({...settings, ...{
                        downloadedFromSD: actionObject.downloadedFromSD,
                        downloadSourceValidated: true
                    }})
                })
            break;
            case "registerClient":                
                console.log("Getting license...")
                licenseInterval = setInterval(() => { //every
                    Voicemod.sendMessageToServer('getUserLicense');
                }, voicemodGetUserLicenseTimes)
                Voicemod.sendMessageToServer('getUserLicense');
                Voicemod.sendMessageToServer('getVoices');
                Voicemod.sendMessageToServer('getCurrentVoice');
                Voicemod.sendMessageToServer('getVoiceChangerStatus')
                Voicemod.sendMessageToServer('getHearMyselfStatus')
                Voicemod.sendMessageToServer('getBackgroundEffectStatus')
                Voicemod.sendMessageToServer('getMuteMicStatus');
                Voicemod.sendMessageToServer('getAllSoundboard');
                Voicemod.sendMessageToServer('getMuteMemeForMeStatus');

            break;
            case 'getUserLicense':
                console.log("Setting the license type of the user to ", actionType.licenseType)
                getGlobalSettingsAndThen((settings) => {
                    if(actionObject.licenseType == VoicemodLicenseType.pro) { //if the user is PRO, we stop asking
                        clearInterval(licenseInterval)
                    }
                    setGlobalSettings({...settings, ...{
                        licenseType: actionObject.licenseType
                    }})
                })
            break;
            case 'getBitmap': //this event is triggered for both, voices and sounds
                console.log('getting bitmap for image', actionID)
                if(actionObject.memeId) { //if there is a memeId then we're talking about sounds
                    let sb_name = actionID
                    if(!Voicemod.__soundLists) {
                        Voicemod.onAllSoundsLoadedWithID('init-sounds', () => {
                            updateSoundBitMap(sb_name, actionObject.memeId, actionObject.result.default)
                            Voicemod.removeEventListeners('init-sounds')
                        })
                    } else {
                        updateSoundBitMap(sb_name, actionObject.memeId, actionObject.result.default)
                    }

                } else { //otherwise we're talking about voices
                    if(!Voicemod.__voicesLists) { //not fully loaded yet
                        console.log("Voices not loaded yet, waiting for all to finish...")
                        __STATE.pendingLoadingVoiceImages++;
                        Voicemod.onAllVoicesLoadedWithID('init', () => {
                            console.log("TRIGGERED ON ALL VOICES LOADED!")
                            console.log("Updating ", actionID, "with", actionObject.result)
                            updateVoiceBitmap(actionID, actionObject.result)
                            Voicemod.removeEventListeners('init')
                        })
                    } else {
                        updateVoiceBitmap(actionID, actionObject.result)
                    }
                }
            break;
            case "getVoices":
                actionObject.voices = actionObject.voices.sort(sortByName('friendlyName')).filter( v => v.id != "custom") //remove the "custom" voice, because it's not used by the app
                ///First check if we already have a loaded list of voices
                if(Voicemod.__voicesLists && Voicemod.__voicesLists[VoiceLists.all].length > 0) { //if we do, then simply add the ones we don't have
                    Voicemod.__voicesLists = updateListOfVoices(Voicemod.__voicesLists, actionObject.voices.filter( voice => voice.enabled))
                } else { //otherwise, load the full list 
                    Voicemod.__voicesLists = {}
                    Voicemod.__voicesLists[VoiceLists.all] = actionObject.voices.filter( voice => voice.enabled )
                }

                totalVoices = Voicemod.__voicesLists[VoiceLists.all].length
                let allVoices = Voicemod.__voicesLists[VoiceLists.all]
                
                Voicemod.__voicesLists[VoiceLists.custom] = allVoices.filter( voice => {
                    return voice.isCustom
                })
                Voicemod.__voicesLists[VoiceLists.fav] = allVoices.filter( voice => {
                    return voice.favorited
                })
                console.log("FINISHED LOADING VOICES..., pending images to load: ", __STATE.pendingLoadingVoiceImages)
                setGlobalSettings({voices: Voicemod.__voicesLists});
                Voicemod.emitForId(VoicemodEventKeys.allVoicesLoaded, 'init', null) //we've successfully loaded all voices, let pending events know that.
            break;
            case "getAllSoundboard":
                console.log("loadInterfaceMemes");
                actionObject.soundboards = actionObject.soundboards.sort(sortByName('name')).filter(sb => sb.enabled)

                if(Voicemod.__soundLists && Voicemod.__soundLists[SoundsLists.all].sounds.length > 0) { //we're getting the list but we already have sounds loaded
                    updateListOfSounds(Voicemod.__soundLists, actionObject.soundboards)
                } else {
                    Voicemod.__soundLists = {}
                }
                console.log(actionObject.soundboards)
                let allSounds = []
                actionObject.soundboards.forEach(sb => {
                    Voicemod.__soundLists[sb.name] = sb;
                    if(sb.sounds) {
                        let sortedSounds = sb.sounds.sort(sortByName('name'))
                        sortedSounds.forEach(s => {
                            //Voicemod.sendMessageToServer('getMemeBitmap', s.id, sb.name)
                            let newSound = {...s}; //clone it, so we don't overwrite the name of every meme on every list
                            newSound.name = `${sb.name} - ${s.name}`
                            allSounds.push(newSound)
                        })
                    }
                })
                //there is no "all" soundboard coming from VM ,so we create it here manually
                Voicemod.__soundLists[SoundsLists.all] = {
                    enabled: true,
                    isCustom: false,
                    name: "All",
                    sounds: allSounds
                }
                if(__STATE.pendingLoadingSoundImages === 0) {
                    Voicemod.emit(VoicemodEventKeys.allSoundsLoaded, null)
                }
                setGlobalSettings({sounds: Voicemod.__soundLists});
            break;
        }
        
    },
    onDebug: function(debugMessage){
        console.log("DEBUG::", debugMessage)
    }
});
