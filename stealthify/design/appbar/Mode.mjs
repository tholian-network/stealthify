
import { Element           } from '../Element.mjs';
import { Widget            } from '../Widget.mjs';
import { isArray, isObject } from '../../extern/base.mjs';



const Mode = function(stealthify, actions) {

	this.actions = isArray(actions) ? actions : [ 'remove', 'save' ];
	this.element = new Element('stealthify-appbar-mode', [
		'<button title="Allow/Disallow Text" data-key="mode.text" data-val="false"></button>',
		'<button title="Allow/Disallow Image" data-key="mode.image" data-val="false"></button>',
		'<button title="Allow/Disallow Audio" data-key="mode.audio" data-val="false"></button>',
		'<button title="Allow/Disallow Video" data-key="mode.video" data-val="false"></button>',
		'<button title="Allow/Disallow Other" data-key="mode.other" data-val="false"></button>',
		'<span data-key="domain"></span>'
	]);

	this.model = {
		domain: this.element.query('[data-key="domain"]'),
		mode: {
			text:  this.element.query('[data-key="mode.text"]'),
			image: this.element.query('[data-key="mode.image"]'),
			audio: this.element.query('[data-key="mode.audio"]'),
			video: this.element.query('[data-key="mode.video"]'),
			other: this.element.query('[data-key="mode.other"]')
		}
	};

	Widget.call(this);


	this.element.on('contextmenu', (e) => {

		e.preventDefault();
		e.stopPropagation();

	});


	Object.values(this.model.mode).forEach((button) => {

		button.on('click', () => {

			let val = button.value();
			if (val === true) {
				button.value(false);
			} else if (val === false) {
				button.value(true);
			}

			let mode = this.value();
			if (mode !== null) {
				stealthify.setMode(mode);
			}

		});

	});

};


Mode.from = function(value, actions) {

	value   = isObject(value)  ? value   : null;
	actions = isArray(actions) ? actions : null;


	let widget = null;

	if (value !== null) {

		widget = new Mode(window.STEALTHIFY || null, actions);
		widget.value(value);

	}

	return widget;

};


Mode.prototype = Object.assign({}, Widget.prototype);


export { Mode };

