function downloadVM() {
	console.log("GLobal settings: ", __GLOBAL_SETTINGS)
	if(!__GLOBAL_SETTINGS.hasOwnProperty('downloadedFromSD') && !__GLOBAL_SETTINGS.downloadSourceValidated) {
		__GLOBAL_SETTINGS.downloadedFromSD = 1
	} 
	$PI.setGlobalSettings(__GLOBAL_SETTINGS)
	window.open("https://www.voicemod.net/downloadFromStreamDeck.php?v=", "_blank")
}