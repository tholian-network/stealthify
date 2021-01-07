
import { Element  } from '../design/Element.mjs';
import { Settings } from '../design/card/Settings.mjs';



window.STEALTHIFY = chrome.extension.getBackgroundPage().STEALTHIFY || null;



let stealthify = window.STEALTHIFY || null;
if (stealthify !== null) {

	let settings = Settings.from(stealthify.settings);

	let body = Element.query('body');
	if (body !== null) {

		body.attr('data-theme', stealthify.settings.theme);

		settings.render(body);
		settings.emit('show');

		settings.on('save', () => {
			body.attr('data-theme', stealthify.settings.theme);
		});

	}

}

