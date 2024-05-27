const fadeColor = function (col, amt) {
	const min = Math.min,
		max = Math.max;
	const num = parseInt(col.replace(/#/g, ''), 16);
	const r = min(255, max((num >> 16) + amt, 0));
	const g = min(255, max((num & 0x0000ff) + amt, 0));
	const b = min(255, max(((num >> 8) & 0x00ff) + amt, 0));
	return '#' + (g | (b << 8) | (r << 16)).toString(16).padStart(6, 0);
};
const highlightColor = '#0078ffff';
const mouseDownColor = fadeColor(highlightColor, -100);
$PI.onConnected(() => {
	const node = document.getElementById('#sdpi-dynamic-styles') || document.createElement('style');
	const mouseDownColor = fadeColor(highlightColor, -100);
	const clr = '#0078ff';
	const clr1 = fadeColor(clr, 100);
	const clr2 = fadeColor(clr, 60);
	const metersActiveColor = fadeColor(clr, -60);

	node.setAttribute('id', 'sdpi-dynamic-styles');
	node.innerHTML = `

    input[type="radio"]:checked + label span,
    input[type="checkbox"]:checked + label span {
        background-color: #0078ffff;
    }

    input[type="radio"]:active:checked + label span,
    input[type="checkbox"]:active:checked + label span {
      background-color: ${mouseDownColor};
    }

    input[type="radio"]:active + label span,
    input[type="checkbox"]:active + label span {
      background-color: #646464ff;
    }

    td.selected,
    td.selected:hover,
    li.selected:hover,
    li.selected {
      color: white;
      background-color: #0078ffff;
    }

    .sdpi-file-label > label:active,
    .sdpi-file-label.file:active,
    label.sdpi-file-label:active,
    label.sdpi-file-info:active,
    input[type="file"]::-webkit-file-upload-button:active,
    button:active {
      border: 1pt solid #646464ff;
      background-color: #303030ff;
      color: #969696ff;
      border-color: #646464ff;
    }

    ::-webkit-progress-value,
    meter::-webkit-meter-optimum-value {
        background: linear-gradient(${clr2}, ${clr1} 20%, ${clr} 45%, ${clr} 55%, ${clr2})
    }

    ::-webkit-progress-value:active,
    meter::-webkit-meter-optimum-value:active {
        background: linear-gradient(${clr}, ${clr2} 20%, ${metersActiveColor} 45%, ${metersActiveColor} 55%, ${clr})
    }
    `;
	document.body.appendChild(node);
});

// added functions to block the UI if the applicaatino is not running
function blockUI() {
    document.querySelector("#property-inspector").classList.add("hidden")
    document.querySelector("#no-app-warning").classList.remove("hidden")
    document.querySelector("#download-vm-button").innerHTML = 'Download Voicemod'
    document.querySelector("#no-app-warning .not-running-msg").innerHTML = 'Voicemod is not running'
    document.querySelector("#bottom-msg").innerHTML = 'Install Voicemod'
}

function enableUI() {
    document.querySelector("#property-inspector").classList.remove("hidden")
    document.querySelector("#no-app-warning").classList.add("hidden")
}