
import { Stealthify } from '../source/Stealthify.mjs';



let stealthify = new Stealthify(null, chrome);

setTimeout(() => {

	stealthify.storage.read((result) => {

		if (result === true) {
			stealthify.connect();
		}

	});

}, 0);

window.STEALTHIFY = stealthify;

