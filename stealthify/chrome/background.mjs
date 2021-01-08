
import { Stealthify } from '../source/Stealthify.mjs';



let stealthify = new Stealthify(null, chrome);

setTimeout(() => {

	stealthify.storage.read((result) => {

		if (result === true) {
			stealthify.connect();
		}

	});

}, 0);

window.APPBAR = {
	'1st-party': null,
	'2nd-party': null,
	'3rd-party': null
};

window.STEALTHIFY = stealthify;

