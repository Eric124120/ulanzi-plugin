const actionUUID = ComUlanziUlanzideckVoicemodChanger;

let __MY_CONTEXT = null;
let __SETTINGS = {}
const __SETTINGS_MAP = {};

let __BUTTON_ID = null;
let __BUTTON_VOICE = null;

let LOADING_VOICE = false

class VoiceChangerActionClass {

    __buttonSettings = {};
    actionUUID = null;
    on = EventEmitter.on;
    emit = EventEmitter.emit;

    constructor(actionUUID) {
        this.actionUUID = actionUUID;
    }

    updateSettings(actionid, settings) {
        this.__buttonSettings[actionid] = {...settings};
    }

    saveSettings(context, key, actionid, settings) {
        this.updateSettings(actionid, settings)
        $UD.setSettings(context, key, actionid, settings)
        this.updateButtonState(context, key, settings)
    }

    getCurrentSettings(actionid) {
        return {...this.__buttonSettings[actionid]}
    }

    isActive(voiceId) {
        return this.__buttonSettings[voiceId].active
    }

    addButtonSetting(id, settings) {
        settings.active = false
        this.__buttonSettings[id] = settings
    }

    // 加载（更新）图标
    updateButtonState(context, key, settings) {
        if(!settings['button-images']) return //for some reason there are no images for this voice
        loadMyBitMap(context, key, settings['is-active']
                                ? settings['button-images'].selected 
                                : settings['button-images'].transparent? settings['button-images'].transparent : settings['button-images'].default)
    }

    __setActive(context, key, actionid, isActive) {
        this.__buttonSettings[actionid]['is-active'] = isActive;
        this.saveSettings(context, key, actionid, this.__buttonSettings[actionid])
    }
    getSettingsAndThen(context, key, fn) {
        const data = $UD.settingsCache[getUniqueActionId(context, key)];
        if (context == data.uuid) {
            fn(data.uuid, data.param.settings || {});
        }
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
    onRun(fn) {
		if (!fn) {
			console.error('A callback function for the run event is required for onRun.');
		}

		this.on(`${this.actionUUID}.${Events.run}`, (jsn) => fn(jsn));
		return this;
	}
}


const VoiceChangerAction = new VoiceChangerActionClass(actionUUID);

function loadMyBitMap(context, key, img) {
    return $UD.setImage(context, key, 'data:image/png;base64,' + img)
}
VoiceChangerAction.onSendToPlugin((data) => {
    const payload = data.payload;
    const context = data.uuid;
    const key = data.key;
    const actionid = data.actionid;
    console.log("send to  plugin received: ", payload.action)
    if(payload.action == 'setImage') {
        const img = 'data:image/png;base64,' + payload.payload.image
        console.log("img to set. ")
        return $UD.setImage(context, key, img, 0)
    }
    if(payload.action == 'getVoices') {
        console.log(Voicemod.__voicesLists)
        return $UD.sendToPropertyInspector(context, key, actionid, {
            action: 'getVoices',
            voices: Voicemod.__voicesLists
        })
    }
    if(payload.action == "updateBtnVoice") {
        const currentVoice = Voicemod.__voicesLists[VoiceLists.all].find( v => v.id == payload.payload.voiceId)
        if(!currentVoice?.images) {
            requestVoiceBitMap({'selected-voice': currentVoice.id})
        }
        return VoiceChangerAction.saveSettings(context, key, actionid, {
            ...payload.payload.currentSettings,
            'selected-voice': currentVoice.id,
            'button-images': currentVoice.images,
            'my-context': context,
            'is-active': false,

        })
    }
})


VoiceChangerAction.onRun((evnt) => {
    const settings = evnt.param.settings;
    const currentBtnSettings = VoiceChangerAction.getCurrentSettings(evnt.actionid)

    if(!currentBtnSettings['is-active']) {
        LOADING_VOICE = true

        Voicemod.sendMessageToServer('selectVoice', settings['selected-voice'])
        settings['is-active'] = true
    }

   VoiceChangerAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, settings)

   //update all other buttons to be disabled 
   let otherButtons = Object.keys(VoiceChangerAction.__buttonSettings).filter( key => key != evnt.actionid)
   otherButtons.forEach(actionid => {
    const btn = $UD.getPluginDataByActionid(actionid);
    VoiceChangerAction.__setActive(
        btn.uuid,
        btn.key,
        btn.actionid,
        false
    )
   })

})


