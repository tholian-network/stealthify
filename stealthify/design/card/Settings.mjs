
import { Element                                } from '../Element.mjs';
import { Widget                                 } from '../Widget.mjs';
import { isArray, isBoolean, isObject, isString } from '../../extern/base.mjs';
import { IP                                     } from '../../source/parser/IP.mjs';
import { URL                                    } from '../../source/parser/URL.mjs';



const Settings = function(stealthify, actions) {

	let uid = Date.now();

	this.actions = isArray(actions) ? actions : [ 'save' ];
	this.element = new Element('stealthify-card-settings', [
		'<h3>Stealthify Settings</h3>',
		'<button title="Toggle visibility of this Card" data-action="toggle"></button>',
		'<stealthify-card-settings-article>',
		'<h4>Theme</h4>',
		'<p>Stealthify can adapt the User Interface.</p>',
		'<ul>',
		'<li>',
		'<input id="stealthify-card-settings-theme-' + uid + '-1" name="theme" type="radio" value="dark">',
		'<label for="stealthify-card-settings-theme-' + uid + '-1">Use dark theme.</label>',
		'</li>',
		'<li>',
		'<input id="stealthify-card-settings-theme-' + uid + '-2" name="theme" type="radio" value="light">',
		'<label for="stealthify-card-settings-theme-' + uid + '-2">Use light theme.</label>',
		'</li>',
		'</ul>',
		'<h4>Debug</h4>',
		'<p>Stealthify can show more Debug Messages in case things aren\'t working as expected.</p>',
		'<ul>',
		'<li>',
		'<input id="stealthify-card-settings-debug-' + uid + '-1" name="debug" type="radio" value="false">',
		'<label for="stealthify-card-settings-debug-' + uid + '-1">Disable debug messages.</label>',
		'</li>',
		'<li>',
		'<input id="stealthify-card-settings-debug-' + uid + '-2" name="debug" type="radio" value="true">',
		'<label for="stealthify-card-settings-debug-' + uid + '-2">Enable debug messages.</label>',
		'</li>',
		'</ul>',
		'<h4>Host</h4>',
		'<p>Stealthify can use a Stealth Service via a hostname which should be in the local network.</p>',
		'<input name="host" type="text" value="localhost">',
		'<h4>Enforce Optimizers</h4>',
		'<p>Stealthify can enforce Optimizers in order to filter out malicious code in HTML and CSS files.</p>',
		'<ul>',
		'<li>',
		'<input id="stealthify-card-settings-enforce-' + uid + '-1" name="enforce" type="radio" value="true">',
		'<label for="stealthify-card-settings-enforce-' + uid + '-1">Enforce optimizers.</label>',
		'</li>',
		'<li>',
		'<input id="stealthify-card-settings-enforce-' + uid + '-2" name="enforce" type="radio" value="false">',
		'<label for="stealthify-card-settings-enforce-' + uid + '-2">Disable optimizers.</label>',
		'</li>',
		'</ul>',
		'</stealthify-card-settings-article>',
		'<stealthify-card-settings-footer>',
		'<button title="Save" data-action="save"></button>',
		'</stealthify-card-settings-footer>'
	]);

	this.buttons = {
		save:   this.element.query('button[data-action="save"]'),
		toggle: this.element.query('button[data-action="toggle"]')
	};

	this.model = {
		debug:   this.element.query('input[name="debug"]'),
		enforce: this.element.query('input[name="enforce"]'),
		host:    this.element.query('input[name="host"]'),
		theme:   this.element.query('input[name="theme"]')
	};

	Widget.call(this);


	this.model.host.on('keyup', () => {

		let value = this.model.host.value();
		if (value.endsWith('.') === false) {

			let check_ip  = IP.parse(value);
			let check_url = URL.parse(value);

			if (IP.isIP(check_ip) === true) {
				this.model.host.state('');
			} else if (URL.toDomain(check_url) === value) {
				this.model.host.state('');
			} else if (URL.toHost(check_url) === value && value.includes('.') === false) {
				this.model.host.state('');
			} else {
				this.model.host.state('invalid');
			}

		} else {
			this.model.host.state('invalid');
		}

	});


	this.element.on('show', () => {

		this.element.state('active');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('active');
		}

	});

	this.element.on('hide', () => {

		this.element.state('');

		if (this.buttons.toggle !== null) {
			this.buttons.toggle.state('');
		}

	});

	this.element.on('update', () => {

		this.buttons.save.erase();


		if (this.actions.includes('save') === true) {

			Object.values(this.model.theme).forEach((input) => {
				input.state('enabled');
			});

			Object.values(this.model.debug).forEach((input) => {
				input.state('enabled');
			});

			this.model.host.state('enabled');

		} else {

			Object.values(this.model.theme).forEach((input) => {
				input.state('disabled');
			});

			Object.values(this.model.debug).forEach((input) => {
				input.state('disabled');
			});

			this.model.host.state('disabled');

		}


		let footer = this.element.query('stealthify-card-settings-footer');

		if (this.actions.includes('save') === true) {
			this.buttons.save.render(footer);
		}

	});


	if (this.buttons.save !== null) {

		this.buttons.save.on('click', () => {

			let value = this.value();

			if (isString(value.theme) === true) {
				stealthify.settings.theme = value.theme;
			}

			if (isBoolean(value.debug) === true) {
				stealthify.settings.debug = value.debug;
			}

			if (isString(value.host) === true) {

				let check_ip  = IP.parse(value.host);
				let check_url = URL.parse(value.host);

				if (IP.isIP(check_ip) === true) {
					stealthify.settings.host = value.host;
				} else if (URL.toDomain(check_url) === value.host) {
					stealthify.settings.host = value.host;
				} else if (URL.toHost(check_url) === value.host) {
					stealthify.settings.host = value.host;
				}

			}

			stealthify.storage.save(() => {
				this.emit('save');
			});

		});

	}

	if (this.buttons.toggle !== null) {

		this.buttons.toggle.on('click', () => {

			if (this.element.state() === 'active') {
				this.element.emit('hide');
			} else {
				this.element.emit('show');
			}

		});

	}

	this.element.emit('update');

};


Settings.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Settings(window.STEALTHIFY || null, actions);
		widget.value(value);

	}

	return widget;

};


Settings.prototype = Object.assign({}, Widget.prototype);


export { Settings };

