
import fs      from 'fs';
import http    from 'http';
import https   from 'https';
import url     from 'url';
import path    from 'path';
import process from 'process';

import { console             } from '../../stealth/base/source/node/console.mjs';
import { isString            } from '../../stealth/base/source/String.mjs';
import { build as build_base } from '../../stealth/base/make.mjs';



const CACHE   = {};
const DOMAINS = {};
const FILE    = url.fileURLToPath(import.meta.url);
const STEALTH = path.dirname(path.resolve(FILE, '../../')) + '/stealth';
const ROOT    = path.dirname(path.resolve(FILE, '../'));
const TARGET  = ROOT + '/stealthify';



const copy = (origin, target) => {

	let stat   = null;
	let result = false;

	try {
		stat = fs.statSync(path.resolve(origin));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			let files = [];

			try {
				files = fs.readdirSync(path.resolve(origin));
			} catch (err) {
				files = [];
			}

			if (files.length > 0) {

				let results = files.map((file) => {
					return copy(origin + '/' + file, target + '/' + file);
				});

				if (results.includes(false) === false) {
					result = true;
				} else {
					result = false;
				}

			} else {
				result = true;
			}

		} else if (stat.isFile() === true) {

			stat = null;

			try {
				stat = fs.statSync(path.dirname(target));
			} catch (err) {
				stat = null;
			}

			if (stat === null || stat.isDirectory() === false) {

				try {
					fs.mkdirSync(path.dirname(target), {
						recursive: true
					});
				} catch (err) {
					// Ignore
				}

			}

			try {
				fs.copyFileSync(path.resolve(origin), path.resolve(target));
				result = true;
			} catch (err) {
				result = false;
			}

		}

	}

	if (origin.startsWith(ROOT) === true) {
		origin = origin.substr(ROOT.length + 1);
	}

	if (target.startsWith(ROOT) === true) {
		target = target.substr(ROOT.length + 1);
	}

	if (result === true) {
		console.info('stealthify: copy("' + origin + '", "' + target + '")');
	} else {
		console.error('stealthify: copy("' + origin + '", "' + target + '")');
	}

	return result;

};

const read = (url) => {

	let buffer = null;

	try {
		buffer = fs.readFileSync(path.resolve(url));
	} catch(err) {
		buffer = null;
	}

	return buffer;

};

const remove = (url) => {

	let stat   = null;
	let result = false;

	try {
		stat = fs.statSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			try {
				fs.rmdirSync(path.resolve(url), {
					recursive: true
				});
				result = true;
			} catch (err) {
				result = false;
			}

		} else if (stat.isFile() === true) {

			try {
				fs.unlinkSync(path.resolve(url));
				result = true;
			} catch (err) {
				result = false;
			}

		}

	}

	return result;

};

const IGNORED = [
	path.resolve(ROOT + '/browser/bin'),
	path.resolve(ROOT + '/browser.mjs'),
	path.resolve(ROOT + '/browser/README.md'),
	path.resolve(ROOT + '/browser/make.mjs')
];

const walk = (url, result) => {

	if (IGNORED.includes(path.resolve(url))) {
		return result;
	}


	if (result === undefined) {
		result = [];
	}

	let stat = null;

	try {
		stat = fs.lstatSync(path.resolve(url));
	} catch (err) {
		stat = null;
	}

	if (stat !== null) {

		if (stat.isDirectory() === true) {

			let nodes = [];

			try {
				nodes = fs.readdirSync(path.resolve(url));
			} catch (err) {
				nodes = [];
			}

			if (nodes.length > 0) {

				nodes.forEach((node) => {
					walk(url + '/' + node, result);
				});

			}

		} else if (stat.isFile() === true) {

			let name = url.split('/').pop();
			if (name.startsWith('.') === false) {
				result.push(url);
			}

		}

	}

	return result;

};

const write = (url, buffer) => {

	let result = false;

	try {
		fs.writeFileSync(path.resolve(url), buffer);
		result = true;
	} catch (err) {
		result = false;
	}

	if (result === true) {
		console.info('stealthify: write("' + path.resolve(url).substr(ROOT.length + 1) + '")');
	} else {
		console.error('stealthify: write("' + path.resolve(url).substr(ROOT.length + 1) + '")');
	}

	return result;

};



