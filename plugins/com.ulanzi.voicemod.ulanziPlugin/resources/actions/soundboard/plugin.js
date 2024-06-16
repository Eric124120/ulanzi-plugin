(() => {

class SoundboardActionClass {

    __buttonSettings = {};
    actionUUID = null;
    on = EventEmitter.on;
    emit = EventEmitter.emit;

    constructor(actionUUID) {
        this.actionUUID = actionUUID;
    }

    updateSettings(actionid, settings) {
        this.__buttonSettings[actionid] = settings;
    }

    getCurrentSettings(actionid) {
        return this.__buttonSettings[actionid]
    }

    saveSettings(uuid, key, actionid, settings) {
        this.updateSettings(actionid, settings)
        $UD.setSettings(uuid, key, actionid, settings)
    }

    isActive(actionid) {
        return this.__buttonSettings[actionid].active
    }

    addButtonSetting(actionid, settings) {
        settings.active = false
        this.__buttonSettings[actionid] = settings
    }

    __setActive(uuid, key, actionid, isActive) {
        this.__buttonSettings[actionid]['is-active'] = isActive;
        this.saveSettings(uuid, key, actionid, this.__buttonSettings[actionid])
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

    getSettingsAndThen(actionid, fn) {
        const data = $UD.settingsCache[actionid];
        if (actionid == data.actionid) {
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
    onSetActive(fn) {
        if (!fn) {
			console.error('A callback function for setactive run event is required for onSetActive.');
		}

		this.on(`${this.actionUUID}.${Events.setActive}`, (jsn) => fn(jsn));
		return this;
    }
}


const SoundboardAction = new SoundboardActionClass(ComUlanziUlanzideckVoicemodSoundboard)


function loadMyBitMap(uuid, key, actionid, img) {
    return $UD.setImage(uuid, key, actionid, 'data:image/png;base64,' + img)
}

SoundboardAction.onSendToPlugin((data) => {

    console.log("EVent received from PI: ")
    const payload = data.payload;
    const uuid = data.uuid;
    const key = data.key;
    const actionid = data.actionid;
    console.log("send to  plugin received: ", payload.action)
    if(payload.action == 'getSoundboards') {
        console.log("Sending list of sounds to PI:")
        console.log(Voicemod.__soundLists)
        return $UD.sendToPropertyInspector(uuid, key, actionid, {
            action: 'getSoundboards',
            soundboards: Voicemod.__soundLists
        })
    }
    if(payload.action == 'setImage') {
        console.log('setting action image')
        return loadMyBitMap(uuid, key, actionid, payload.payload.image)
    }

    if(payload.action == 'retrieveSoundBitmap') {
        if(!payload.payload.currentSettings['button-images']) {
            Voicemod.onBitMapLoaded(actionid + "-tmp", ({ actionObject}) => {
                loadMyBitMap(uuid, key, actionid, actionObject.result?.default)
                Voicemod.removeEventListeners(actionid + "-tmp")
                Voicemod.__soundLists[payload.payload.currentSettings['selected-profile']].sounds.forEach ((s, idx) => {
                    if(s.id == payload.payload.currentSettings['selected-sound']) {
                        Voicemod.__soundLists[payload.payload.currentSettings['selected-profile']].sounds[idx].updated = true
                    }
                })
                //update the list on the property inspector so it has the image data as well
                $UD.sendToPropertyInspector(uuid, key, actionid, {
                    action: 'getSoundboards',
                    soundboards: Voicemod.__soundLists
                })
            })
        }
        requestBitMap({uuid, key, actionid, ...payload.payload.currentSettings})
    }

})

SoundboardAction.onRun((evnt) => {
   const settings = evnt.param.settings
   SoundboardAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, settings)
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
SoundboardAction.onSetActive((evnt) => {
    let btnSettings = SoundboardAction.getCurrentSettings(evnt.actionid);
    let pluginBtnSettings = window.getUlanziPluginSettings(evnt.actionid) || {};
    requestBitMap({uuid: evnt.uuid, key:  evnt.key, actionid: evnt.actionid, ...btnSettings, ...pluginBtnSettings})
})
SoundboardAction.onWillAppear((evnt) => {


    SoundboardAction.getSettingsAndThen(evnt.actionid, (buttonContext, currentButtonSettings) => {
        currentButtonSettings = parseSettings(currentButtonSettings)
        SoundboardAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, currentButtonSettings)
        if(!Voicemod.connected) {
            Voicemod.onConnected(buttonContext, () => {
                requestBitMap({uuid: evnt.uuid, key:  evnt.key, actionid: evnt.actionid, ...currentButtonSettings})
            })
        } else {
            requestBitMap({uuid: evnt.uuid, key:  evnt.key, actionid: evnt.actionid, ...currentButtonSettings})
        }
    })

    Voicemod.onBitMapLoaded(evnt.uuid, ({ actionObject}) => {
        SoundboardAction.getSettingsAndThen(evnt.actionid, (buttonContext, currentButtonSettings) => {
            if(typeof actionObject.memeId != "undefined" && actionObject.memeId == currentButtonSettings['selected-sound']) { //the moment we have the right bitmap, let's set it on the key
                if(actionObject.result?.default) {
                    loadMyBitMap(evnt.uuid, evnt.key, evnt.actionid, actionObject.result.default)
                    currentButtonSettings['button-images'] = actionObject.result
                    currentButtonSettings['uuid'] = evnt.uuid
                    currentButtonSettings['key'] = evnt.key
                    currentButtonSettings['actionid'] = evnt.actionid
                    currentButtonSettings['selected-sound'] = currentButtonSettings['selected-sound']
                    currentButtonSettings['is-active'] = false //default value

                    SoundboardAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, currentButtonSettings)
                    console.log("Saving settings for button: ", currentButtonSettings)
            
                }
            }
        })
    })
    Voicemod.onAllSoundsLoaded(() => {
        let currentSettings = SoundboardAction.getCurrentSettings(evnt.actionid)
        if(currentSettings) {
            let sound = Voicemod.__soundLists[SoundsLists.all].sounds.find( s => s.id == currentSettings['selected-sound'])
            currentSettings['button-images'] = sound.image
            SoundboardAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, currentSettings)
        }   
        $UD.sendToPropertyInspector(evnt.uuid, evnt.key, evnt.actionid, {
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
        loadMyBitMap(settings.uuid, settings.key, settings.actionid, settings['button-images'].default)
    }
}

})()