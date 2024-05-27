class ULANZIAction {
	// 插件功能需要加上位键位置(uuid+key)
	UUID;
	on = EventEmitter.on;
	emit = EventEmitter.emit;

	constructor(UUID) {
		if (!UUID) {
			console.error(
				'An action UUID matching the action UUID in your manifest is required when creating Actions.'
			);
		}

		this.UUID = UUID;
	}

	/**
	 * 上位机⻚⾯切换的时候，如果⻚⾯上有相应的插件功能，就会给插件发送这个初始化。
	 * @param {function} fn
	 */
	onInit(fn) {
		if (!fn) {
			console.error(
				'A callback function for the init event is required for onInit.'
			);
		}

		this.on(`${this.UUID}.${Events.init}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 插件的客⼾端和服务端连接后，⽴刻向服务端发送⼀条信息
	 * @param {function} fn
	 */
	onConnected(fn) {
		if (!fn) {
			console.error(
				'A callback function for the connected event is required for onConnected.'
			);
		}

		this.on(`${this.UUID}.${Events.connected}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * ⽤⼾按下按键执⾏功能的时候
	 * @param {function} fn
	 */
	onRun(fn) {
		if (!fn) {
			console.error('A callback function for the run event is required for onRun.');
		}

		this.on(`${this.UUID}.${Events.run}`, (jsn) => {
			const r = fn(jsn);
			setTimeout(() => {
				this.emit(`${this.UUID}.${Events.runAfter}`, jsn);
			}, 0);
			return r;
		});
		return this;
	}
	onRunAfter(fn) {
		if (!fn) {
			console.error('A callback function for the run event is required for onRun.');
		}

		this.on(`${this.UUID}.${Events.runAfter}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 插件功能被加载的时候。插件UI功能创建的时候
	 * @param {function} fn
	 */
	onParamfromapp(fn) {
		if (!fn) {
			console.error('A callback function for the paramfromapp event is required for onParamfromapp.');
		}

		this.on(`${this.UUID}.${Events.paramfromapp}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 插件js界⾯参数变化的时候
	 * @param {function} fn
	 */
	onParamfromplugin(fn) {
		if (!fn) {
			console.error(
				'A callback function for the paramfromplugin event is required for onParamfromplugin.'
			);
		}

		this.on(`${this.UUID}.${Events.paramfromplugin}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 *  ⽤⼾拖拽插件功能到key上进⾏配置的时候（add）
	 * @param {function} fn
	 */
	onAdd(fn) {
		if (!fn) {
			console.error('A callback function for the add event is required for onAdd.');
		}

		this.on(`${this.UUID}.${Events.add}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 删除单个插件功能的key的时候（clear）
	 * @param {function} fn
	 */
	onClear(fn) {
		if (!fn) {
			console.error(
				'A callback function for the clear event is required for onClear.'
			);
		}

		this.on(`${this.UUID}.${Events.willDisappear}`, (jsn) => fn(jsn));
		return this;
	}
	/**
	 * 删除⻚⾯的时候，或者⻚⾯切换时，会将之前的⻚⾯的插件配置信息清理掉。（clearall）
	 * @param {function} fn
	 */
	onClearall(fn) {
		if (!fn) {
			console.error(
				'A callback function for the clearall event is required for onClearall.'
			);
		}

		this.on(`${this.UUID}.${Events.clearall}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 插件的图标显⽰需要发⽣变化的时候
	 * @param {function} fn
	 */
	onState(fn) {
		if (!fn) {
			console.error(
				'A callback function for the state event is required for onState.'
			);
		}

		this.on(`${this.UUID}.${Events.state}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 请求上位机使⽤浏览器打开url，⽤⼾登录
	 * @param {function} fn
	 */
	onOpenurl(fn) {
		if (!fn) {
			console.error(
				'A callback function for the openurl event is required for onOpenurl.'
			);
		}

		this.on(`${this.UUID}.${Events.openurl}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 显⽰弹窗时候
	 * @param {function} fn
	 */
	onOpenview(fn) {
		if (!fn) {
			console.error(
				'A callback function for the openview event is required for onOpenview.'
			);
		}

		this.on(`${this.UUID}.${Events.openview}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * 关闭弹窗时候
	 * @param {function} fn
	 */
	onCloseview(fn) {
		if (!fn) {
			console.error(
				'A callback function for the closeview event is required for onCloseview.'
			);
		}

		this.on(`${this.UUID}.${Events.closeview}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the didReceiveSettings event, which fires when calling getSettings
	 * @param {function} fn
	 */
	onDidReceiveSettings(fn) {
		if (!fn) {
			console.error(
				'A callback function for the didReceiveSettings event is required for onDidReceiveSettings.'
			);
		}

		this.on(`${this.UUID}.${Events.didReceiveSettings}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the willAppear event, which fires when an action appears on the canvas
	 * @param {function} fn
	 */
	onWillAppear(fn) {
		if (!fn) {
			console.error('A callback function for the willAppear event is required for onWillAppear.');
		}

		this.on(`${this.UUID}.${Events.willAppear}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the willAppear event, which fires when an action disappears on the canvas
	 * @param {function} fn
	 */
	onWillDisappear(fn) {
		if (!fn) {
			console.error(
				'A callback function for the willDisappear event is required for onWillDisappear.'
			);
		}

		this.on(`${this.UUID}.${Events.willDisappear}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the titleParametersDidChange event, which fires when a user changes the key title
	 * @param {function} fn
	 */
	onTitleParametersDidChange(fn) {
		if (!fn) {
			console.error(
				'A callback function for the titleParametersDidChange event is required for onTitleParametersDidChange.'
			);
		}

		this.on(`${this.UUID}.${Events.titleParametersDidChange}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the propertyInspectorDidAppear event, which fires when the property inspector is displayed
	 * @param {function} fn
	 */
	onPropertyInspectorDidAppear(fn) {
		if (!fn) {
			console.error(
				'A callback function for the propertyInspectorDidAppear event is required for onPropertyInspectorDidAppear.'
			);
		}

		this.on(`${this.UUID}.${Events.propertyInspectorDidAppear}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the propertyInspectorDidDisappear event, which fires when the property inspector is closed
	 * @param {function} fn
	 */
	onPropertyInspectorDidDisappear(fn) {
		if (!fn) {
			console.error(
				'A callback function for the propertyInspectorDidDisappear event is required for onPropertyInspectorDidDisappear.'
			);
		}

		this.on(`${this.UUID}.${Events.propertyInspectorDidDisappear}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the sendToPlugin event, which fires when the property inspector uses the sendToPlugin api
	 * @param {function} fn
	 */
	onSendToPlugin(fn) {
		if (!fn) {
			console.error(
				'A callback function for the sendToPlugin event is required for onSendToPlugin.'
			);
		}
		this.on(`${this.UUID}.${Events.sendToPlugin}`, (jsn) => fn(jsn));
		return this;
	}
}

window.Action = ULANZIAction;
