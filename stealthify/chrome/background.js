
const isModule = (val) => Object.prototype.toString.call(val) === '[object Module]';



(async () => {

	let url = chrome.runtime.getURL('/source/Stealthify.mjs');
	let mod = await import(url);

	if (isModule(mod) === true) {

		window.stealthify = new Stealthify(null, chrome);

		setTimeout(() => {
			window.stealthify.connect();
		}, 0);

	}

})();

