const effectMixerAction = new Action('com.voicemodplus.actions.effectmixer')

let MASTER_VALUE = 10.0 //temp

effectMixerAction.onDialRotate((evnt) => {
    console.log('the action is here..#')
    console.log(evnt)
    const settings = evnt.payload.settings
    MASTER_VALUE = Math.trunc( (MASTER_VALUE + (evnt.payload.ticks/100)) * 1000) / 1000;
    if(MASTER_VALUE > 10.0) {
        MASTER_VALUE = 10.0
    }
    if(MASTER_VALUE < 0) {
        MASTER_VALUE = 0
    }


    $SD.setTitle(evnt.context, MASTER_VALUE)
    Voicemod.sendMessageToServer('setCurrentVoiceParameter', {
        'parameterName': 'VoiceVolume',
        'parameterValue': {
            'value': MASTER_VALUE
        }
    })
    
    
})

effectMixerAction.onWillAppear((evnt) => {
    let totalVoices = 0
    let totalBitmaps = 0
    console.log('onWillAppear of the action!')
    console.log("event. ", evnt)

    console.log("voicemod at effectMixer....")
    console.log(Voicemod)
/*
    Voicemod.init({
        port: [59129,20000,39273,42152,43782,46667,35679,37170,38501,33952,30546],
        autoRetry: true,
        onConnect: function(){
            console.log("onConnect Delegado");        
            Voicemod.sendMessageToServer('registerClient', 'anyClient');
        },
        onDisconnect: function(){
            console.log("onDisconnect Delegado");
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
                case "registerClient":                
                Voicemod.sendMessageToServer('getUserLicense');
          //      Voicemod.sendMessageToServer('getVoices');
                //Voicemod.sendMessageToServer('getAllSoundboard');
                //Voicemod.sendMessageToServer('getBackgroundEffectStatus');
                //Voicemod.sendMessageToServer('getHearMyselfStatus');
                //Voicemod.sendMessageToServer('getVoiceChangerStatus');
                //Voicemod.sendMessageToServer('getMuteMemeForMeStatus');
                //Voicemod.sendMessageToServer('getMuteMicStatus');
                //Voicemod.sendMessageToServer('getCurrentVoice');
                break;
                case 'getBitmap':
                    console.log('bitmap for image', actionID)
                    console.log(actionObject)
                    let voiceID = actionID
                    let voice = Voicemod.__voicesLists['all'].find( v =>{
                        return v.id == voiceID
                    })
                    voice.images = actionObject.result
                    totalBitmaps++
                    if(voiceID == mySelectedVoice) { //the moment we have the right bitmap, let's set it on the key
                        loadMyBitMap(evnt.context, voice.images.default)
                    }
                break;
                case "getVoices":
                    console.log("loadInterfaceVoices");
                    
                    Voicemod.__voicesLists = {}
                    
                    Voicemod.__voicesLists['all'] = actionObject.voices.map(voice => {
                        Voicemod.sendMessageToServer('getVoiceBitmap', voice.id, voice.id)
                        return voice
                    })
                    totalVoices = Voicemod.__voicesLists['all'].length
                    
                    Voicemod.__voicesLists['custom'] = actionObject.voices.filter( voice => {
                        return voice.isCustom
                    })
                    Voicemod.__voicesLists['fav'] = actionObject.voices.filter( voice => {
                        return voice.favorited
                    })
                    
                    //if(firstTime) {
                    console.log("loading voices dropdown for the first time..")
                    
                    ///loadListOfVoices($PI.__globalSettings.voicemod.voiceTypeSelected)
                    ///selectDefaultVoice($PI.__globalSettings.voicemod.selectedVoice)
                    //}
                
                break;
                case "getAllSoundboard":
                console.log("loadInterfaceMemes");
                break;
                case "getAllMemes":
                console.log("getAllMemes");
                break;
                case "voiceChangedEvent":
                console.log("voiceChangedEvent");
                break;
                case 'toggleBackground':
                case 'toggleMuteMic':
                case 'toggleHearMyVoice':
                case 'toggleVoiceChanger':
                //          updateUI();
                break;
            }
            
        },
        onDebug: function(debugMessage){
            console.log("DEBUG::", debugMessage)
        }
    });
    */
    
})

