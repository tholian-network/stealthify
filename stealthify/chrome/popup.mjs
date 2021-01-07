
import { Element } from '../design/Element.mjs';
// import { Toggle  } from '../design/Toggle.mjs';
import { URL     } from '../source/parser/URL.mjs';



window.STEALTHIFY = chrome.extension.getBackgroundPage().STEALTHIFY || null;



let stealthify = window.STEALTHIFY || null;
if (stealthify !== null) {

	let body = Element.query('body');
	if (body !== null) {
		body.attr('data-theme', stealthify.settings.theme);
	}

	let incognito = Element.query('button[data-action="incognito"]');
	if (incognito !== null) {

		incognito.on('click', () => {

			chrome.tabs.query({
				active:        true,
				currentWindow: true
			}, (tabs) => {

				let tab = tabs[0] || null;
				if (tab !== null) {

					let url = URL.parse(tab.url);
					if (URL.isURL(url) === true) {

						chrome.windows.create({
							incognito: true,
							url:       URL.render(url)
						});

					}

				}

			});

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

}

