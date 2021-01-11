
import { Emitter, isNumber, isObject } from '../extern/base.mjs';
import { isStealthify                } from '../source/Stealthify.mjs';
import { URL                         } from '../source/parser/URL.mjs';



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

	this.__state.listeners['request'] = (details) => {

		let tab = null;

		if (isNumber(details.tabId) === true) {
			tab = this.stealthify.getTab('chrome-' + details.tabId);
		}


		let host = this.stealthify.settings.host;
		let url  = URL.parse(details.url);
		let mime = url.mime;
		let mode = this.stealthify.getMode(url.link);

		if (isProxied(host, url) === false) {

			let allowed = mode.mode[mime.type] === true;

			if (mime.format === 'application/javascript') {
				allowed = false;
			}

			if (allowed === true) {

				return {
					redirectUrl: 'http://' + host + ':65432/stealth/' + URL.render(url)
				};

			} else {

				let type = details.type || null;
				if (type === 'main_frame') {

					let check = tab.modes.find((m) => m.domain === mode.domain) || null;
					if (check === null) {
						tab.modes.push(mode);
					}

				} else {

					console.info('Blocked "' + mime.type + '" for URL "' + URL.render(url) + '".');

				}

				return {
					cancel: true
				};

			}

		} else {

			let allowed = true;

			if (mime.format === 'application/javascript') {
				allowed = false;
			}

			if (allowed === false) {

				return {
					cancel: true
				};

			}

		}

	};

	this.__state.listeners['filter-request-headers'] = (details) => {

		filter.call(details.requestHeaders, 'a-im');
		filter.call(details.requestHeaders, 'accept-charset');
		filter.call(details.requestHeaders, 'accept-datetime');
		filter.call(details.requestHeaders, 'cache-control');
		filter.call(details.requestHeaders, 'cookie');
		filter.call(details.requestHeaders, 'from');
		filter.call(details.requestHeaders, 'http2-settings');
		filter.call(details.requestHeaders, 'host');
		filter.call(details.requestHeaders, 'if-match');
		filter.call(details.requestHeaders, 'if-modified-since');
		filter.call(details.requestHeaders, 'if-none-match');
		filter.call(details.requestHeaders, 'if-range');
		filter.call(details.requestHeaders, 'if-unmodified-since');
		filter.call(details.requestHeaders, 'max-forwards');
		filter.call(details.requestHeaders, 'origin');
		filter.call(details.requestHeaders, 'pragma');
		filter.call(details.requestHeaders, 'proxy-authorization');
		filter.call(details.requestHeaders, 'referer');
		filter.call(details.requestHeaders, 'user-agent');
		filter.call(details.requestHeaders, 'upgrade');
		filter.call(details.requestHeaders, 'via');
		filter.call(details.requestHeaders, 'warning');


		let host   = this.stealthify.settings.host;
		let link   = details.url;
		let prefix = 'http://' + host + ':65432';

		if (link.startsWith(prefix) === true) {

			let path = link.substr(prefix.length);
			if (path.startsWith('/stealth/') === true) {

				let url = URL.parse(path.split('/').slice(3).join('/'));
				if (URL.toDomain(url) !== null) {

					let host_header = null;

					if (URL.toDomain(url) !== null) {
						host_header = URL.toDomain(url) + ':' + url.port;
					} else if (URL.toHost(url) !== null) {
						host_header = URL.toHost(url) + ':' + url.port;
					}

					if (host_header !== null) {

						details.requestHeaders.push({
							name:  'host',
							value: URL.toDomain(url) || URL.toHost(url)
						});

					}


					details.requestHeaders.push({
						name:  'origin',
						value: URL.render(url)
					});

				}

			}

		}


		return {
			requestHeaders: details.requestHeaders
		};

	};

	this.__state.listeners['filter-response-headers'] = (details) => {

		filter.call(details.responseHeaders, 'age');
		filter.call(details.responseHeaders, 'allow');
		filter.call(details.responseHeaders, 'alt-svc');
		filter.call(details.responseHeaders, 'cache-control');
		filter.call(details.responseHeaders, 'content-location');
		filter.call(details.responseHeaders, 'delta-base');
		filter.call(details.responseHeaders, 'etag');
		filter.call(details.responseHeaders, 'expires');
		filter.call(details.responseHeaders, 'im');
		filter.call(details.responseHeaders, 'last-modified');
		filter.call(details.responseHeaders, 'link');
		filter.call(details.responseHeaders, 'p3p');
		filter.call(details.responseHeaders, 'pragma');
		filter.call(details.responseHeaders, 'proxy-authenticate');
		filter.call(details.responseHeaders, 'public-key-pins');
		filter.call(details.responseHeaders, 'retry-after');
		filter.call(details.responseHeaders, 'server');
		filter.call(details.responseHeaders, 'set-cookie');
		filter.call(details.responseHeaders, 'strict-transport-security');
		filter.call(details.responseHeaders, 'upgrade');
		filter.call(details.responseHeaders, 'vary');
		filter.call(details.responseHeaders, 'via');
		filter.call(details.responseHeaders, 'warning');
		filter.call(details.responseHeaders, 'www-authenticate');
		filter.call(details.responseHeaders, 'x-frame-options');
		filter.call(details.responseHeaders, 'refresh');
		filter.call(details.responseHeaders, 'content-security-policy');
		filter.call(details.responseHeaders, 'timing-allow-origin');
		filter.call(details.responseHeaders, 'x-content-security-policy');
		filter.call(details.responseHeaders, 'x-content-duration');
		filter.call(details.responseHeaders, 'x-content-type-options');
		filter.call(details.responseHeaders, 'x-correlation-id');
		filter.call(details.responseHeaders, 'x-powered-by');
		filter.call(details.responseHeaders, 'x-request-id');
		filter.call(details.responseHeaders, 'x-ua-compatible');
		filter.call(details.responseHeaders, 'x-webkit-csp');
		filter.call(details.responseHeaders, 'x-xss-protection');


		// TODO: location?
		filter.call(details.responseHeaders, 'location');


		details.responseHeaders.push({
			name:  'content-security-policy',
			value: [
				'child-src \'none\'',
				'frame-src \'none\'',
				'object-src \'none\'',
				'script-src \'none\'',
				'script-src-attr \'none\''
			].join(';')
		});

		details.responseHeaders.push({
			name:  'x-xss-protection',
			value: '1; mode=block'
		});


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

				this.chrome.webRequest.onBeforeRequest.addListener(this.__state.listeners['request'], FILTER, [ 'blocking', 'requestBody', 'extraHeaders' ]);
				this.chrome.webRequest.onBeforeSendHeaders.addListener(this.__state.listeners['filter-request-headers'], FILTER, [ 'blocking', 'requestHeaders', 'extraHeaders' ]);
				this.chrome.webRequest.onHeadersReceived.addListener(this.__state.listeners['filter-response-headers'], FILTER, [ 'blocking', 'responseHeaders', 'extraHeaders' ]);

				this.__state.connected = true;

				return true;

			}

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			this.chrome.webRequest.onBeforeRequest.removeListener(this.__state.listeners['request']);
			this.chrome.webRequest.onBeforeSendHeaders.removeListener(this.__state.listeners['filter-request-headers']);
			this.chrome.webRequest.onHeadersReceived.removeListener(this.__state.listeners['filter-response-headers']);

			this.__state.connected = false;

			return true;

		}


		return false;

	}

});


export { Interceptor };

