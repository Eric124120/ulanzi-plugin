/// <reference path="constants.js" />
/// <reference path="api.js" />

class ULANZIPropertyInspector extends ULANZIApi {
	constructor() {
		super();
		if (ULANZIPropertyInspector.__instance) {
			return ULANZIPropertyInspector.__instance;
		}

		ULANZIPropertyInspector.__instance = this;
	}

	/**
	 * 注册一个回调函数，用于UlanziDeck向属性检查器发送数据
	 * @param {string} actionUUID（uuid+key）
	 * @param {function} fn
	 * @returns UlanziDeck
	 */
	onSendToPropertyInspector(actionUUID, fn) {
		if (typeof actionUUID != 'string') {
			console.error('An action UUID string is required for onSendToPropertyInspector.');
		}

		if (!fn) {
			console.error(
				'A callback function for the sendToPropertyInspector event is required for onSendToPropertyInspector.'
			);
		}

		this.on(`${actionUUID}.${Events.sendToPropertyInspector}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 向属性观察者发送插件信息
	 * @param {object} payload
	 */
	sendToPlugin(payload) {
		this.sendToMain(this.uuid, Events.sendToPlugin, {
			action: payload?.action,
			payload: payload || null,
		});
	}

 	/**
	 * Set the actions key image
	 * @param {string} context
	 * @param {string} [image]
	 * @param {number} [state]
	 * @param {number} [target]
	 */
	setImage(context, image, state, target = Constants.hardwareAndSoftware) {
		if (!context) {
			console.error('A key context is required for setImage.');
		}

		// this.send(context, Events.setImage, {
		// 	payload: {
		// 		image,
		// 		target,
		// 		state,
		// 	},
		// });
	} 

	/**
	 * Save the actions's persistent data.
	 * @param {object} payload
	 */
	setSettings(payload) {
		this.send(this.uuid, Events.setSettings, {
			action: this?.actionInfo?.action,
			payload: payload || null,
		});
	}

	/**
	 * Request the actions's persistent data. StreamDeck does not return the data, but trigger the actions's didReceiveSettings event
	 */
	getSettings() {
		this.send(this.uuid, Events.getSettings);
	}
}

const $PI = new ULANZIPropertyInspector();
window.$PI;

// function connectUlanziDeckPluginSocket(port, uuid, messageType, appInfoString, actionInfo) {
// 	const delay = window?.initialConnectionDelay || 0;
// 	setTimeout(() => {
// 		$PI.connect(port, uuid, messageType, appInfoString, actionInfo);
// 	}, delay);
// }


function downloadVM() {
	console.log("GLobal settings: ", __GLOBAL_SETTINGS)
	if(!__GLOBAL_SETTINGS.hasOwnProperty('downloadedFromSD') && !__GLOBAL_SETTINGS.downloadSourceValidated) {
		__GLOBAL_SETTINGS.downloadedFromSD = 1
	} 
	$PI.setGlobalSettings(__GLOBAL_SETTINGS)
	window.open("https://www.voicemod.net/downloadFromStreamDeck.php?v=", "_blank")
}