
import { console, Emitter, isArray, isBoolean, isObject, isString } from '../extern/base.mjs';
import { Client                                                   } from '../source/Client.mjs';
import { Interceptor                                              } from '../source/Interceptor.mjs';
import { Storage                                                  } from '../source/Storage.mjs';
import { URL                                                      } from '../source/parser/URL.mjs';


export const isStealthify = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Stealthify]';
};

export const isMode = function(payload) {

	if (
		isObject(payload) === true
		&& (isString(payload.domain) === true || payload.domain === null)
		&& isObject(payload.mode) === true
		&& isBoolean(payload.mode.text) === true
		&& isBoolean(payload.mode.image) === true
		&& isBoolean(payload.mode.audio) === true
		&& isBoolean(payload.mode.video) === true
		&& isBoolean(payload.mode.other) === true
	) {
		return true;
	}


	return false;

};

const toMode = function(url) {

	url = URL.isURL(url) ? url : null;


	let mode = {
		domain: null,
		mode:   {
			text:  false,
			image: false,
			audio: false,
			video: false,
			other: false
		}
	};

	if (url !== null) {

		let search = URL.toDomain(url);

		if (url.protocol === 'stealth') {

			mode.domain     = search;
			mode.mode.text  = true;
			mode.mode.image = true;
			mode.mode.audio = true;
			mode.mode.video = true;
			mode.mode.other = true;

		} else if (search !== null) {

			let modes = this.settings.modes.filter((m) => URL.isDomain(m.domain, search));
			if (modes.length > 1) {

				return modes.sort((a, b) => {
					if (a.domain.length > b.domain.length) return -1;
					if (b.domain.length > a.domain.length) return  1;
					return 0;
				})[0];

			} else if (modes.length === 1) {

				return modes[0];

			} else {

				mode.domain = search;

			}

		}

	}

	return mode;

};

const on_mode_change = function(mode) {

	this.tabs.forEach((tab) => {

		let changed = false;

		tab.history.forEach((entry) => {

			if (entry.mode.domain === mode.domain) {
				entry.mode = mode;
				changed    = true;
			}

		});

		if (tab.mode.domain === mode.domain) {
			tab.mode = mode;
			changed  = true;
		}

		if (changed === true && this.tab === tab) {
			this.emit('change', [ this.tab ]);
		}

	});

};



const Stealthify = function(settings, chrome) {

	settings = isObject(settings) ? settings : {};


	this.settings = Object.assign({
		debug:  false,
		host:   'localhost',
		modes:  [],
		powers: []
	}, settings);

	this.client      = new Client({ host: this.settings.host }, this);
	this.interceptor = new Interceptor(this.settings, chrome);
	this.storage     = new Storage(this.settings, chrome);
	this.tab         = null;
	this.tabs        = [];

	this.__state = {
		connected: false,
		reconnect: 0
	};


	Emitter.call(this);


	this.client.services.settings.on('read', (response) => {

		if (isArray(response['modes']) === true) {

			this.settings['modes'] = response['modes'];

			this.settings['modes'].forEach((mode) => {
				on_mode_change.call(this, mode);
			});

		}

	});

	this.on('connect', () => {

		this.storage.read(() => {

			this.client.services.settings.read({
				modes: true
			}, () => {

				if (this.settings.debug === true) {
					console.info('Stealthify: Settings loaded from "' + this.settings.host + '".');
				}

			});

		});

	});

};


Stealthify.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Stealthify' ? json.type : null;
		let data = isObject(json.data)        ? json.data : null;

		if (type !== null && data !== null) {

			let stealthify = new Stealthify({
				debug:  isBoolean(data.debug) ? data.debug  : null,
				host:   isString(data.host)   ? data.host   : null,
				modes:  isArray(data.modes)   ? data.modes  : null,
				powers: isArray(data.powers)  ? data.powers : null
			});

			return stealthify;

		}

	}


	return null;

};


Stealthify.isMode       = isMode;
Stealthify.isStealthify = isStealthify;


Stealthify.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Stealthify',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			client:   null,
			events:   blob.data.events,
			journal:  blob.data.journal,
			settings: Object.assign({}, this.settings),
			state:    {
				connected: false,
				reconnect: 0
			}
		};

		if (this.client !== null) {
			data.client = this.client.toJSON();
		}

		if (this.__state.connected === true) {
			data.state.connected = true;
		}

		if (this.__state.reconnect > 0) {
			data.state.reconnect = this.__state.reconnect;
		}

		return {
			'type': 'Stealthify',
			'data': data
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			this.client.once('connect', () => {

				this.__state.connected = true;
				this.emit('connect');

			});

			this.client.once('disconnect', () => {

				this.client.off('connect');

				this.__state.connected = false;
				this.emit('disconnect');

			});

			let result = this.client.connect();
			if (result === true) {
				return true;
			}

		}


		return false;

	},

	destroy: function() {

		if (this.__state.connected === true) {
			return this.disconnect();
		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			this.client.disconnect();

			return true;

		}


		return false;

	},

	is: function(state) {

		state = isString(state) ? state : null;


		if (state === 'connected') {

			if (this.__state.connected === true) {
				return true;
			}

		}


		return false;

	},

	reconnect: function() {

		if (this.__state.connected === false) {

			let reconnect = this.__state.reconnect++;

			setTimeout(() => {

				if (this.__state.connected === false) {

					this.client.once('connect', () => {

						this.__state.connected = true;
						this.__state.reconnect = 0;

						this.emit('connect');

					});

					this.client.once('disconnect', () => {

						this.client.off('connect');

						this.__state.connected = false;
						this.emit('disconnect');

					});

					this.client.connect();

				}

			}, reconnect * 30000);

			return true;

		}


		return false;

	},

	getMode: function(link) {

		link = isString(link) ? link : null;


		if (link !== null) {

			let url  = URL.parse(link);
			let mode = toMode.call(this, url);
			if (mode !== null) {
				return mode;
			}

		}


		return null;

	},

	setMode: function(mode) {

		mode = isMode(mode) ? mode : null;


		if (mode !== null) {

			if (mode.domain !== null) {

				let tmp1 = toMode.call(this, URL.parse('https://' + mode.domain + '/'));
				let tmp2 = {
					domain: mode.domain,
					mode:   {
						text:  mode.mode.text,
						image: mode.mode.image,
						audio: mode.mode.audio,
						video: mode.mode.video,
						other: mode.mode.other
					}
				};


				if (tmp1.domain === tmp2.domain) {

					let diff = false;

					Object.keys(tmp1.mode).forEach((type) => {
						if (tmp1.mode[type] !== tmp2.mode[type]) {
							tmp1.mode[type] = tmp2.mode[type];
							diff = true;
						}
					});

					if (diff === true) {
						mode = tmp1;
					}

				} else if (URL.isDomain(tmp1.domain, tmp2.domain)) {

					mode = tmp2;

				} else {

					mode = null;

				}


				if (mode !== null) {

					if (this.settings.modes.includes(mode) === false) {
						this.settings.modes.push(mode);
					}

					this.client.services.mode.save(mode, () => {});
					this.storage.save(() => {});

					on_mode_change.call(this, mode);

				}

				return true;

			}

		}


		return false;

	},

	getPower: function(link) {

		// TODO: Implement getPower()

	},

	setPower: function(power) {

		// TODO: Implement setPower()
		// TODO: this.storage.save()

	}

});


export { Stealthify };

