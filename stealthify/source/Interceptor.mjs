
import { Emitter, isObject } from '../extern/base.mjs';
import { isStealthify      } from '../source/Stealthify.mjs';
import { URL               } from '../source/parser/URL.mjs';



const FILTER = {
	urls: [ 'https://*/*', 'http://*/*' ]
};

export const isInterceptor = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Interceptor]';
};

const isProxied = function(host, url) {

	if (isObject(url) === true) {

		if (
			url.domain === host
			&& url.port === 65432
			&& url.path.startsWith('/stealth/')
		) {
			return true;
		}

	}


	return false;

};

const filter = function(name) {

	for (let i = 0; i < this.length; i++) {

		if (this[i].name.toLowerCase() === name) {
			this.splice(i, 1);
		}

	}

};



const Interceptor = function(settings, stealthify, chrome) {

	settings   = isObject(settings)       ? settings   : {};
	stealthify = isStealthify(stealthify) ? stealthify : null;
	chrome     = chrome !== undefined     ? chrome     : null;


	this.chrome     = chrome;
	this.settings   = settings;
	this.stealthify = stealthify;

	this.__state = {
		connected: false,
		listeners: {}
	};

	this.__listeners['request'] = (details) => {

		// TODO: Integrate details.tabId to stealthify.tabs[]
		// and push mode{} and power{} to its list of domains
		// console.log(details);


		let host = this.stealthify.settings.host;
		let url  = URL.parse(details.url);
		let mime = url.mime;
		let mode = this.stealthify.getMode(url.link);

		if (isProxied(host, url) === false) {

			let allowed = mode[mime.type] === true;

			if (mime.format === 'application/javascript') {

				let power = this.stealthify.getPower(url.link);
				if (power !== null) {
					allowed = power['javascript'] === true;
				} else {
					allowed = false;
				}

			}

			if (allowed === true) {

				return {
					redirectUrl: 'http://' + host + ':65432/stealth/' + URL.render(url)
				};

			} else {

				return {
					cancel: true
				};

			}

		}

	};

	this.__listeners['filter-request-headers'] = (details) => {

		let url   = URL.parse(details.url);
		let power = this.stealthify.getPower(url.link);
		if (power !== null) {

			if (power['cookie'] === false) {
				filter.call(details.requestHeaders, 'cookie');
			}

		} else {

			filter.call(details.requestHeaders, 'cookie');

		}

		return {
			requestHeaders: details.requestHeaders
		};

	};

	this.__listeners['filter-response-headers'] = (details) => {

		let url   = URL.parse(details.url);
		let power = this.stealthify.getPower(url.link);
		if (power !== null) {

			if (power['cookie'] === false) {
				filter.call(details.responseHeaders, 'set-cookie');
			}

		} else {

			filter.call(details.responseHeaders, 'set-cookie');

		}

		return {
			responseHeaders: details.responseHeaders
		};

	};


	Emitter.call(this);

};


Interceptor.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Interceptor' ? json.type : null;
		let data = isObject(json.data)         ? json.data : null;

		if (type !== null && data !== null) {
			return new Storage(data);
		}

	}


	return null;

};


Interceptor.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Interceptor',

	toJSON: function() {

		return {
			'type': 'Interceptor',
			'data': this.settings
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			if (this.chrome !== null && this.stealthify !== null) {

				this.chrome.webRequest.onBeforeRequest.addListener(this.__listeners['request'], FILTER, [ 'blocking', 'requestBody', 'extraHeaders' ]);
				this.chrome.webRequest.onBeforeSendHeaders.addListener(this.__listeners['filter-request-headers'], FILTER, [ 'blocking', 'requestHeaders', 'extraHeaders' ]);
				this.chrome.webRequest.onHeadersReceived.addListener(this.__listeners['filter-response-headers'], FILTER, [ 'blocking', 'requestHeaders', 'extraHeaders' ]);

				this.__state.connected = true;

				return true;

			}

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			this.chrome.webRequest.onBeforeRequest.removeListener(this.__listeners['request']);
			this.chrome.webRequest.onBeforeSendHeaders.removeListener(this.__listeners['filter-request-headers']);
			this.chrome.webRequest.onHeadersReceived.removeListener(this.__listeners['filter-response-headers']);

			this.__state.connected = false;

			return true;

		}


		return false;

	}

});


export { Interceptor };

