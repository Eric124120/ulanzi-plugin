/// <reference path="constants.js"/>
/// <reference path="events.js"/>
/// <reference path="storage.js"/>


class UlanziPlugin {
	port;
    uuid;
    websocket;
    key = null;
    actionid = null;
    actionUUID = null;
    keepLive = true;
    on = EventEmitter.on;
    emit = EventEmitter.emit;
    /**
     * Connect to Ulanzi Deck
     * @param {string} port
     * @param {string} uuid
     */
    connect(port, uuid) {
        this.port = port;
        this.uuid = uuid;
        this.keepLive = true;
        if(this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        this.websocket = new WebSocket(`ws://${UlanzideckSocketAddress}:${this.port}`);

        this.websocket.onopen = () => {
            let json = {
                code: 0,
                cmd: Events.connected,
                uuid: this.uuid,
            };
            this.websocket.send(JSON.stringify(json));
        };

        this.websocket.onerror = (evt) => {
            const error = `WEBSOCKET ERROR: ${evt}, ${evt.data}, ${SocketErrors[evt?.code]}`;
            console.warn(error);
        };

        this.websocket.onclose = (evt) => {
            if (this.keepLive) {
                this.connect(this.port, this.uuid);
            }
        };

        this.websocket.onmessage = (evt) => {
            const jsonObj = JSON.parse(evt.data);
            const code = jsonObj["code"];
            const isResponse = code !== undefined
            let event = jsonObj["cmd"];
            let uuid = jsonObj["uuid"];
            let remoteKey = jsonObj["key"];
            let actionid = jsonObj["actionid"];
            let actionUUID = getUniqueActionId(uuid, remoteKey);
            console.log('<---->message:', jsonObj);
            if (!actionid) {
                actionid = getUniqueActionId(uuid, remoteKey);
                jsonObj["actionid"] = actionid;
            }
            if (event === 'add') {
                // this.addPlugun(jsonObj);
            } else if (event === 'paramfromapp') {
                // TODO 新版上位机，不触发add了，改成paramfromapp中初始化
                this.addPlugun(jsonObj);
                // 加在插件功能，并配置插件信息
               setTimeout(() => {
                this.willAppear(actionUUID, jsonObj);
               }, 300);
            } else if (event === 'run' && !isResponse) {
                // 插件运行
            } else if (event === 'paramfromplugin') {
                this.paramfromplugin(actionUUID, jsonObj);
            } else if (event === 'clear' || event == 'clearAll') {
                keepLive = false
                websocket.close()
            } else {
                console.log("Unhandled websocketOnMessage: " + evt.data);
            }
        };
    }
    addPlugun(jsonObj) {
        const code = jsonObj["code"];
        let uuid = jsonObj["uuid"];
        let remoteKey = jsonObj["key"];
        let actionid = jsonObj["actionid"];
        let actionUUID = getUniqueActionId(uuid, remoteKey);
        // 添加插件时设置key和actionid
        if (remoteKey !== undefined) {
            this.key = remoteKey;
        }
        if (actionid !== undefined) {
            this.actionid = actionid;
        }
        if (actionUUID !== undefined) {
            this.actionUUID = actionUUID;
        }
        // 插件被添加的时候，触发connected事件
        this.emit(Events.connected, jsonObj);
    }
    willAppear(actionUUID, eventData) {
        console.log("willAppear uuid: ", actionUUID, " eventData: ", eventData);
        // 插件被加载时触发
        this.emit(`${actionUUID}.${Events.willAppear}`, eventData);
    }
    paramfromplugin(actionUUID, eventData) {
        console.log("paramfromplugin uuid: ", actionUUID, " eventData: ", eventData);
        if (eventData?.eventType === Events.getGlobalSettings) {
            this.emit(Events.didReceiveGlobalSettings, eventData);
        } else if (eventData?.eventType === Events.getSettings) {
            this.emit(`${eventData.uuid}.${Events.didReceiveSettings}`, eventData);
        } else if (eventData?.eventType === Events.sendToPlugin) {
            const pluginSettings = window.getUlanziPluginSettings(eventData.actionid);
            if (pluginSettings) {
                eventData.param = {
                    ...eventData.param,
                    ...pluginSettings
                }
            }
            this.emit(`${eventData.uuid}.${Events.sendToPlugin}`, eventData);
        }
    }
    send(jsn) {
        const jsnStr = JSON.stringify(jsn);
        this.websocket?.readyState === 1 && this.websocket.send(jsnStr);
    }
    sendEvent(eventType, param) {
        const jsn = {
            uuid: this.uuid,
            key: this.key,
            actionid: this.actionid,
            cmd: Events.paramfromplugin,
            /** 用于记录操作处理事件 */
            eventType,
            param: {
                ...param,
            },
        }
        this.send(jsn);
    }
    sendToPlugin(payload) {
        const jsn = {
            uuid: this.uuid,
            key: this.key,
            actionid: this.actionid,
            cmd: Events.paramfromplugin,
            eventType: Events.sendToPlugin,
            payload: {
                action: payload?.action,
                payload: payload || null,
            },
        }
        this.send(jsn);
	}
    getGlobalSettings() {
        const globalSettings = window.getUlanziGlobalSettings();
        const pluginSettings = window.getUlanziPluginSettings(this.actionid);
        this.sendEvent(Events.getGlobalSettings, {
            settings: {...pluginSettings, ...globalSettings},
            ...pluginSettings
        })
    }
    getSettings() {
        const globalSettings = window.getUlanziGlobalSettings();
        const pluginSettings = window.getUlanziPluginSettings(this.actionid);
        this.sendEvent(Events.getSettings, {
			settings: globalSettings,
            ...pluginSettings
		});
    }
    setSettings(payload) {
        window.setUlanziPluginSettings(this.actionid, payload);
        this.sendEvent(Events.setSettings, {
			settings: payload,
		});
	}
    /** 事件监听 */
    onConnected(fn) {
        if(!fn) {
            console.error(
                'A callback function for the connected event is required for onConnected.'
            );
        }

        this.on(Events.connected, (jsn) => fn(jsn));
    }
    onWillAppear(fn) {
        if(!fn) {
            console.error(
                'A callback function for the willAppear event is required for onWillAppear.'
            );
        }

        this.on(`${this.actionUUID}.${Events.willAppear}`, (jsn) => fn(jsn));
    }
    onDidReceiveGlobalSettings(fn) {
        if(!fn) {
            console.error(
                'A callback function for the didReceiveGlobalSettings event is required for onDidReceiveGlobalSettings.'
            );
        }

        this.on(Events.didReceiveGlobalSettings, (jsn) => fn(jsn));
        return this;
    }
    onDidReceiveSettings(fn) {
		if (!fn) {
			console.error(
				'A callback function for the didReceiveSettings event is required for onDidReceiveSettings.'
			);
		}

		this.on(`${this.uuid}.${Events.didReceiveSettings}`, (jsn) => fn(jsn));
		return this;
	}
    onSendToPlugin(fn) {
        if (!fn) {
			console.error(
				'A callback function for the sendToPlugin event is required for onSendToPlugin.'
			);
		}

		this.on(`${this.uuid}.${Events.sendToPlugin}`, (jsn) => fn(jsn));
		return this;
    }
};

window.$PI = new UlanziPlugin();