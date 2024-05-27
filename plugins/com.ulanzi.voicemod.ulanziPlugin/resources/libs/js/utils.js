class Utils {
	/**
	 * Returns the value from a form using the form controls name property
	 * @param {Element | string} form
	 * @returns
	 */
	static getFormValue(form) {
		if (typeof form === 'string') {
			form = document.querySelector(form);
		}

		const elements = form?.elements;

		if (!elements) {
			console.error('Could not find form!');
		}

		const formData = new FormData(form);
		let formValue = {};

		formData.forEach((value, key) => {
			if (!Reflect.has(formValue, key)) {
				formValue[key] = value;
				return;
			}
			if (!Array.isArray(formValue[key])) {
				formValue[key] = [formValue[key]];
			}
			formValue[key].push(value);
		});

		return formValue;
	}

	/**
	 * Sets the value of form controls using their name attribute and the jsn object key
	 * @param {*} jsn
	 * @param {Element | string} form
	 */
	static setFormValue(jsn, form) {
		if (!jsn) {
			return;
		}

		if (typeof form === 'string') {
			form = document.querySelector(form);
		}

		const elements = form?.elements;

		if (!elements) {
			console.error('Could not find form!');
		}

		Array.from(elements)
			.filter((element) => element?.name)
			.forEach((element) => {
				const { name, type } = element;
				const value = name in jsn ? jsn[name] : null;
				const isCheckOrRadio = type === 'checkbox' || type === 'radio';

				if (value === null) return;

				if (isCheckOrRadio) {
					const isSingle = value === element.value;
					if (isSingle || (Array.isArray(value) && value.includes(element.value))) {
						element.checked = true;
					}
				} else {
					element.value = value ?? '';
				}
			});
	}

	/**
	 * This provides a slight delay before processing rapid events
	 * @param {number} wait - delay before processing function (recommended time 150ms)
	 * @param {function} fn
	 * @returns
	 */
	static debounce(wait, fn) {
		let timeoutId = null;
		return (...args) => {
			window.clearTimeout(timeoutId);
			timeoutId = window.setTimeout(() => {
				fn.apply(null, args);
			}, wait);
		};
	}

	static delay(wait) {
		return new Promise((fn) => setTimeout(fn, wait));
	}
}

window.__GLOBAL_SETTINGS = {};

/*
Make sure we never overwrite the global settings
*/

function requestVoiceBitMap(settings) {
    console.log("On RequestBitmap: ", settings)
    if(settings['selected-voice'] && !settings['button-images']) {
        console.log("requesting bitmap for voice: ", settings['selected-voice'])
        console.log("settings: ", settings)
        Voicemod.sendMessageToServer('getVoiceBitmap', settings['selected-voice'], settings['selected-voice'])
    } else if(settings['button-images']) {
        Voicemod.forceMessage({ //we fake a message, as if it was received by the server
            actionType: 'getBitmap',
            actionID: settings['selected-voice'],
            actionObject: {
                result: settings['button-images']
            }
        })
        VoiceChangerAction.updateButtonState(settings['my-context'], settings)
    }
}

function canvasShake(context) {
    function fShake(context, vPosX, vPosY, vRotate) {
        var imageUrl = "resources/images/actionDefaultImage.png";
        convertImgToBase64_motion(imageUrl, vPosX, vPosY, vRotate, function(base64Img){
            var vKrabsBase64 = base64Img;
            setImage(context, vKrabsBase64);
        });
    };
    setTimeout(function() { fShake(context,3,1,0) }, 100);
    setTimeout(function() { fShake(context,0,0,0) }, 200);
    setTimeout(function() { fShake(context,-5,-2,0) }, 300);
    setTimeout(function() { fShake(context,6,1,0) }, 400);
    setTimeout(function() { fShake(context,-3,0,0) }, 500);
    setTimeout(function() { fShake(context,1,2,0) }, 600);
    setTimeout(function() { fShake(context,0,-1,0) }, 700);
    setTimeout(function() { fShake(context,-2,0,0) }, 800);
    setTimeout(function() { fShake(context,4,2,0) }, 900);
    setTimeout(function() { fShake(context,0,0,0) }, 1000);
};

