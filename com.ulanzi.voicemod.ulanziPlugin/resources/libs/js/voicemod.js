
function updateUI() {}

const VoicemodEventKeys = {
    toggleVoiceChanger: 1,
    bitmapLoaded: 2,
    voiceChangerDisabled: 3,
    voiceChangerEnabled: 4,
    toggleHearMyVoice: 5,
    hearMyVoiceDisabled: 6,
    hearMyVoiceEnabled: 7,
    toggleBackgroundEffect: 8,
    backgroundEffectsEnabled: 10,
    backgroundEffectsDisabled: 11,
    voiceLoaded: 9,
    toggleMuteMic: 12,
    muteMicDisabled: 13,
    muteMicEnabled: 14,
    getAllSoundboard: 15,
    muteMemeForMe: 16,
    muteMemeForMeDisabled: 17,
    muteMemeForMeEnabled: 18,
    getCurrentVoice: 19,
    wsConnected: 100,
    allVoicesLoaded: 101,
    allSoundsLoaded: 102

}

const Voicemod = (function(){

    let that = {
        connected: false,
        onMessage: null
    }

    var pluginVersion = "1.0.0";
    var boolBackgroundEnabled = false;
    var boolHearMyVoiceEnabled = false;
    var boolMuteEnabled = false;
    var boolMuteMemeForMeEnabled = false;
    var boolBadLanguage = false;
    var boolVoiceChangerEnabled = false;
    var stringLicenseType = "free";
    var selectedVoice = "nofx";
    var currentParameters = {};
    var currentPort = -1;
    var connected = false;
    let websocket = null;
    let cbQueue = []

    let observers = {}
    let observersWithId = {}

    var options = {
        uri : "ws://localhost",
        port : [59129, 20000, 39273, 42152, 43782, 46667, 35679, 37170, 38501, 33952, 30546],
        path : "/v1",
        autoRetry : true, 
        onConnect : null,
        onDisconnect : null,
        onError : null,
        onMessage : null, 
        onDebug : null 
    }

    var logPrint = function(message) {
        if(options.onDebug != null){
            var currentdate = new Date(); 
            var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth()+1) + "-" + currentdate.getDate() + " "
            + currentdate.getHours() + ":"  
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds();

            message = datetime + ' - ' + message;

            options.onDebug(message);            
        }
    }

    var onLoad = function() {
        logPrint("onLoad");
        
        if(connected){
            logPrint("Already Connected");
            return;
        }
        connected = true;

        currentPort++;
        if(currentPort > options.port.length -1 ) currentPort = 0;

        var wsUri = options.uri + ":" + options.port[currentPort] + options.path;
        try {
            websocket = new WebSocket(wsUri);
            websocket.onopen = onOpen;
            websocket.onclose = onClose;
            websocket.onmessage = onMessage;
            websocket.onerror = onError;
        }
        catch(err) {
            logPrint(err);
            onClose();
        }   
    }

    var onOpen = function(evt) {
        logPrint("onOpen");

        that.connected = true
        if(options.onConnect != null)
            options.onConnect();

        notifyObserversWithId(VoicemodEventKeys.wsConnected, null)
        
    }

    var onClose = function(evt) {
        logPrint("onClose autoRetry");
        connected = false;
        if(options.onDisconnect != null)
            options.onDisconnect();
        if(options.autoRetry){
            setTimeout(function() {
                logPrint("Retrying to connect");
                onLoad();
            }, 250);
        }            
    }

    var onError = function(evt) {
        logPrint("onError");
        if(options.onError != null)
            options.onError();   
    }

    var parseIfNeeded = function(actionObject)
    {
        if(typeof(actionObject) === "string")
        {
            return JSON.parse(actionObject);
        }
        return actionObject;
    }

    const notifyObservers = (eventCode, evt) => {
        if(observers[eventCode]) {
            observers[eventCode].forEach( cb => {
                if(!evt) {
                    return cb();
                }
                if(!evt.data) evt = {data: evt}

                let data = JSON.parse(evt.data)
                //console.log("Calling observers of ", eventCode, ": ", data)
                cb(data)
            })
        }
    }

    that.emit = (eventCode, data) => {
        notifyObservers(eventCode, data)
    }
    that.emitForId = (eventCode, id, data) =>{
        onlyNotifyObserversWithId(eventCode, id, data)
    }

    const onlyNotifyObserversWithId = (eventCode, id, evt) => {
        if(!observersWithId[eventCode]) return;
        observersWithId[eventCode][id].forEach( cb => {
            if(!evt) {
                return cb()
            }
            if(!evt.data) evt = {data: JSON.stringify(evt)}
            let data = JSON.parse(evt.data)
            data.__observerID = id
            cb(data)
        })
    }

    const notifyObserversWithId = (eventCode, evt) => {
        if(!observersWithId[eventCode]) return;
        let myObserversIds = Object.keys(observersWithId[eventCode])
        myObserversIds.forEach( id => {
            observersWithId[eventCode][id].forEach( cb => {
                if(!evt) {
                    return cb()
                }
                if(!evt.data) evt = {data: JSON.stringify(evt)}
                let data = JSON.parse(evt.data)
                data.__observerID = id
                cb(data)
            })
        })
        //}
    }


    
    var onMessage = function(evt) {
        if (evt.data) {
            let message = JSON.parse(evt.data);

            if (message.actionType || message.action){
                var action = message.actionType || message.action;                

                    logPrint("onMessage");
                    logPrint("Message received: " + evt.data);

                switch(action) {
                    case 'registerClient':
                        if (message.actionObject || message.payload) {
                            logPrint('Plugin registered!');
                            if (message.actionObject)
                                stringLicenseType = message.actionObject.licenseType;

                            updateUI();
                        }
                        break
					case 'toggleBackground':
						boolBackgroundEnabled = message.actionObject.value;
                        notifyObservers(VoicemodEventKeys.toggleBackgroundEffect, evt)
						updateUI();
						break
					case 'toggleHearMyVoice':
						boolHearMyVoiceEnabled = message.actionObject.value;
                        notifyObservers(VoicemodEventKeys.toggleHearMyVoice, evt)
						updateUI();
						break
					case 'toggleVoiceChanger':
                        
                        notifyObservers(VoicemodEventKeys.toggleVoiceChanger, evt)
						boolVoiceChangerEnabled = message.actionObject.value;
						updateUI();
						break
					case 'toggleMuteMemeForMe':
					case 'toggleMuteForMeMeme': //I just don't know anymore....
						boolMuteMemeForMeEnabled = message.actionObject.value;
                        notifyObservers(VoicemodEventKeys.muteMemeForMe, evt)
						updateUI();
						break
					case 'toggleMuteMic':
						boolMuteEnabled = message.actionObject.value;
                        notifyObservers(VoicemodEventKeys.toggleMuteMic, evt)
						updateUI();
						break
					case 'getUserLicense':
						stringLicenseType = message.actionObject.licenseType;
						updateUI();
						break
                    case 'getVoices':
                        console.log("#### getVOICES ", message);
                        if (message.actionObject) {
                            logPrint('Get list of voices');
                        }
                        break
                    case 'getBitmap':
                        logPrint('Get Bitmap data');
                        //console.log(that)
                        notifyObserversWithId(VoicemodEventKeys.bitmapLoaded, evt)
                        
                        break
                    case 'backgroundEffectsEnabledEvent':
                        boolBackgroundEnabled = true;
                        notifyObservers(VoicemodEventKeys.backgroundEffectsEnabled, evt)
                        updateUI();
                        break
                    case 'backgroundEffectsDisabledEvent':
                        boolBackgroundEnabled = false;
                        notifyObservers(VoicemodEventKeys.backgroundEffectsDisabled, evt)
                        updateUI();
                        break
                    case 'muteMicrophoneEnabledEvent':
                        boolMuteEnabled = true;
                        notifyObservers(VoicemodEventKeys.muteMicEnabled, evt)
                        updateUI();
                        break
                    case 'muteMicrophoneDisabledEvent':
                        boolMuteEnabled = false;
                        notifyObservers(VoicemodEventKeys.muteMicDisabled, evt)
                        updateUI();
                        break
                    case 'muteMemeForMeEnabledEvent':
                        boolMuteMemeForMeEnabled = true;
                        notifyObservers(VoicemodEventKeys.muteMemeForMeEnabled, evt)
                        updateUI();
                        break
                    case 'muteMemeForMeDisabledEvent':
                        notifyObservers(VoicemodEventKeys.muteMemeForMeDisabled, evt)
                        boolMuteMemeForMeEnabled = false;
                        updateUI();
                        break
                    case 'badLanguageEnabledEvent':
                        boolBadLanguage = true;
                        updateUI();
                        break
                    case 'badLanguageDisabledEvent':
                        boolBadLanguage = false;
                        updateUI();
                        break
                    case 'hearMySelfEnabledEvent':
                        boolHearMyVoiceEnabled = true;
                        notifyObservers(VoicemodEventKeys.hearMyVoiceEnabled, evt)
                        updateUI();
                        break
                    case 'hearMySelfDisabledEvent':
                        boolHearMyVoiceEnabled = false;
                        notifyObservers(VoicemodEventKeys.hearMyVoiceDisabled, evt)
                        updateUI();
                        break
                    case 'voiceChangerEnabledEvent':
                        notifyObservers(VoicemodEventKeys.voiceChangerEnabled, evt)
                        boolVoiceChangerEnabled = true;
                        updateUI();
                        break
                    case 'voiceChangerDisabledEvent':
                        notifyObservers(VoicemodEventKeys.voiceChangerDisabled, evt)
                        boolVoiceChangerEnabled = false;
                        updateUI();
                        break;
                    case 'getCurrentVoice':
                        selectedVoice = message.payload?.voiceId;
                        notifyObservers(VoicemodEventKeys.getCurrentVoice, evt)
                        //voiceParametersManager.onVoiceChange(message.payload);
                        updateUI();
                        break;
                    case 'voiceParameterUpdated':
                        //voiceParametersManager.onParameterChange(message.payload);
                        break;
                    case 'licenseTypeChangedEvent':
                        if (message.actionObject) {
                            logPrint('Get LicenseTypeChangedEvent');
                            message.actionObject = parseIfNeeded(message.actionObject);
                            stringLicenseType = message.actionObject.licenseType;
                            updateUI();
                        }
                        break
                    case 'voiceLoadedEvent':
                        notifyObserversWithId(VoicemodEventKeys.voiceLoaded, evt)
                        if (message.actionObject) {
                            logPrint('Get voiceLoadedEvent');
                            logPrint(message.actionObject.voiceID);
                            message.actionObject = parseIfNeeded(message.actionObject);
                            if(message.actionObject.voiceID === "custom")
                                return;
                            selectedVoice = message.actionObject.voiceID;
                            updateUI();
                      
                        }
                        //voiceParametersManager.onVoiceChange(message.payload);
                        break
                    case 'parametersChangedEvent':
                        if (message.actionObject) {
                            logPrint('Get parametersChangedEvent');
                            message.actionObject = parseIfNeeded(message.actionObject);
                            if(message.actionObject.voiceID == "custom")
                                return;
                            currentParameters = message.actionObject.parameters;
                        }
                        break                        
                    case 'parameterChangedEvent':
                        if (message.actionObject) {
                            logPrint('Get parameterChangedEvent');
                            message.actionObject = parseIfNeeded(message.actionObject);
                            if(message.actionObject.voiceID == "custom")
                                return;
                            currentParameters = message.actionObject.parameters;
                        }
                        break                        
                    case 'getAllSoundboard':
                        notifyObservers/(VoicemodEventKeys.getAllSoundboard, evt)
                    break;
                    default:
                }
                if (options.onMessage != null)
                    if (message.actionType)
                        options.onMessage(message.actionType, message.actionObject, message.actionID); 
                    else
                        options.onMessage(message.action, message.payload);
            } else {
                logPrint("No ActionType");
            }
   
        }
    }

    var sendMessage = function(message) {
        logPrint("Message sent: " + message);
        websocket.send(message);
    }    

    that.__setObserver = (key, cb) => {
        if(!observers[key]){
            observers[key] = []
        }
        observers[key].push(cb)
 
    }

    that.__setObserverWithId = (key, id,  cb) => {
        if(!observersWithId[key]){
            observersWithId[key] = {}
        }

        if(!observersWithId[key][id]) {
            observersWithId[key][id] = []
        }
        observersWithId[key][id].push(cb)
 
    }

    that.removeEventListeners = (id) => {
        let eventTypes = Object.keys(observersWithId);
        eventTypes.forEach( type => {
            delete observersWithId[type][id]
        })
    }

    that.onGetCurrentVoice = (cb) => {
        that.__setObserver(VoicemodEventKeys.getCurrentVoice, cb)
    }

    that.onMuteMemeForMeDisabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.muteMemeForMeDisabled, cb)
    }
    that.onMuteMemeForMeEnabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.muteMemeForMeEnabled, cb)
    }
    that.onMuteMemeForMeToggle = (cb) => {
        that.__setObserver(VoicemodEventKeys.muteMemeForMe, cb)
    }
    that.onGetAllSoundboard = (cb) => {
        that.__setObserver(VoicemodEventKeys.getAllSoundboard, cb)
    }
    that.onToggleMuteMic = (cb) => {
        that.__setObserver(VoicemodEventKeys.toggleMuteMic, cb)
    }

    that.onMuteMicDisabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.muteMicDisabled, cb)
    }
    that.onMuteMicEnabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.muteMicEnabled, cb)
    }

    that.onVoiceLoaded = (id, cb) => {
        that.__setObserverWithId(VoicemodEventKeys.voiceLoaded, id, cb)
    }

    that.onBackgroundEffectsEnabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.backgroundEffectsEnabled, cb)
    }

    that.onBackgroundEffectsDisabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.backgroundEffectsDisabled, cb)
    }

    that.onToggleBackgroundEffects = (cb) => {
        that.__setObserver(VoicemodEventKeys.toggleBackgroundEffect, cb)
    }

    that.onHearMyselfDisabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.hearMyVoiceDisabled, cb)
    }

    that.onHearMyselfEnabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.hearMyVoiceEnabled, cb)
    }

    that.onToggleHearMyVoice = (cb) => {
        that.__setObserver(VoicemodEventKeys.toggleHearMyVoice, cb)
    }

    that.onVoiceChangerDisabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.voiceChangerDisabled, cb)
    }

    that.onVoiceChangerEnabled = (cb) => {
        that.__setObserver(VoicemodEventKeys.voiceChangerEnabled, cb)
    }

    that.onToggleVoiceChanger = (cb) => {
        that.__setObserver(VoicemodEventKeys.toggleVoiceChanger, cb)
    }


    that.onBitMapLoaded = (id, cb) => {
        logPrint('Adding observer to bitmap loaded event')
        that.__setObserverWithId(VoicemodEventKeys.bitmapLoaded, id, cb)
    }

    that.onConnected = (id, cb) => {
        that.__setObserverWithId(VoicemodEventKeys.wsConnected, id, cb)
    }

    that.onAllVoicesLoaded = (cb) => {
        that.__setObserver(VoicemodEventKeys.allVoicesLoaded, cb)
    }
    that.onAllVoicesLoadedWithID = (id, cb) => {
        that.__setObserverWithId(VoicemodEventKeys.allVoicesLoaded, id, cb)
    }
 
    that.onAllSoundsLoaded = (cb) => {
        that.__setObserver(VoicemodEventKeys.allSoundsLoaded, cb)
    }

    that.onAllSoundsLoadedWithID = (id, cb) => {
        that.__setObserverWithId(VoicemodEventKeys.allSoundsLoaded, id, cb)
    }

    that.sendMessageToServer = function(message, value = null,  actionID = "100") {
        var jsonArray;
        var actionObject = {};
        
        switch(message) {
            case 'registerClient':
                actionObject["clientKey"] = value;
                break;
            case 'getVoiceBitmap':
                actionObject["voiceID"] = value;
                message = 'getBitmap';
                break;
            case 'getMemeBitmap':
                actionObject["memeId"] = value;
                message = 'getBitmap';
                break;
            case 'playMeme':
                actionObject["FileName"] = value;
                actionObject["IsKeyDown"] = true;
                break; 
            case 'selectVoice':
            case 'loadVoice':
                if (typeof value === 'string') {
                    actionObject["voiceID"] = value;
                    actionObject["voiceId"] = value;
                } else {
                    actionObject = value;
                }
                break;
            case 'toggleMuteMic':
                actionObject["toggleMute"] = value;
                break;
            case 'toggleVoiceChanger':
                if(value != null)
                    actionObject["toggleVoiceChanger"] = value;
                break;
            case 'setBeepSound':
                actionObject["badLanguage"] = value;
                break;                
            case 'setVoiceParameter':
                if (value != null)
                    actionObject = value;
                break;
            default:
                if (value != null)
                    actionObject = value;
                break;
        }

        if (options.path === '/v1'){
            jsonArray = {
                "id" : actionID,
                "payload" : actionObject,
                "action" : message,
            };
        } else if(options.path === '/vmsd') {
            jsonArray = {
                "actionId" : actionID,
                "actionType" : message,
                'pluginVersion': 'v1',
                "context" : actionObject,
            };
        }

        var messageToSend = JSON.stringify(jsonArray);
        sendMessage(messageToSend);
    }

    that.init = function(optionsObj={}) {
        options = Object.assign( {}, options, optionsObj );
        logPrint(options);
        that.connect();
    }

    that.connect = function() {
        onLoad();
    }

    that.disconnect = function() {
        if(connected)
            websocket.close();
    }

    that.forceMessage = function(evnt) {
        console.log("forcing message: ", options)
        if(options.onMessage != null) options.onMessage(evnt.actionType, evnt.actionObject, evnt.actionID)

    }

    Object.defineProperty(that,'backgroundEnabled',{
        get:function(){
            return boolBackgroundEnabled;
        }
    })
    Object.defineProperty(that,'hearMyVoiceEnabled',{
        get:function(){
            return boolHearMyVoiceEnabled;
        }
    })
    Object.defineProperty(that,'voiceChangerEnabled',{
        get:function(){
            return boolVoiceChangerEnabled;
        }
    })
    Object.defineProperty(that,'badLanguageEnabled',{
        get:function(){
            return boolBadLanguage;
        }
    })    
    Object.defineProperty(that,'muteMemeForMeEnabled',{
        get:function(){
            return boolMuteMemeForMeEnabled;
        }
    })    
    Object.defineProperty(that,'licenseType',{
        get:function(){
            return stringLicenseType;
        }
    })    
    Object.defineProperty(that,'muted',{
        get:function(){
            return boolMuteEnabled;
        }
    })
    Object.defineProperty(that,'port',{
        get:function(){
            return options.port;
        },
        set:function(newPort){
            currentPort = -1;
            options.port = newPort;
        }
    })
    Object.defineProperty(that,'currentVoice',{
        get:function(){
            return selectedVoice;
        }
    })

    Object.defineProperty(that,'isConnected',{
        get:function(){
            return connected;
        }
    })

    return that;
})();