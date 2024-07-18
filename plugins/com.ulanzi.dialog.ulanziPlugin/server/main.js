const { createRandomPort } = require('./libs/random-port.js');
const { app, BrowserWindow } = require('electron');
const { createDialog } = require('./dialog');
// const { cutDialog, systemDialog } = require('./electron');
const WebSocket = require('ws');
const path = require('path');
const { WebSocketServer } = WebSocket;

const uuid = "com.ulanzi.ulanzideck.dialog"


let actionidWsMapping = new Map();//key -> ws 
let actionParamMapping = new Map() ; //actionid -> payload 
let latestWS = null; //最近建立连接的websocket
let currActionid = null; // 记录当前正在通信的配置页
let cutWindow = null;
function createWindow() {
  // 创建一个新的窗口
  cutWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // 加载应用的主页面
  cutWindow.loadFile('index.html');
}
app.on('ready', createWindow);
// 在适当的地方调用 createDialog 函数
app.on('ready', () => {
  createDialog(cutWindow, {
    url: 'index.html',
    width: 400,
    height: 300
  });
});
console.log('------------------------<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>')
app.on('ready', () => {
  
  createRandomPort().then(d => {
    initMain(d.port)
  }); 
})

function initMain(randomPort) {
 
  function cutDialog() {
    if (!cutWindow) {
      cutWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false, // 隐藏标题栏
        webPreferences: {
          nodeIntegration: true
        }
      });
    }
  }
  function systemDialog() {
  
  }
  const runFunMap = {
    'com.ulanzi.ulanzideck.dialog.cut': cutDialog,
    'com.ulanzi.ulanzideck.zoom.system': systemDialog,
  }
  //读取上位机信息
  const runtime = process.argv
  const [ip = defaultIp, port = defaultPort] = runtime.slice(2,4)
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

  //插件主程序 接受配置的消息
  server.on('connection', function connection(mws) {
    latestWS = mws;
    mws.on('error', console.error);
    mws.on('message', function message(data) {
      let msg_ = JSON.parse(data)
      if (msg_.cmd === 'paramfromplugin') {
        //向上位机更新参数
        updateParam(msg_)
      } else if (msg_.cmd === 'openurl') {
        ws.send(JSON.stringify(msg_));
      }
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
      const data = JSON.parse(event.data);
      switch (data.cmd) {
        case "run":
          run(data);
          break
        case "setactive":
          if(data.active){
            add(data)
          }
          break
        case 'paramfromapp':
          //设置从上位机发来的持久化参数
          paramfromapp(data);
          break

        case "add":
          //把插件某个功能配置到按键上
          add(data);
          paramfromapp(data);
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
  function run(data) {
    // const fn = runFunMap[data.uuid];
    console.log('--------------------->><', data.uuid)
    // fn();
    // fn(ws);
  }

  //把插件功能配置到按键上
  function add(data) {
    console.log('-------addd', data.actionid)
    currActionid = data.actionid;
    // 将刚刚建立连接的socket连接上
    actionidWsMapping.set(currActionid, latestWS)
    // 插件数据与actionid绑定
    actionParamMapping.set(currActionid, data);
  }
  //传递参数给插件
  async function paramfromapp(data) {
    const {actionid} = data;
    console.log('-------paramfromapp', actionid)
    //写入map中
    actionParamMapping.set(actionid, data);
    //将对应的actionid和配置发送给配置页面
    console.log("-------------------->sendto page start")
    if(actionidWsMapping.get(actionid)){
        console.log("-------------------->sendto page")
        actionidWsMapping.get(actionid).send(JSON.stringify(data))
    }
  }
  // 插件->上位机
  //插件更新参数
  async function updateParam(payload) {
    const { uuid, key, actionid, param} = payload;
    //写入map
    actionParamMapping.set(actionid, payload);
    const msg = {
      cmd: "paramfromplugin",
      uuid,
      key,
      param,
      actionid
    }
    ws.send(JSON.stringify(msg))
  }

  //插件更新图标
  async function updateIconUseState(data, state) {
    const {uuid, actionid, key} = data;
    const msg = {
      cmd: "state",
      param: {
        statelist: [
          {
            uuid,
            key,
            actionid,
            type: 0,
            state
          }
        ]
      }
    }
    ws.send(JSON.stringify(msg))
  }
}
