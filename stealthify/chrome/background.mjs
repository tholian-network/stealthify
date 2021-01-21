
import { console, isObject } from '../extern/base.mjs';
import { Stealthify        } from '../source/Stealthify.mjs';
import { URL               } from '../source/parser/URL.mjs';



let stealthify = new Stealthify(null, chrome);

setTimeout(() => {

	chrome.proxy.settings.set({
		value: {
			mode: 'direct'
		}
	}, () => {
		// Do Nothing
	});

}, 0);

setTimeout(() => {

	stealthify.storage.read((result) => {

		if (result === true) {
			stealthify.connect();
		}

	});

}, 100);

setTimeout(() => {

	const isProxied = function(url) {

		if (isObject(url) === true) {

			if (
				url.domain === stealthify.settings.host
				&& url.port === 65432
				&& url.path.startsWith('/stealth/')
			) {
				return true;
			}

		}


		return false;

	};

	chrome.tabs.query({
		active: null
	}, (chrome_tabs) => {

		chrome_tabs.forEach((chrome_tab) => {

			let url = URL.parse(chrome_tab.url);

			if (isProxied(url) === true) {
				url = URL.parse(url.path.substr('/stealth/'.length));
			}

			if (URL.isURL(url) === true) {

				let tab = stealthify.getTab('chrome-' + chrome_tab.id);
				if (tab !== null) {

					tab.url = url;

					let mode = stealthify.getMode(url.link);
					if (mode !== null) {
						tab.modes.push(mode);
					}

				}

			}

		});

	});

}, 200);



// Debuggable constants
window.APPBAR     = { '1st-party': null, '2nd-party': null, '3rd-party': null };
window.console    = console;
window.STEALTHIFY = stealthify;