export const clean = (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		CACHE[target] = false;


		let results = [];

		if (target === TARGET) {

			console.log('stealthify: clean()');

			[
				remove(target + '/extern/base.mjs'),
				remove(target + '/design/common'),
				remove(target + '/design/Element.mjs'),
				remove(target + '/design/Widget.mjs'),
				remove(target + '/source/parser/DATETIME.mjs'),
				remove(target + '/source/parser/IP.mjs'),
				remove(target + '/source/parser/UA.mjs'),
				remove(target + '/source/parser/URL.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('stealthify: clean("' + target + '")');

			[
				remove(target)
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {
			return true;
		}


		return false;

	}


	return true;

};

export const build = (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		return true;

	} else if (CACHE[target] !== true) {

		let results = [
			build_base()
		];

		if (target === TARGET) {

			console.log('stealthify: build()');

			[
				copy(STEALTH + '/base/build/browser.mjs',             target + '/extern/base.mjs'),
				copy(STEALTH + '/browser/design/common',              target + '/design/common'),
				copy(STEALTH + '/browser/design/Element.mjs',         target + '/design/Element.mjs'),
				copy(STEALTH + '/browser/design/Widget.mjs',          target + '/design/Widget.mjs'),
				copy(STEALTH + '/stealth/source/parser/DATETIME.mjs', target + '/source/parser/DATETIME.mjs'),
				copy(STEALTH + '/stealth/source/parser/IP.mjs',       target + '/source/parser/IP.mjs'),
				copy(STEALTH + '/stealth/source/parser/UA.mjs',       target + '/source/parser/UA.mjs'),
				copy(STEALTH + '/stealth/source/parser/URL.mjs',      target + '/source/parser/URL.mjs')
			].forEach((result) => results.push(result));

		} else {

			console.log('stealthify: build("' + target + '")');

			[
				copy(STEALTH + '/base/build/browser.mjs',        target + '/extern/base.mjs'),
				copy(ROOT    + '/stealthify/chrome',             target + '/chrome'),
				copy(ROOT    + '/stealthify/design',             target + '/design'),
				copy(STEALTH + '/browser/design/common',         target + '/design/common'),
				copy(STEALTH + '/browser/design/Element.mjs',    target + '/design/Element.mjs'),
				copy(STEALTH + '/browser/design/Widget.mjs',     target + '/design/Widget.mjs'),
				copy(ROOT    + '/stealthify/source',             target + '/source'),
				copy(STEALTH + '/stealth/source/parser/IP.mjs',  target + '/source/parser/IP.mjs'),
				copy(STEALTH + '/stealth/source/parser/URL.mjs', target + '/source/parser/URL.mjs'),
				copy(ROOT    + '/manifest.json',                 target + '/manifest.json')
			].forEach((result) => results.push(result));

		}


		let buffer = read(target + '/manifest.json');
		if (buffer !== null) {

			let manifest = buffer.toString('utf8');
			let files   = walk(target + '/source').map((url) => {
				return url.substr(target.length + 1);
			}).sort((a, b) => {
				if (a < b) return -1;
				if (b < a) return  1;
				return 0;
			});

			// if (files.length > 0) {

			// 	let index0 = service.indexOf('const ASSETS  = [') + 17;
			// 	let index1 = service.indexOf('];', index0);

			// 	if (index0 > 17 && index1 > 18) {
			// 		service = service.substr(0, index0) + '\n\t\'' + files.join('\',\n\t\'') + '\'\n' + service.substr(index1);
			// 	}

			// 	results.push(write(target + '/service.js', Buffer.from(service, 'utf8')));

			// }

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

		}

	}


	return false;

};



let args = process.argv.slice(1);
if (args.includes(FILE) === true) {

	let results = [];

	if (args.includes('clean')) {
		CACHE[TARGET] = true;
		results.push(clean());
	}

	if (args.includes('build')) {
		results.push(build());
	}

	if (results.length === 0) {
		CACHE[TARGET] = true;
		results.push(clean());
		results.push(build());
	}


	if (results.includes(false) === false) {
		process.exit(0);
	} else {
		process.exit(1);
	}

}

