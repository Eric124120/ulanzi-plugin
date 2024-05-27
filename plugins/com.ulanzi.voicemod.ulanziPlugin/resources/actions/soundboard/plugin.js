(() => {

class SoundboardActionClass {

    __buttonSettings = {};
    actionUUID = null;
    on = EventEmitter.on;
    emit = EventEmitter.emit;

    constructor(actionUUID) {
        this.actionUUID = actionUUID;
    }

    updateSettings(context, settings) {
        this.__buttonSettings[context] = settings;
    }

    getCurrentSettings(context) {
        return this.__buttonSettings[context]
    }

    saveSettings(context, key, action, settings) {
        this.updateSettings(context, settings)
        $UD.setSettings(context,key, action, settings)
    }

    isActive(voiceId) {
        return this.__buttonSettings[voiceId].active
    }

    addButtonSetting(id, settings) {
        settings.active = false
        this.__buttonSettings[id] = settings
    }

    __setActive(context, key, actionid, isActive) {
        this.__buttonSettings[context]['is-active'] = isActive;
        this.saveSettings(context, key, actionid, this.__buttonSettings[context])
    }

    onWillAppear(fn) {
        if(!fn) {
            console.error(
                'A callback function for the willAppear event is required for onWillAppear.'
            );
        }

        return this.on(`${this.actionUUID}.${Events.willAppear}`, (jsn) => fn(jsn));
    }

    onWillDisappear(fn) {
        if (!fn) {
			console.error(
				'A callback function for the willDisappear event is required for onWillDisappear.'
			);
		}

		this.on(`${this.actionUUID}.${Events.willDisappear}`, (jsn) => fn(jsn));
		return this;
    }

    onSendToPlugin(fn) {
		if (!fn) {
			console.error(
				'A callback function for the sendToPlugin event is required for onSendToPlugin.'
			);
		}

		this.on(`${this.actionUUID}.${Events.sendToPlugin}`, (jsn) => fn(jsn));
		return this;
	}

    getSettingsAndThen(uuid, key, fn) {
        const data = $UD.settingsCache[getUniqueActionId(uuid, key)];
        if (uuid == data.uuid) {
            fn(data.uuid, data.param.settings || {});
        }
    }

    onRun(fn) {
		if (!fn) {
			console.error('A callback function for the run event is required for onRun.');
		}

		this.on(`${this.actionUUID}.${Events.run}`, (jsn) => fn(jsn));
		return this;
	}
    onRunAfter(fn) {
        if (!fn) {
			console.error('A callback function for the run event is required for onRun.');
		}

		this.on(`${this.actionUUID}.${Events.runAfter}`, (jsn) => fn(jsn));
		return this;
    }
}


const SoundboardAction = new SoundboardActionClass(ComUlanziUlanzideckVoicemodSoundboard)


function loadMyBitMap(context, key, img) {
    return $UD.setImage(context, key, 'data:image/png;base64,' + img, 1)
}

SoundboardAction.onSendToPlugin((data) => {

    console.log("EVent received from PI: ")
    const payload = data.payload;
    const context = data.uuid;
    const key = data.key;
    const actionid = getUniqueActionId(context, key);
    console.log("send to  plugin received: ", payload.action)
    if(payload.action == 'getSoundboards') {
        console.log("Sending list of sounds to PI:")
        console.log(Voicemod.__soundLists)
        return $UD.sendToPropertyInspector(context, key, actionid, {
            action: 'getSoundboards',
            soundboards: Voicemod.__soundLists
        })
    }
    if(payload.action == 'setImage') {
        console.log('setting action image')
        return loadMyBitMap(context, key, payload.image)
    }

    if(payload.action == 'retrieveSoundBitmap') {
        if(!payload.payload.currentSettings['button-images']) {
            Voicemod.onBitMapLoaded(context + "-tmp", ({ actionObject}) => {
                loadMyBitMap(context, key, actionObject.result.default)
                Voicemod.removeEventListeners(context + "-tmp")
                Voicemod.__soundLists[payload.payload.currentSettings['selected-profile']].sounds.forEach ((s, idx) => {
                    if(s.id == payload.payload.currentSettings['selected-sound']) {
                        Voicemod.__soundLists[payload.payload.currentSettings['selected-profile']].sounds[idx].updated = true
                    }
                })
                //update the list on the property inspector so it has the image data as well
                $UD.sendToPropertyInspector(context, key, actionid, {
                    action: 'getSoundboards',
                    soundboards: Voicemod.__soundLists
                })
            })
        }
        requestBitMap({"my-context": context, 'my-key': key, ...payload.payload.currentSettings})
    }

})

SoundboardAction.onRun((evnt) => {
   const settings = evnt.param.settings

   Voicemod.sendMessageToServer('playMeme', settings['selected-sound'])
})

// SoundboardAction.onRunAfter((evnt) => {
//     const settings = evnt.payload.settings

//     let sound = Voicemod.__soundLists[SoundsLists.all].sounds.find( s => s.id == settings['selected-sound'])
//     if(sound.playbackMode == 'PlayLoopOnPress') { //these memes need to not loop if the key is not pressed
//         Voicemod.sendMessageToServer('stopAllMemeSounds')
//     }
// })

function parseSettings(settings) {
    let newSettings = {}

    if(settings?.settings) { //we're dealing with an old version of the plugin
        newSettings['selected-sound'] = settings.settings['meme_selected']
        //default value used on the old plugin
        newSettings['selected-profile'] = settings.settings['profile_selected'] == 'Todas' ? 'All' :  settings.settings['profile_selected']
        if(newSettings['selected-profile'] == '') { //default value used on the new plugin
            newSettings['selected-profile'] = 'All'
        }
        return newSettings
    }
    return settings
}

SoundboardAction.onWillDisappear((evnt) => {
    Voicemod.removeEventListeners(evnt.uuid)
})

SoundboardAction.onWillAppear((evnt) => {


    SoundboardAction.getSettingsAndThen(evnt.uuid, evnt.key, (buttonContext, currentButtonSettings) => {
        currentButtonSettings = parseSettings(currentButtonSettings)
        SoundboardAction.saveSettings(buttonContext, evnt.key, evnt.actionid, currentButtonSettings)
       //we might not have the images yet, let's request them when the button shows on screen
       console.log("Button settings received (", buttonContext,"): ", currentButtonSettings)
        if(!Voicemod.connected) {
            Voicemod.onConnected(buttonContext, () => {
                console.log("calling requestBitMap after VM connection is ready")
                requestBitMap({...currentButtonSettings, 'my-key': evnt.key})
            })
        } else {
            console.log("Calling requestBitMap because VM is connected")
            requestBitMap({...currentButtonSettings, 'my-key': evnt.key})
        }
    })

    Voicemod.onBitMapLoaded(evnt.uuid, ({ actionObject}) => {
        SoundboardAction.getSettingsAndThen(evnt.uuid, evnt.key, (buttonContext, currentButtonSettings) => {
            if(typeof actionObject.memeId != "undefined" && actionObject.memeId == currentButtonSettings['selected-sound']) { //the moment we have the right bitmap, let's set it on the key
            //if(actionObject.context == evnt.context) {
                if(actionObject.result?.default) {
                    loadMyBitMap(buttonContext, evnt.key, actionObject.result.default)
                    currentButtonSettings['button-images'] = actionObject.result
                    currentButtonSettings['my-context'] = buttonContext
                    currentButtonSettings['selected-sound'] = currentButtonSettings['selected-sound']
                    currentButtonSettings['is-active'] = false //default value

                    SoundboardAction.saveSettings(buttonContext, evnt.key, evnt.actionid, currentButtonSettings)
                    console.log("Saving settings for button: ", currentButtonSettings)
            
                }
            }
        })
    })
    Voicemod.onAllSoundsLoaded(() => {
        let currentSettings = SoundboardAction.getCurrentSettings(evnt.uuid)
        if(currentSettings) {
            let sound = Voicemod.__soundLists[SoundsLists.all].sounds.find( s => s.id == currentSettings['selected-sound'])
            currentSettings['button-images'] = sound.image
            SoundboardAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, currentSettings)
        }   
        $UD.sendToPropertyInspector(evnt.uuid, {
            action: 'getSoundboards',
            soundboards: Voicemod.__soundLists
        })
 
    })


})

function requestBitMap(settings) {
    console.log("On RequestBitmap: ", settings)
    if(settings['selected-sound'] && !settings['button-images']) {
        console.log("requesting bitmap for meme: ", settings['selected-sound'])
        console.log("settings: ", settings)
        Voicemod.sendMessageToServer('getMemeBitmap', settings['selected-sound'], settings['selected-profile'])
    } else if(settings['button-images']) {
        Voicemod.forceMessage({ //we fake a message, as if it was received by the server
            actionType: 'getBitmap',
            actionID: settings['selected-profile'],
            actionObject: {
                memeId: settings['selected-sound'],
                result: settings['button-images']
            }
        })
        loadMyBitMap(settings['my-context'], settings['my-key'], settings['button-images'].default)
    }
}

})()