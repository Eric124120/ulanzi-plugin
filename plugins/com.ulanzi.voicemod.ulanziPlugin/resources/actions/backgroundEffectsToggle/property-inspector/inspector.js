/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />
/// <reference path="../../../libs/js/voicemod.js" />



let __VOICES = null;
let __SETTINGS = {}
let __UI_STATUS = null;
$PI.connect(UlanzideckPort, ComUlanziUlanzideckVoicemodBackgroundswitch);

$PI.onConnected((jsn) => {
    $PI.onWillAppear((data) => {
        const payload = data.param;
        const globalSettings = window.getUlanziGlobalSettings();
        if (payload.settings) {
            __SETTINGS = payload.settings
        }
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

