
const EVENTS = [
	'abort',
	'blur',
	'cancel',
	'canplay',
	'canplaythrough',
	'change',
	'click',
	'close',
	'contextmenu',
	'cuechange',
	'dblclick',
	'durationchange',
	'ended',
	'error',
	'focus',
	'gotpointercapture',
	'input',
	'invalid',
	'keydown',
	'keypress',
	'keyup',
	'load',
	'loadedmetadata',
	'loadend',
	'loadstart',
	'lostpointercapture',
	'mousedown',
	'mouseenter',
	'mouseleave',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup',
	'pause',
	'play',
	'playing',
	'pointercancel',
	'pointerdown',
	'pointerenter',
	'pointerleave',
	'pointermove',
	'pointerout',
	'pointerover',
	'pointerup',
	'reset',
	'resize',
	'scroll',
	'select',
	'selectionchange',
	'selectstart',
	'submit',
	'touchcancel',
	'touchstart',
	'transitioncancel',
	'transitionend',
	'wheel'
];


EVENTS.forEach((event) => {

	let nodes = Array.from(document.querySelectorAll('*[on' + event + ']'));
	if (nodes.length > 0) {

		nodes.forEach((node) => {

			node.setAttribute('on' + event, null);
			node.removeAttribute('on' + event);

			node['on' + event] = null;

			setTimeout(() => {
				node.replaceWith(node.cloneNode(true));
			}, 0);

		});

	}

});


Array.from(document.querySelectorAll('a[href]')).forEach((link) => {

	let href = link.getAttribute('href');
	if (
		href.startsWith('javascript:')
		|| href === '#'
	) {
		link.setAttribute('href', null);
		link.removeAttribute('href');
		link.parentNode.removeChild(link);
	}

});

