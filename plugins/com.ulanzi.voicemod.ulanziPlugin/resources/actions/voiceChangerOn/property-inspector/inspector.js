/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />
/// <reference path="../../../libs/js/voicemod.js" />

let __VOICES = null;
let __SETTINGS = {}

let __UI_STATUS = null;
$PI.connect(UlanzideckSocketPort, ComUlanziUlanzideckVoicemodChangerOn);
$PI.onConnected((jsn) => {
    $PI.onWillAppear((data) => {
        const payload = data.param;
        if (payload.settings) {
            __SETTINGS = payload.settings;
        }
        const globalSettings = window.getUlanziGlobalSettings();
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

