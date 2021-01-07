
import { Emitter, isObject } from '../extern/base.mjs';



const FILTER = {
	urls: [ 'https://*/*', 'http://*/*' ]
};

export const isInterceptor = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Interceptor]';
};



const Interceptor = function(settings, chrome) {

	settings = isObject(settings)   ? settings : {};
	chrome   = chrome !== undefined ? chrome   : null;


	this.chrome   = chrome;
	this.settings = settings;

	this.__state = {
		connected: false
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

			if (this.chrome !== null) {

				// RESPONSE API
				// { cancel: true || false } -> blocking

				// XXX: Unsure whether this is necessary
				// this.chrome.webRequest.onBeforeRequest.addListener((details) => {
				// TODO: Redirect Request to /stealth/ here?
				// 	console.log('before request', details.url);
				// }, FILTER, [ 'blocking', 'requestBody', 'extraHeaders' ]);

				this.chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
					// TODO: Potentially cancel request,
					// XXX: Redirect already applied, so details.url is http://localhost:65432/stealth/...
					console.log('send', details.url);
				}, FILTER, [ 'blocking', 'requestHeaders', 'extraHeaders' ]);

				this.chrome.webRequest.onHeadersReceived.addListener((details) => {
					// TODO: Potentially cancel response
					// XXX: Redirect already applied, so details.url is http://localhost:65432/stealth/...
					console.log('receive', details.url);
				}, FILTER, [ 'blocking', 'responseHeaders', 'extraHeaders' ]);


			}

		}


		return false;

	},

	disconnect: function() {
	}

});


export { Interceptor };

