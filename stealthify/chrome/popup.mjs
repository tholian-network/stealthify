
import { Element } from '../design/Element.mjs';
import { Mode    } from '../design/appbar/Mode.mjs';
import { URL     } from '../source/parser/URL.mjs';



// XXX: Debugging can only be done via Background Page
// const console = chrome.extension.getBackgroundPage().console || window.console;

window.APPBAR     = chrome.extension.getBackgroundPage().APPBAR     || {};
window.STEALTHIFY = chrome.extension.getBackgroundPage().STEALTHIFY || null;



window.APPBAR['1st-party'] = Element.query('stealthify-appbar section[data-key="1st-party"]');
window.APPBAR['2nd-party'] = Element.query('stealthify-appbar section[data-key="2nd-party"]');
window.APPBAR['3rd-party'] = Element.query('stealthify-appbar section[data-key="3rd-party"]');

const update = function(tab) {

	let domain = URL.toDomain(tab.url);
	let modes  = {
		'1st-party': [],
		'2nd-party': [],
		'3rd-party': []
	};

	modes['1st-party'] = tab.modes.filter((m) => m.domain === domain);
	modes['2nd-party'] = tab.modes.filter((m) => URL.isDomain(domain, m.domain) && modes['1st-party'].includes(m) === false);
	modes['3rd-party'] = tab.modes.filter((m) => modes['2nd-party'].includes(m) === false && modes['1st-party'].includes(m) === false);


	window.APPBAR['1st-party'].query('*', true).forEach((widget) => widget.erase());
	window.APPBAR['2nd-party'].query('*', true).forEach((widget) => widget.erase());
	window.APPBAR['3rd-party'].query('*', true).forEach((widget) => widget.erase());


	modes['1st-party'].forEach((mode) => {
		Mode.from(mode).render(window.APPBAR['1st-party']);
	});

	modes['2nd-party'].forEach((mode) => {
		Mode.from(mode).render(window.APPBAR['2nd-party']);
	});

	modes['3rd-party'].forEach((mode) => {
		Mode.from(mode).render(window.APPBAR['3rd-party']);
	});

};

const getURL = (callback) => {

	chrome.tabs.query({
		active:        true,
		currentWindow: true
	}, (tabs) => {

		let tab = tabs[0] || null;
		if (tab !== null) {

			let url = URL.parse(tab.url);
			if (URL.isURL(url) === true) {
				callback(url);
			} else {
				callback(null);
			}

		} else {
			callback(null);
		}

	});

};



let stealthify = window.STEALTHIFY || null;
if (stealthify !== null) {

	let body = Element.query('body');
	if (body !== null) {
		body.attr('data-theme', stealthify.settings.theme);
	}

	let disconnect = Element.query('button[data-action="disconnect"]');
	if (disconnect !== null) {

		disconnect.on('click', () => {

			let action = disconnect.attr('data-action');
			if (action === 'connect') {
				stealthify.connect();
			} else if (action === 'disconnect') {
				stealthify.disconnect();
			}

		});

		if (stealthify.is('connected') === false) {
			disconnect.attr('data-action', 'connect');
			disconnect.attr('title', 'Connect Stealthify');
		}

		stealthify.on('connect', () => {
			disconnect.attr('data-action', 'disconnect');
			disconnect.attr('title', 'Disconnect Stealthify');
		});

		stealthify.on('disconnect', () => {
			disconnect.attr('data-action', 'connect');
			disconnect.attr('title', 'Connect Stealthify');
		});

	}

	let incognito = Element.query('button[data-action="incognito"]');
	if (incognito !== null) {

		incognito.on('click', () => {

			if (incognito.state() !== 'disabled') {

				getURL((url) => {

					if (url !== null) {

						chrome.windows.create({
							incognito: true,
							url:       URL.render(url)
						});

					}

				});

			}

		});

		getURL((url) => {

			if (url === null) {
				incognito.state('disabled');
			}

		});

	}

	let options = Element.query('button[data-action="options"]');
	if (options !== null) {

		options.on('click', () => {

			chrome.tabs.query({
				url: chrome.runtime.getURL('chrome/options.html')
			}, (tabs) => {

				if (tabs.length > 0) {

					chrome.tabs.highlight({
						tabs: [ tabs[0].index ]
					});

				} else {

					chrome.tabs.create({
						url: chrome.runtime.getURL('chrome/options.html')
					});

				}

			});

		});

	}


	stealthify.on('change', (tab) => update.call(stealthify, tab));


	window.addEventListener('load', () => {

		chrome.tabs.query({
			active:        true,
			currentWindow: true
		}, (chrome_tabs) => {

			let chrome_tab = chrome_tabs[0] || null;
			if (chrome_tab !== null) {

				let tab = stealthify.getTab('chrome-' + chrome_tab.id) || null;
				if (tab !== null) {

					if (stealthify.tab !== tab) {
						stealthify.tab = tab;
					}

					update.call(stealthify, tab);

				}

			}

		});

	});

}

