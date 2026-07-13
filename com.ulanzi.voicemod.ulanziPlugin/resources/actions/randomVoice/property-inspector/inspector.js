/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />
/// <reference path="../../../libs/js/voicemod.js" />

let __VOICES = null;
let __SETTINGS = {
    'listRandomVoices_selected': 'allVoices' //default value
}

let __UI_STATUS = null;

$PI.connect(UlanzideckSocketPort, ComUlanziUlanzideckVoicemodRandomVoice);
$PI.onConnected((jsn) => {

    $PI.onWillAppear((data) => {
        const payload = data.param;
        const globalSettings = window.getUlanziGlobalSettings();
        __SETTINGS = {...__SETTINGS, ...(payload.settings || {}), ...globalSettings};
        updateVoicesUI();
        if(globalSettings.status == VoicemodStatus.offline) {
            blockUI()
        } else {
            if(__UI_STATUS == VoicemodStatus.offline ||__UI_STATUS == null) {
                $PI.sendToPlugin({
                    action: 'getVoices'
                })
                enableUI()
            }
        }
        if(globalSettings.licenseType == VoicemodLicenseType.free) {
            showFREEUI()
        } else {
            showPROUI()
        }
        __UI_STATUS = globalSettings.status;
    });
});


function updateVoicesUI() {
    const dropdown = document.querySelector("#list-of-voices")
    if(__SETTINGS['listRandomVoices_selected']) {
        dropdown.value = __SETTINGS['listRandomVoices_selected']
    } else {
        dropdown.value = "-1"
    }
}

function showFREEUI() {
    document.querySelector("#free-voices-notice").classList.remove("hidden")
    document.querySelector("#list-of-voices").classList.add("hidden")
}

function showPROUI() {
    document.querySelector("#free-voices-notice").classList.add("hidden")
    document.querySelector("#list-of-voices").classList.remove("hidden")
}


/* HTML events */
document.querySelector('#list-of-voices').addEventListener('change', (evnt) => {
    __SETTINGS['listRandomVoices_selected'] = evnt.target.value
    $PI.setSettings(__SETTINGS)
})