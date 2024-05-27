/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />
/// <reference path="../../../libs/js/voicemod.js" />

const actionUUID = 'com.voicemodplus.actions.voicechanger'



let __VOICES = null;
let __SETTINGS = {}
let __UI_STATUS = null;

$PI.onDidReceiveSettings(actionUUID, ({payload}) => {
    console.log('onDidReceiveSettings', payload);
    __SETTINGS = payload.settings
    updateVoicesUI()
    
})
$PI.connect(UlanzideckPort, ComUlanziUlanzideckVoicemodMutesoundsForMeToggle);
$PI.onConnected((jsn) => {
    $PI.onWillAppear((data) => {
        const payload = data.param;
        const globalSettings = window.getUlanziGlobalSettings();
        if (payload.settings) {
            __SETTINGS = payload.settings;
        }
        if(globalSettings.status == VoicemodStatus.offline) {
            blockUI()
        } else {
            if(__UI_STATUS == VoicemodStatus.offline ||__UI_STATUS == null) {
                enableUI()
            }
        }
        __UI_STATUS = globalSettings.status;
    });
});


