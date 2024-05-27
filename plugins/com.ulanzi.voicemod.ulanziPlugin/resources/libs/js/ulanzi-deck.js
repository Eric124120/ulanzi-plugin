/// <reference path="constants.js"/>
/// <reference path="utils.js"/>
/// <reference path="events.js"/>


class ULANZIDeck {
	actionChilds = new Map();
	settingsCache = {};
    websocket = null;
    port = '3906';
    uuid = 'com.ulanzi.ulanzideck.voicemod';
    on = EventEmitter.on;
    emit = EventEmitter.emit;
	constructor() {
		if (ULANZIDeck.__instance) {
			return ULANZIDeck.__instance;
		}
		ULANZIDeck.__instance = this;
	}

    connected(port, uuid) {
        if (port) this.port = port;
        if (uuid) this.uuid = uuid;

        this.websocket = new WebSocket("ws://127.0.0.1:" + this.port);
        this.websocket.onopen = () => {
            let json = {
                code: "0",
                cmd: "connected",
                uuid: this.uuid
            };
            console.log("registerPlugin " + json)
            this.websocket.send(JSON.stringify(json));
            this.emit(Events.connected)
        };
        this.websocket.onmessage = (evt) => {
            let jsonObj = JSON.parse(evt.data);
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
            if (event === "run" ) {
                // 运行插件
                this.emit(`${uuid}.${Events.run}`, jsonObj)
            } else if (event === "add") {
                // 初始化加载
                this.willAppear(uuid, jsonObj);
            } else if (event === "paramfromapp") {
                // 插件功能被加载的时候(设置插件功能参数)
                if (!this.actionChilds.has(remoteKey)) {
                    this.actionChilds.set(remoteKey, actionUUID)
                }
                this.willAppear(uuid, jsonObj);
            } else if (event === "clear") {
                // 插件卸载
                if (this.actionChilds.has(remoteKey)) {
                    this.actionChilds.delete(remoteKey)
                    this.willDisappear(actionUUID, jsonObj);
                }

            } else if (event === "clearAll") {
                // 卸载全部插件
                for (const key in this.actionChilds.keys()) {
                    this.willDisappear(this.actionChilds.get(key), this.settingsCache[this.actionChilds.get(key)]);
                }
                this.actionChilds.clear()

            } else if (event === "state") {
                // 插件的图标显示需要发生变化的时候
            }  else if (event === "paramfromplugin") {
                this.paramfromplugin(actionUUID, jsonObj);
			} else {
                console.log('------->', jsonObj)
            }

        };
        this.websocket.onclose =  () => {
            this.connected(this.port, this.uuid);
        };
    }
    willAppear(actionUUID, eventData) {
        console.log("willAppear uuid: ", actionUUID, " eventData: ", eventData);
        this.settingsCache[getUniqueActionId(eventData.uuid, eventData.key)] = eventData;
        // 插件被加载时触发
        this.emit(`${actionUUID}.${Events.willAppear}`, eventData);
    }
    willDisappear(actionId, data) {
        console.log("willDisappear actionId: ", actionId, " settings: ", data);
        window.removeUlanziPluginSettings(data.uuid, data.key);
        delete this.settingsCache[actionId];
    }
    paramfromplugin(actionUUID, eventData) {
        console.log("paramfromplugin uuid: ", actionUUID, " eventData: ", eventData);
        if (this.settingsCache[actionUUID]?.uuid === eventData.uuid) {
            // getSettingsAndThen的时候使用
            this.settingsCache[actionUUID].param = {...this.settingsCache[actionUUID].param, ...eventData.param};
        } else {
            this.settingsCache[actionUUID] = eventData;
        }
        if (eventData?.eventType === Events.setGlobalSettings) {
            this.emit(`${eventData.uuid}.${Events.didReceiveGlobalSettings}`, eventData);
        } else if (eventData?.eventType === Events.sendToPlugin) {
            this.emit(`${eventData.uuid}.${Events.sendToPlugin}`, eventData);
        }
    }
    
    getActionId(uuid, key) {
        const data = this.settingsCache[getUniqueActionId(uuid, key)];
        return data?.actionid;
    }

    send(jsn) {
        const jsnStr = JSON.stringify(jsn);
        this.websocket?.readyState === 1 && this.websocket.send(jsnStr);
    }
    sendToMainEvent(eventType, param) {
        const jsn = {
            uuid: this.uuid,
            /** 用于记录操作处理事件 */
            eventType,
            cmd: Events.paramfromplugin,
            param,
        }
        this.send(jsn);
    }
    sendPluginEvent(uuid, key, actionid, eventType, param) {
        const jsn = {
            uuid,
            key,
            actionid,
            /** 用于记录操作处理事件 */
            eventType,
            cmd: Events.paramfromplugin,
            param,
        }
        this.send(jsn);
    }
    