function parseSettings(__settings) {
    let newSettings = {
        'is-active': false,
        'my-context': null,
    }

    if(__settings?.settings) { //we're dealing with an old version of the plugin and need to udpate it
        newSettings['button-image'] = __settings.settings?.icon?.image
        newSettings['selected-voice'] = __settings.settings['voice_selected']
        newSettings['selected-voice-skin'] = __settings.settings['voice_properties_selected']?.skin
        newSettings['voice-type-selected'] = __settings.settings['radiobutton_selected']
        console.log("RETURNING NEW SETTING INSTEAD: ", newSettings)
        return newSettings
    }
    return {...newSettings, ...__settings}
}
VoiceChangerAction.onWillAppear((evnt) => {
    let settings = parseSettings(evnt.param)
    let mySelectedVoice = settings['selected-voice']
    Voicemod.onBitMapLoaded(evnt.actionid, ({actionID: voiceID, actionObject}) => {
        let btnSettings = VoiceChangerAction.getCurrentSettings(evnt.actionid)

        let voice = btnSettings? btnSettings['selected-voice'] : mySelectedVoice

        if(voiceID == voice) { //the moment we have the right bitmap, let's set it on the key
            
            if(actionObject.result?.default) {
                loadMyBitMap(evnt.uuid, evnt.key, actionObject.result.default);
                btnSettings['button-images'] = actionObject.result;
                btnSettings['my-context'] = evnt.uuid;
                btnSettings['is-active'] = false; //default value;
                btnSettings['selected-voice'] = voiceID;
                VoiceChangerAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, btnSettings);
                
            }
        }
    })


    Voicemod.onGetCurrentVoice( ({actionObject}) => {
        let btnSettings = VoiceChangerAction.getCurrentSettings(evnt.actionid)
        if(btnSettings['selected-voice'] != actionObject.voiceID && btnSettings['is-active']) {
            btnSettings['is-active'] = false
            return VoiceChangerAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, btnSettings)
        }
    })



    Voicemod.onVoiceLoaded(evnt.actionid, ({actionObject}) => {
        let btnSettings = VoiceChangerAction.getCurrentSettings(evnt.actionid)
        if(btnSettings && (actionObject.voiceID == btnSettings['selected-voice'])) {
            btnSettings['is-active'] = true;
            LOADING_VOICE = false
            return VoiceChangerAction.saveSettings(evnt.uuid, evnt.key, evnt.actionid, btnSettings)
        }
        Voicemod.sendMessageToServer('getCurrentVoice')
    })

    Voicemod.onAllVoicesLoaded(() => {
        let currentSettings = VoiceChangerAction.getCurrentSettings(evnt.actionid)
        if(currentSettings && currentSettings['selected-voice']) {
            let voice = Voicemod.__voicesLists[VoiceLists.all].find( v => v.id == currentSettings['selected-voice'])
            currentSettings['button-images'] = voice.images
            VoiceChangerAction.updateSettings(evnt.actionid, currentSettings)
        }
        $UD.sendToPropertyInspector(evnt.uuid, evnt.key, evnt.actionid, {
            action: 'getVoices',
            voices: Voicemod.__voicesLists
        })
    })

    VoiceChangerAction.getSettingsAndThen(evnt.uuid, evnt.key, (btnContext, __btnSettings) => {
        console.log("BUTTON SETTINGS FROM SD ", __btnSettings)
        let __settings = parseSettings(__btnSettings)
        let internalSettings = VoiceChangerAction.getCurrentSettings(evnt.actionid)
        __settings['is-active'] = internalSettings['is-active']
 

        VoiceChangerAction.updateSettings(evnt.actionid, __settings)

       VoiceChangerAction.updateButtonState(btnContext, evnt.key, __settings) //so we update the status of the button when changing pages
        //if we don't have the images yet, let's request them when the button shows on screen
        if(!__btnSettings['button-images']) {
            if(!Voicemod.connected) {
                Voicemod.onConnected(btnContext, () => {
                    console.log("Requesting bitmap now for: ", btnContext, "- ", __settings)
                    requestVoiceBitMap(__settings)
                })
            } else {
                requestVoiceBitMap(__settings)
            }   
        }
    })
    
})



VoiceChangerAction.onWillDisappear((evnt) => {
    Voicemod.removeEventListeners(evnt.actionid)
})