
import { isArray, isObject, isString } from '../extern/base.mjs';
import { URL                         } from '../source/parser/URL.mjs';
import { isMode                      } from '../source/Stealthify.mjs';



export const isTab = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Tab]';
};



let CURRENT_ID = 0;

const Tab = function(settings) {

	settings = isObject(settings) ? settings : {};


	settings = Object.freeze({
		id:  isString(settings.id)   ? settings.id  : ('' + CURRENT_ID++),
		url: URL.isURL(settings.url) ? settings.url : null
	});


	this.id    = settings.id;
	this.modes = [];
	this.url   = URL.parse('stealth:welcome');


	if (URL.isURL(settings.url) === true) {
		this.url = settings.url;
	}

};


Tab.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Tab' ? json.type : null;
		let data = isObject(json.data) ? json.data : null;

		if (type !== null && data !== null) {

			let tab = new Tab();

			if (isString(data.id) === true) {
				tab.id = data.id;
			}

			if (isString(data.url) === true) {
				tab.url = data.url;
			}

			if (isArray(data.modes) === true) {

				data.modes.forEach((mode) => {

					if (isMode(mode) === true) {
						tab.modes.push(mode);
					}

				});

			}

			return tab;

		}

	}


	return null;

};


Tab.isTab = isTab;


Tab.prototype = {

	[Symbol.toStringTag]: 'Tab',

	toJSON: function() {

		let data = {
			id:    this.id,
			modes: [],
			url:   URL.render(this.url)
		};


		this.modes.forEach((mode) => {
			data.modes.push(mode);
		});


		return {
			'type': 'Tab',
			'data': data
		};

	}

};


export { Tab };