function convertImgToBase64_text(url, vShowTime, vShowDate, vShowDay, vShowSeconds, vBackgroundType, vTime_Numbers, vDate, vDayName, vTextColor, vShadow, vCustomBackgroundColor, callback, outputFormat){
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        //canvas.height = img.height;
        //canvas.width = img.width;
        canvas.height = "72";
        canvas.width = "72";
        ctx.drawImage(img,0,0,72,72);
        // Text, width, height
        if (vShowTime == true && vShowDate == true) {
            if (vBackgroundType == "custom") {
                // shape
                ctx.fillStyle = vCustomBackgroundColor;
                // x, y, width, height
                if (url == "resources/images/Adaptive/black.png") {
                    ctx.fillRect(0, 0, 72, 72);
                } else {
                    ctx.fillRect(0, 0, 0, 0);
                }
            }
            if (vShowDay == false) {
                vPostition = 40
            } else {
                vPostition = 36
            }
            // Time
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
            ctx.shadowBlur = 2;
            if (vShowSeconds == true) {
                ctx.font = "20px Impact";
            } else {
                ctx.font = "28px Impact";
            }
            ctx.fillStyle = vTextColor;
            ctx.textAlign = 'center';
            if (vBackgroundType == "adaptive") {
                ctx.strokeStyle = '#515A5A';
                ctx.strokeText(vTime_Numbers, 36, vPostition);
            }
            ctx.fillText(vTime_Numbers, 36, vPostition);

            // AM or PM
            /*ctx.font = "10px Impact";
            ctx.fillStyle = 'white';
            ctx.textAlign = 'start';
            ctx.fillText(vTime_AMPM, 58, 36);*/

            // Date
            ctx.font = "16px Impact";
            ctx.fillStyle = vTextColor;
            ctx.textAlign = 'center';
            if (vBackgroundType == "adaptive") {
                ctx.strokeStyle = '#515A5A';
                ctx.strokeText(vDate, 36, (vPostition + 16));
            }
            ctx.fillText(vDate, 36, (vPostition + 16));
            // Day Name
            if (vShowDay == true) {
                ctx.shadowOffsetX = 4;
                ctx.shadowOffsetY = 4;
                ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
                ctx.shadowBlur = 4;
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = vTextColor;
                ctx.textAlign = 'center';
                if (vBackgroundType == "adaptive") {
                    ctx.strokeStyle = '#515A5A';
                    ctx.strokeText(vDayName, 36, 64);
                }
                ctx.fillText(vDayName, 36, 64);
            }

        } else if (vShowTime == true && vShowDate == false) {
            if (vBackgroundType == "custom") {
                // shape
                ctx.fillStyle = vCustomBackgroundColor;
                // x, y, width, height
                if (url == "resources/images/Adaptive/black.png") {
                    ctx.fillRect(0, 0, 72, 72);
                } else {
                    ctx.fillRect(0, 0, 0, 0);
                }
            }
            if (vShowDay == false) {
                vPostition = 46
            } else {
                vPostition = 40
            }
            // Time
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
            ctx.shadowBlur = 4;
            if (vShowSeconds == true) {
                ctx.font = "20px Impact";
            } else {
                ctx.font = "28px Impact";
            }
            ctx.fillStyle = vTextColor;
            ctx.textAlign = 'center';
            if (vBackgroundType == "adaptive") {
                ctx.strokeStyle = '#515A5A';
                ctx.strokeText(vTime_Numbers, 36, vPostition);
            }
            ctx.fillText(vTime_Numbers, 36, vPostition);
            // Day Name
            if (vShowDay == true) {
                ctx.shadowOffsetX = 4;
                ctx.shadowOffsetY = 4;
                ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
                ctx.shadowBlur = 4;
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = vTextColor;
                ctx.textAlign = 'center';
                if (vBackgroundType == "adaptive") {
                    ctx.strokeStyle = '#515A5A';
                    ctx.strokeText(vDayName, 36, 54);
                }
                ctx.fillText(vDayName, 36, 54);
            }
        } else if (vShowTime == false && vShowDate == true) {
            if (vBackgroundType == "custom") {
                // shape
                ctx.fillStyle = vCustomBackgroundColor;
                // x, y, width, height
                if (url == "resources/images/Adaptive/black.png") {
                    ctx.fillRect(0, 0, 72, 72);
                } else {
                    ctx.fillRect(0, 0, 0, 0);
                }
            }
            if (vShowDay == false) {
                vPostition = 46
            } else {
                vPostition = 40
            }
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
            ctx.shadowBlur = 4;
            // Date
            ctx.font = "22px Impact";
            ctx.fillStyle = vTextColor;
            ctx.textAlign = 'center';
            if (vBackgroundType == "adaptive") {
                ctx.strokeStyle = '#515A5A';
                ctx.strokeText(vDate, 36, vPostition);
            }
            ctx.fillText(vDate, 36, vPostition);
            // Day Name
            if (vShowDay == true) {
                ctx.shadowOffsetX = 4;
                ctx.shadowOffsetY = 4;
                ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
                ctx.shadowBlur = 4;
                ctx.font = "bold 12px Arial";
                ctx.fillStyle = vTextColor;
                ctx.textAlign = 'center';
                if (vBackgroundType == "adaptive") {
                    ctx.strokeStyle = '#515A5A';
                    ctx.strokeText(vDayName, 36, 54);
                }
                ctx.fillText(vDayName, 36, 54);
            }
        } else if (vShowTime == false && vShowDate == false && vShowDay == true) {
            if (vBackgroundType == "custom") {
                // shape
                ctx.fillStyle = vCustomBackgroundColor;
                // x, y, width, height
                if (url == "resources/images/Adaptive/black.png") {
                    ctx.fillRect(0, 0, 72, 72);
                } else {
                    ctx.fillRect(0, 0, 0, 0);
                }
            }
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
            ctx.shadowBlur = 4;
            // Day Name
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
            ctx.shadowBlur = 4;
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = vTextColor;
            ctx.textAlign = 'center';
            if (vBackgroundType == "adaptive") {
                ctx.strokeStyle = '#515A5A';
                ctx.strokeText(vDayName, 36, 40);
            }
            ctx.fillText(vDayName, 36, 40);
        } else {
            if (vBackgroundType == "custom") {
                // shape
                ctx.fillStyle = vCustomBackgroundColor;
                // x, y, width, height
                if (url == "resources/images/Adaptive/black.png") {
                    ctx.fillRect(0, 0, 72, 72);
                } else {
                    ctx.fillRect(0, 0, 0, 0);
                }
            }
            vTextColor = "rgba(255,100,100,0.0)"
            // Time
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
            ctx.shadowBlur = 4;
            if (vShowSeconds == true) {
                ctx.font = "20px Impact";
            } else {
                ctx.font = "28px Impact";
            }
            ctx.fillStyle = vTextColor;
            ctx.textAlign = 'center';
            /*if (vBackgroundType == "adaptive") {
              ctx.strokeStyle = '#515A5A';
              ctx.strokeText(vTime_Numbers, 36, 36);
            }*/
            ctx.fillText(vTime_Numbers, 36, 36);
            // Date
            ctx.font = "16px Impact";
            ctx.fillStyle = vTextColor;
            ctx.textAlign = 'center';
            /*if (vBackgroundType == "adaptive") {
              ctx.strokeStyle = '#515A5A';
              ctx.strokeText(vDate, 36, 52);
            }*/
            ctx.fillText(vDate, 36, 52);
            // Day Name
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.shadowColor = "rgba(0,0,0,0." + vShadow +")";
            ctx.shadowBlur = 4;
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = vTextColor;
            ctx.textAlign = 'center';
            /*if (vBackgroundType == "adaptive") {
              ctx.strokeStyle = '#515A5A';
              ctx.strokeText(vDayName, 36, 68);
            }*/
            ctx.fillText(vDayName, 36, 68);
        }

        // shape
        //ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
        //ctx.fillRect(30, 30, 20, 20);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        // Clean up
        canvas = null;
    };
    img.src = url;
};

function convertImgToBase64_motion(url, vPosX, vPosY, vRotate, callback, outputFormat){
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        //ctx.rotate(vRotate*Math.PI/180);
        ctx.drawImage(img,vPosX,vPosY);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        // Clean up
        canvas = null;
    };
    img.src = url;
};

function convertImgToBase64(url, callback, outputFormat){
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        // Clean up
        canvas = null;
    };
    img.src = url;
};

function getUniqueActionId(uuid, key) {
    return uuid + (key||'')
}