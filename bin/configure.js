#!/usr/bin/env node

const _fs   = require('fs');
const _ROOT = process.argv[1].split('/').slice(0, -2).join('/');


(function() {

	/*
	 * HELPERS
	 */

	const _generate_index = function(meta, maps) {

		let index  = _fs.readFileSync(_ROOT + '/index.html');
		let buffer = index.toString('utf8').split('\n');

		let i1 = buffer.findIndex(line => line.trim() === '<header>');
		let i2 = buffer.findIndex(line => line.trim() === '</header>', i1);
		if (i1 !== -1 && i2 !== -1) {

			let tmp = '';

			tmp += buffer.slice(0, i1 + 1).join('\n') + '\n';
			tmp += maps.map(path => path.split('/').pop()).map(id => '\t\t\t<button onclick="load(\'' + id + '\');">' + id + '</button>').join('\n') + '\n';
			tmp += '\t\t\t<button onclick="save();">Save</button>\n';
			tmp += buffer.slice(i2).join('\n');

			_fs.writeFileSync(_ROOT + '/index.html', tmp);

		}

	};

	const _generate_meta = function(meta, maps) {

		maps.forEach(path => {

			let id   = path.split('/').pop();
			let data = null;

			try {
				let buf = _fs.readFileSync(path + '/meta.json');
				data = JSON.parse(buf.toString('utf8'));
			} catch (err) {
				data = null;
			}

			let lat = data.center[0] || 0;
			let lng = data.center[1] || 0;
			let bbox = {
				min: [ lat - 0.15, lng - 0.15 ],
				max: [ lat + 0.15, lng + 0.15 ]
			};

			meta[id] = {
				id:     id,
				path:   path.substr(_ROOT.length),
				center: data.center || [ 0,  0  ],
				zoom:   data.zoom   || [ 15, 16 ],
				bbox:   bbox
			};

		});

		_fs.writeFileSync(_ROOT + '/index.json', JSON.stringify(meta, null, '\t'));

	};

	const _generate_wifi = function(meta, csvs) {

		csvs.forEach(csv => {

			_parse_wigle_csv(csv, dataset => {

				for (let id in meta) {

					let bbox = meta[id].bbox;
					let path = meta[id].path + '/wifi.json';
					let data = dataset.filter(entry => {

						let pos = entry.position;
						if (
							pos[0] >= bbox.min[0]
							&& pos[0] <= bbox.max[0]
							&& pos[1] >= bbox.min[1]
							&& pos[1] <= bbox.max[1]
						) {
							return true;
						}

						return false;

					});


					_fs.writeFileSync(_ROOT + '/' + path, JSON.stringify(data, null, '\t'));

				}

			});

		});

	};

	const _parse_wigle_csv = function(csv, callback) {

		let buffer = _fs.readFileSync(csv).toString('utf8').split('\n').slice(1);
		if (buffer.length > 0) {

			let dataset = [];
			let macs    = {};

			buffer.forEach(line => {

				let tmp = line.split(',');
				if (tmp.length === 11) {

					let ssi = parseFloat(tmp[5], 10);
					let lat = parseFloat(tmp[6], 10);
					let lng = parseFloat(tmp[7], 10);
					let alt = parseFloat(tmp[8], 10);
					let acc = parseFloat(tmp[9], 10);

					let entry = {
						mac:      tmp[0],
						ssid:     tmp[1],
						authmode: tmp[2],
						channel:  tmp[4],
						rssi:     ssi,
						position: [ lat, lng, alt ],
						accuracy: acc,
						type:     tmp[10]
					};


					let cache = macs[entry.mac];
					if (cache === undefined && entry.type === 'WIFI') {

						dataset.push(entry);
						macs[entry.mac] = entry;

					} else if (cache !== undefined) {

						if (entry.accuracy <= cache.accuracy) {

							if (entry.rssi < 0 && cache.rssi < 0) {

								if (entry.rssi >= cache.rssi) {

									cache.rssi        = entry.rssi;
									cache.position[0] = entry.position[0];
									cache.position[1] = entry.position[1];
									cache.position[2] = entry.position[2];

								}

							}

						}

					}

				}

			});


			if (typeof callback === 'function') {
				callback(dataset);
			}

		}

	};



	/*
	 * IMPORTS
	 */

	const DATASET = {
		maps: [],
		csvs: []
	};

	_fs.readdir(_ROOT + '/map', (err, names) => {

		names.sort().forEach(name => {

			if (name.startsWith('WigleWifi')) {

				if (name.endsWith('.csv')) {
					DATASET.csvs.push(_ROOT + '/map/' + name);
				}

			} else {

				_fs.exists(_ROOT + '/map/' + name + '/Manifest.txt', result1 => {

					_fs.exists(_ROOT + '/map/' + name + '/meta.json', result2 => {

						if (result1 === true && result2 === true) {
							DATASET.maps.push(_ROOT + '/map/' + name);
						}

					});

				});

			}

		});

	});


	setTimeout(_ => {

		let meta = {};
		let maps = DATASET.maps;
		if (maps.length > 0) {
			_generate_index(meta, maps);
			_generate_meta(meta, maps);
		}


		let csvs = DATASET.csvs;
		if (csvs.length > 0) {
			_generate_wifi(meta, csvs);
		}

	}, 500);

})();

