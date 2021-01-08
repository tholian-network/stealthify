
import { isArray, isBoolean, isFunction, isObject, isString } from '../extern/base.mjs';
import { isStealthify                                       } from '../source/Stealthify.mjs';



export const isStorage = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Storage]';
};



const Storage = function(settings, stealthify, chrome) {

	settings   = isObject(settings)       ? settings   : {};
	stealthify = isStealthify(stealthify) ? stealthify : null;
	chrome     = chrome !== undefined     ? chrome     : null;


	this.chrome     = chrome;
	this.settings   = settings;
	this.stealthify = stealthify;

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

						if (this.stealthify !== null) {
							this.stealthify.client.settings.host = this.settings.host;
						}

					}

					if (isArray(data.modes) === true) {
						this.settings.modes = data.modes;
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

