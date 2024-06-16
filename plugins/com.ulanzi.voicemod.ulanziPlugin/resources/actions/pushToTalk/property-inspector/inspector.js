/// <reference path="../../../libs/js/constants.js" />
/// <reference path="../../../libs/js/events.js" />
/// <reference path="../../../libs/js/utils.js"/>
/// <reference path="../../../libs/js/ulanzi-plugin.js" />
/// <reference path="../../../libs/js/action.js" />


let __VOICES = null;
let __SETTINGS = {}
let __UI_STATUS = null;

$PI.connect(UlanzideckSocketPort, ComUlanziUlanzideckVoicemodChangerPushToTalk);
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
