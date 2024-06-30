import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import {
    muteToggle,
    videoToggle,
    zoomShare,
    zoomFocus,
    zoomLeave,
    zoomRecordcloudtoggle,
    zoomRecordlocaltoggle,
    zoomUnmuteall,
    zoomMuteall,
} from './libs/zoom-sdk.js'
import { createRandomPort } from './libs/random-port.js';

const runFunMap = {
    'com.ulanzi.ulanzideck.zoom.mutetoggle': muteToggle,
    'com.ulanzi.ulanzideck.zoom.videotoggle': videoToggle,
    'com.ulanzi.ulanzideck.zoom.sharetoggle': zoomShare,
    'com.ulanzi.ulanzideck.zoom.focus': zoomFocus,
    'com.ulanzi.ulanzideck.zoom.leave': zoomLeave,
    'com.ulanzi.ulanzideck.zoom.recordcloudtoggle': zoomRecordcloudtoggle,
    'com.ulanzi.ulanzideck.zoom.recordlocaltoggle': zoomRecordlocaltoggle,
    'com.ulanzi.ulanzideck.zoom.unmuteall': zoomUnmuteall,
    'com.ulanzi.ulanzideck.zoom.muteall': zoomMuteall,
}

createRandomPort().then(d => {
    initMain(d.port)
});
function initMain(randomPort) {
    //读取上位机信息
    const runtime = process.argv
    const [ip,port] = runtime.slice(2,4)
    console.log(`ip and port are ${ip} ${port}`)
    //client 
    const ws = new WebSocket(`ws://${ip}:${port}`);

    //server
    let server = undefined;
    try{

        server = new WebSocketServer({ port: randomPort })
    }
    catch (e){
        console.log("释放端口")
    }
    let currKey = null; //记录当前正在通信的配置页
    let currParam = null; //用来给当前配置页发送的配置
    let keyWsMapping = new Map();//key -> ws 
    let keyActionMapping = new Map(); //KEY -> ACTIONID
    let actionParamMapping = new Map() ; //actionid -> param 
    let keyParamMapping = new Map();
    let latestWS = null; //最近建立连接的websocket
    //绑定的按键
    let bindKey = null;
    const uuid = "com.ulanzi.ulanzideck.zoom"

    //插件主程序 接受配置的消息
    server.on('connection', function connection(mws) {
        latestWS = mws
        mws.on('error', console.error);
        mws.on('message', function message(data) {
            console.log(`[channel]`, JSON.parse(data))
            let msg_ = JSON.parse(data)
            //向上位机更新参数
            updateParam(msg_)
        });
    });

    let resp;

    // Connection opened
    ws.addEventListener("open", (event) => {
        //发送建立连接消息
        const hello = {
            "code": 0, // 0-"success" or ⾮0-"fail"
            "cmd": "connected", //连接命令
            "uuid": uuid //插件uuid。同配置⽂件UUID保持⼀致。⽤于区分插件
        }
        ws.send(JSON.stringify(hello))
    });
    //Connection closed 
    ws.addEventListener("close",(event)=>{
        server.close()
    })

    // Listen for messages
    ws.addEventListener("message", async (event) => {
        try {
            console.log("Message from server ", JSON.parse(event.data));
            const data = JSON.parse(event.data)
            const { cmd, uuid, key, param, actionid } = data
            switch (cmd) {
                case "connected":
                    //建立连接
                    resp = {
                        "code": 0, // 0-"success" or ⾮0-"fail"
                        "cmd": "connected", //连接命令
                        "uuid": uuid //插件uuid。同配置⽂件UUID保持⼀致。⽤于区分插件
                    }
                    ws.send(JSON.stringify(resp))
                    break
                case "run":
                    //回复
                    resp = {
                        "code": 0, // 0-"success" or ⾮0-"fail"
                        "cmd": "run",
                        "uuid": uuid, //功能uuid
                        "key": key, //上位机按键key,
                        "actionid":actionid,
                        "param": {}
                    }
                    console.log('________---->>>><<<', data)
                    ws.send(JSON.stringify(resp))
                    const image = await run(data, actionid)
                    await updateIcon(image,data.key)
                    //发送到上位机
                    break

                case "setactive":
                    if(data.active){
                        add(data.key,actionid)
                        //如果之前有执行结果，则要发送这个执行结果
                        const prev_param = actionParamMapping.get(actionid)
                        if(prev_param!==undefined){
                            const image = await run(prev_param,actionid)
                            await updateIcon(image,data.key)
                        }
                    }

                    resp = {
                        "code":0,
                        "cmd":"setactive",
                        "active":data.active,
                        "uuid":uuid,
                        "key":data.key,
                        "actionid":actionid
                    }
                    ws.send(JSON.stringify(resp))
                    break
                case 'paramfromapp':
                    //设置从上位机发来的持久化参数
                    const param = data.param

                    paramfromapp(param, actionid,key)
                    //回复
                    resp = {
                        "cmd": "paramfromapp",
                        "uuid": uuid, //功能uuid
                        "key": key, //上位机按键key
                        "actionid":actionid,
                        "param": {}
                    }
                    ws.send(JSON.stringify(resp))
                    break

                case "add":

                    //把插件某个功能配置到按键上
                    add(data.key,actionid)
                    // 持久化数据
                    paramfromapp(data.param,actionid,data.key)

                    resp = {
                        "code": 0, // 0-"success" or ⾮0-"fail"
                        "cmd": "add",
                        "uuid": uuid, //功能uuid
                        "key": key, //上位机按键key
                        "actionid":actionid,
                        "param": {}
                    }
                    ws.send(JSON.stringify(resp))
                    break
                case "init":
                    break

                case "clearall":
                    break

                case "clear":
                    break
                case "paramfromplugin":
                    console.log("[paramfromplugin]", event.data)

            }
        }
        catch (e) {
            console.log("error parsing message", e)
        }

    });

    //执行插件功能
    //param: 本次的配置，actionid:对应的实例
    async function run(data,actionid) {
        //记录本次的param，用于下次setactive使用
        keyParamMapping.set(actionid, data.param);
        const fn = runFunMap[data.uuid];
        fn();
    }

    //把插件功能配置到按键上
    function add(key, actionid) {
        bindKey = key
        //当前正在通信的key，用来对应websocket
        currKey = key
        // 将刚刚建立连接的socket连接上
        keyWsMapping.set(currKey, latestWS)
        //记录与该件绑定的actionid
        keyActionMapping.set(currKey,actionid)
    }
    //传递参数给插件
    async function paramfromapp(param, actionid,key) {
        if (Object.entries(param).length == 0) {
            currParam = {}
        }
        else {
            //将会发送给配置页面
            currParam = param
            //如果初次数据就不为空，执行一次
            const image = await run(param,actionid)
            await updateIcon(image,key)
        }
        //写入map中
        actionParamMapping.set(actionid,param)
        //将对应的key和配置发送给配置页面
        let initialMsg = {
            "cmd": "paramfromplugin",
            "uuid": "com.ulanzi.ulanzideck.weather", //功能uuid
            "param": currParam, //持久化的参数,
            "actionid":actionid,
            "key":key
        }

        if(keyWsMapping.get(key)){
            console.log("发送参数到页面")
            keyWsMapping.get(key).send(JSON.stringify(initialMsg))
        }
    }
    // 插件->上位机
    //插件更新参数
    async function updateParam(param) {
        console.log("[updateParam] 键是", param.key)
        //写入map
        actionParamMapping.set(param.actionid,param)
        //更新一次
        
        const image = await run(param,param.actionid)
        await updateIcon(image,param.key)
        const msg = {
            "cmd": "paramfromplugin",
            "uuid": param.uuid, //功能uuid
            "key": param.key, //上位机按键key
            "param": param,
            "actionid":keyActionMapping.get(param.key)
        }

        ws.send(JSON.stringify(msg))
    }

    //插件更新图标
    async function updateIcon(data,key) {
        console.log(`updateIcon key ${key} actionid ${keyActionMapping.get(key)}`)
        const msg = {
            "cmd": "state",
            "param": {//图标状态更换，若⽆则为空
                "statelist": [
                    {
                        "uuid": actionID, //功能uuid,
                        "actionid":keyActionMapping.get(key),
                        "key": key,
                        "type": 1,
                        "state": 1, // 图标列表数组编号。请对照manifest.json
                        "data": data, // ⾃定义图标base64编码数据
                        "path": "" //本地图⽚⽂件
                    }
                ]
            }
        }
        ws.send(JSON.stringify(msg))
    }
}
 
