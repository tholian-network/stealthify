
import { isArray, isBoolean, isFunction, isObject, isString } from '../extern/base.mjs';



export const isStorage = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Storage]';
};



const Storage = function(settings, chrome) {

	settings = isObject(settings)   ? settings : {};
	chrome   = chrome !== undefined ? chrome   : null;


	this.chrome   = chrome;
	this.settings = settings;

};


Storage.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Storage' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {
			return new Storage(data);
		}

	}


	return null;

};


Storage.prototype = {

	[Symbol.toStringTag]: 'Storage',

	toJSON: function() {

		return {
			'type': 'Storage',
			'data': this.settings
		};

	},

	read: function(callback) {

		callback = isFunction(callback) ? callback : () => {};


		if (this.chrome !== null) {

			this.chrome.storage.local.get('stealthify', (blob) => {

				let data = blob['stealthify'] || null;

				if (isObject(data) === true) {

					if (isBoolean(data.debug) === true) {
						this.settings.debug = data.debug;
					}

					if (isString(data.host) === true) {
						this.settings.host = data.host;
					}

					if (isArray(data.modes) === true) {
						this.settings.modes = data.modes;
					}

					if (isArray(data.powers) === true) {
						this.settings.powers = data.powers;
					}

				}

				callback(true);

			});

		} else {

			callback(false);

		}

	},

	save: function(callback) {

		callback = isFunction(callback) ? callback : () => {};


		if (this.chrome !== null) {

			this.chrome.storage.local.set({
				'stealthify': this.settings
			}, () => {

				callback(true);

			});

		} else {

			callback(false);

		}

	}

};


export { Storage };

