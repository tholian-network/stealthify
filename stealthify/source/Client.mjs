
import { console, Buffer, Emitter, isFunction, isObject, isString } from '../extern/base.mjs';
import { ENVIRONMENT                                              } from './ENVIRONMENT.mjs';
import { Mode                                                     } from './client/Mode.mjs';
import { Settings                                                 } from './client/Settings.mjs';
import { URL                                                      } from './parser/URL.mjs';



const isEvent = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Event]';
};

const isErrorEvent = function(obj) {
	return Object.prototype.toString.call(obj) === '[object ErrorEvent]';
};

const isStealthify = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Stealthify]';
};

export const isClient = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Client]';
};

const receive = function(data) {

	let response = null;

	if (isString(data) === true) {

		try {
			response = JSON.parse(data);
		} catch (err) {
			response = null;
		}

	}

	return response;

};

const send = function(socket, request) {

	let data = null;

	try {
		data = JSON.stringify(request, null, '\t');
	} catch (err) {
		data = null;
	}

	if (data !== null) {

		let result = false;

		try {
			socket.send(data);
			result = true;
		} catch (err) {
			result = false;
		}

		return result;

	}


	return false;

};



const Client = function(settings, stealthify) {

	stealthify = isStealthify(stealthify) ? stealthify : null;


	this._settings = Object.freeze(Object.assign({
		host: null
	}, settings));


	this.address    = null;
	this.browser    = null; // API compatibility
	this.services   = {};
	this.stealth    = null; // API compatibility
	this.stealthify = stealthify;
	this.url        = null;


	this.__state = {
		connected: false,
		socket:    null
	};


	this.services['mode']     = new Mode(this);
	this.services['settings'] = new Settings(this);


	Emitter.call(this);

};


Client.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Client',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			browser:  null,
			events:   blob.data.events,
			journal:  blob.data.journal,
			settings: Object.assign({}, this._settings),
			services: {},
			state:    {
				connected:  false,
				connection: null
			},
			stealth:  null,
			url:      URL.render(this.url)
		};

		Object.keys(this.services).forEach((service) => {
			data.services[service] = this.services[service].toJSON();
		});

		if (this.__state.connected === true) {
			data.state.connected = true;
		}

		if (this.__state.socket !== null) {
			data.state.connection = {
				'type': 'Connection',
				'data': {
					local:  this.__state.socket[Symbol.for('local')]  || null,
					remote: this.__state.socket[Symbol.for('remote')] || null
				}
			};
		}

		return {
			'type': 'Client',
			'data': data
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			let host  = isString(this._settings.host) ? this._settings.host : ENVIRONMENT.hostname;
			let url   = URL.parse('ws://' + host + ':65432');
			let hosts = url.hosts.sort((a, b) => {

				if (a.scope === 'private' && b.scope === 'private') {

					if (a.type === 'v4' && b.type === 'v4') return 0;
					if (a.type === 'v4') return -1;
					if (b.type === 'v4') return  1;

				}

				if (a.scope === 'private') return -1;
				if (b.scope === 'private') return  1;

				if (a.type === 'v4' && b.type === 'v4') return 0;
				if (a.type === 'v4') return -1;
				if (b.type === 'v4') return  1;

				return 0;

			});


			if (host !== ENVIRONMENT.hostname) {

				let check = hosts.find((ip) => ip.scope === 'private') || null;
				if (check === null) {

					if (ENVIRONMENT.secure === true) {
						url = URL.parse('wss://' + ENVIRONMENT.hostname + ':65432');
					} else {
						url = URL.parse('ws://' + ENVIRONMENT.hostname + ':65432');
					}

				}

			}


			let server = null;

			if (url.domain !== null) {

				if (url.subdomain !== null) {
					server = url.subdomain + '.' + url.domain;
				} else {
					server = url.domain;
				}

			} else if (url.host !== null) {
				server = url.host;
			}


			this.url = url;


			let socket = null;

			try {
				socket = new WebSocket(url.protocol + '://' + server + ':' + url.port, [ 'stealth' ]);
			} catch (err) {
				socket = null;
			}


			if (socket !== null) {

				socket[Symbol.for('local')]  = ENVIRONMENT.hostname;
				socket[Symbol.for('remote')] = server;

				socket.onmessage = (e) => {

					let response = receive(e.data);
					if (response !== null) {

						// Special case: Deserialize Buffer instances
						if (isObject(response.payload) === true) {

							let tmp_headers = response.payload.headers || null;
							let tmp_payload = response.payload.payload || null;

							if (tmp_headers !== null && tmp_payload !== null) {

								if (tmp_payload.type === 'Buffer') {
									response.payload.payload = Buffer.from(tmp_payload.data);
								}

							}

						}


						let event   = response.headers.event   || null;
						let service = response.headers.service || null;
						let method  = response.headers.method  || null;

						if (service !== null && event !== null) {

							let instance = this.services[service] || null;
							if (instance !== null && instance.has(event) === true) {

								let request = instance.emit(event, [ response.payload ]);
								if (request !== null) {
									send(socket, request);
								}

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {
									send(socket, request);
								}

							}

						} else if (service !== null && method !== null) {

							let instance = this.services[service] || null;
							if (instance !== null && isFunction(instance[method]) === true) {

								instance[method](response.payload, (request) => {

									if (request !== null) {
										send(socket, request);
									}

								});

							} else {

								let request = this.emit('response', [ response ]);
								if (request !== null) {
									send(socket, request);
								}

							}

						}

					}

				};

				socket.onclose = () => {
					this.disconnect();
				};

				socket.ontimeout = () => {
					this.disconnect();
				};

				socket.onerror = (event) => {

					if (isErrorEvent(event) === true) {

						console.error('Client: Socket Error');
						console.error(event.error);

						this.__state.connected = false;
						this.__state.socket    = null;

						this.emit('disconnect');

					} else if (isEvent(event) === true) {

						this.__state.connected = false;
						this.__state.socket    = null;

						this.emit('disconnect');

					} else {

						let result = this.disconnect();
						if (result === false) {
							this.emit('disconnect');
						}

					}

				};

				socket.onopen = () => {

					this.__state.connected = true;
					this.__state.socket    = socket;

					this.emit('connect');

				};

				return true;

			}

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			let socket = this.__state.socket || null;
			if (socket !== null) {
				socket.close();
			}

			this.__state.connected = false;
			this.__state.socket    = null;

			this.emit('disconnect');

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

	send: function(data) {

		data = isObject(data) ? data : null;


		if (data !== null) {

			let socket = this.__state.socket;
			if (socket !== null) {
				return send(socket, data);
			}

		}


		return false;

	}

});


export { Client };