    /**
     * 设置图标(使⽤manifest.json配置⾥的图标列表编号)
     * @param {string} uuid 插件id
     * @param {string} key 上位机按键key
     * @param {number} inState 图标列表数组编号。请对照manifest.json
     */
     setState(uuid, key, inState) {
        const actionid = this.getActionId(uuid, key);
        this.send({
            cmd: 'state',
            param: {
                statelist: [
                    {
                        uuid,
                        key,
                        actionid,
                        /** type 0-使⽤配置⾥的图标列表编号，请对照manifest.json。 1-使⽤⾃定义图标。2-使⽤本地图⽚⽂件，3-使⽤⾃定义的动图，4-使⽤本地gif⽂件 */ 
                        type: 0,
                        state: inState,
                    }
                ]
            }
        });
    }

    /**
     * 设置图标（使⽤⾃定义图标）
     * @param {string} uuid 插件id
     * @param {string} key 上位机按键key
     * @param {string} base64Str 使⽤⾃定义图标
     */
    setImage(uuid, key, base64Str) {
        const actionid = this.getActionId(uuid, key);
        this.send({
            cmd: 'state',
            param: {
                statelist: [
                    {
                        uuid,
                        key,
                        actionid,
                        /** type 0-使⽤配置⾥的图标列表编号，请对照manifest.json。 1-使⽤⾃定义图标。2-使⽤本地图⽚⽂件，3-使⽤⾃定义的动图，4-使⽤本地gif⽂件 */ 
                        type: 1,
                        data: base64Str,
                    }
                ]
            }
        });
    }

    /**
     * 设置图标（使⽤本地图⽚⽂件）
     * @param {string} uuid 插件id
     * @param {string} key 上位机按键key
     * @param {string} path 本地图片地址
     */
    setPath(uuid, key, path) {
        const actionid = this.getActionId(uuid, key);
        this.send({
            cmd: 'state',
            param: {
                statelist: [
                    {
                        uuid,
                        key,
                        actionid,
                        /** type 0-使⽤配置⾥的图标列表编号，请对照manifest.json。 1-使⽤⾃定义图标。2-使⽤本地图⽚⽂件，3-使⽤⾃定义的动图，4-使⽤本地gif⽂件 */ 
                        type: 2,
                        path,
                    }
                ]
            }
        });
    }

    /**
     * 设置图标（使⽤自定义gif的base64编码数据）
     * @param {string} uuid 插件id
     * @param {string} key 上位机按键key
     * @param {string} gifdata 自定义gif的base64版面数据
     */
    setGifdata(uuid, key, gifdata) {
        const actionid = this.getActionId(uuid, key);
        this.send({
            cmd: 'state',
            param: {
                statelist: [
                    {
                        uuid,
                        key,
                        actionid,
                        /** type 0-使⽤配置⾥的图标列表编号，请对照manifest.json。 1-使⽤⾃定义图标。2-使⽤本地图⽚⽂件，3-使⽤⾃定义的动图，4-使⽤本地gif⽂件 */ 
                        type: 3,
                        gifdata,
                    }
                ]
            }
        });
    }

    /**
     * 设置图标（使⽤本地gif图⽚⽂件）
     * @param {string} uuid 插件id
     * @param {string} key 上位机按键key
     * @param {string} gifpath 本地gif图⽚⽂件地址
     */
    setGifdata(key, gifpath) {
        this.send({
            cmd: 'state',
            param: {
                stateList: [
                    {
                        uuid,
                        key,
                        /** type 0-使⽤配置⾥的图标列表编号，请对照manifest.json。 1-使⽤⾃定义图标。2-使⽤本地图⽚⽂件，3-使⽤⾃定义的动图，4-使⽤本地gif⽂件 */ 
                        type: 4,
                        gifpath,
                    }
                ]
            }
        });
    }

    /** 参数设置 */
    /**
     * 设置全局参数
     */
    setGlobalSettings(payload) {
        window.setUlanziGlobalSettings(payload);
    }

    /** 插件参数设置 */
    setSettings(uuid, key, actionid, payload) {
        window.setUlanziPluginSettings(this.uuid, this.key, payload);
        this.sendPluginEvent(uuid, key, actionid, Events.setSettings, {
			settings: payload,
        })
    }
    sendToPropertyInspector(uuid, key, actionid, payload = null, action = null) {
		if (typeof uuid != 'string') {
			console.error('A key uuid is required to sendToPropertyInspector.');
		}
        const jsn = {
            cmd: Events.paramfromplugin,
            uuid,
            key,
            actionid,
            payload: {
                action: payload?.action,
                payload,
            }
        }
        this.send(jsn)
	}
   

    /*** 事件监听 */
    onConnected(fn) {
        if(!fn) {
            console.error(
                'A callback function for the connected event is required for onConnected.'
            );
        }

        return this.on(Events.connected, (jsn) => fn(jsn));
    }
    /**
     * 当添加插件被加载的时候触发
     * @param {*} actionUUID 
     * @param {*} fn 
     * @returns 
     */
    onWillAppear(actionUUID, fn) {
        if(!fn) {
            console.error(
                'A callback function for the willAppear event is required for onWillAppear.'
            );
        }

        return this.on(`${actionUUID}.${Events.willAppear}`, (jsn) => fn(jsn));
    }
};
window.$UD = new ULANZIDeck();
$UD.connected(UlanzideckPort, UlanzideckPluginUUID);