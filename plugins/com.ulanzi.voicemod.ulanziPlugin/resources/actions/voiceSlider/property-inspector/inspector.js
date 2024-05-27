/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />
/// <reference path="../../../libs/js/voicemod.js" />

const actionUUID = 'com.voicemodplus.actions.voicechanger'



let __VOICES = null;
let __SETTINGS = {}

$PI.onDidReceiveSettings(actionUUID, ({payload}) => {
    console.log('onDidReceiveSettings', payload);
    __SETTINGS = {...__SETTINGS, ...payload.settings}
    updateVoicesUI()
    
})

$PI.onConnected((jsn) => {
    const form = document.querySelector('#property-inspector');
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {payload, context} = actionInfo;
    const {settings} = payload;

    Utils.setFormValue(settings, form);

    form.addEventListener(
        'input',
        Utils.debounce(150, () => {
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);
        })
    );


    console.log("requesting global settings...")
    $PI.getSettings()

    $PI.onSendToPropertyInspector(actionUUID, ({payload}) => {
        console.log('send property to inspector triggered....')
    })


});



/**
 * Provide window level functions to use in the external window
 * (this can be removed if the external window is not used)
 */
window.sendToInspector = (data) => {
    console.log(data);
};


function updateVoicesUI() {
    loadListOfVoices(__SETTINGS['voice-type-selected'] || 'all')
}

document.querySelectorAll('input[type=radio][name="voice-list-type"]').forEach( radio => {
    radio.addEventListener('change', (evnt) => {
        console.log("The type of list was changed")
        console.log(evnt)
        if(evnt.target.checked) {
            __SETTINGS['voice-type-selected'] = type
            $PI.setSettings(__SETTINGS)
        }
    })
})


