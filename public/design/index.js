
(function(global) {

	const RENDERER = L.canvas();
	const MAP      = L.map('map', {
		renderer: RENDERER
	});
	const META    = {};
	const LAYERS  = {};
	const FILTERS = {
		UPC: {
			state: true,
			check: entry => entry.ssid.startsWith('UPC')
		}
	};


	const header = global.document.querySelector('header');

	// TODO: Migrate <header> and <button> mess to this here


	global.load = function(id) {

		let meta = META[id] || null;
		if (meta !== null) {
			MAP.setView(meta.center, meta.zoom[0]);
		}


		let layer = LAYERS[id] || null;
		if (layer !== null) {

			for (let id in LAYERS) {

				let other = LAYERS[id];
				if (other === layer) {
					other.addTo(MAP);
				} else {
					other.removeFrom(MAP);
				}

			}

		} else if (meta !== null) {

			let layer = L.tileLayer('map/' + id + '/{z}/{x}/{y}.png', {
				minZoom: meta.zoom[0],
				maxZoom: meta.zoom[1]
			});

			LAYERS[id] = layer;
			layer.addTo(MAP);


			fetch('./map/' + id + '/wifi.json').then(raw => raw.json()).then(wifis => {

				wifis.filter(wifi => {

					let result = false;

					for (let id in FILTERS) {

						let state = FILTERS[id].state;
						if (state === true) {

							if (result === false) {
								result = FILTERS[id].check(wifi);
							}

						}

					}

					return result;

				}).forEach(wifi => {

					let circle = L.circle({
						lat: wifi.position[0],
						lng: wifi.position[1]
					}, {
						radius:   wifi.accuracy / 2,
						renderer: RENDERER
					});

					circle.addTo(MAP);
					circle.bindPopup('SSID: ' + wifi.ssid);

				});

			});


		}


	};


	global.addEventListener('DOMContentLoaded', _ => {

		fetch('./meta.json').then(raw => raw.json()).then(data => {

			for (let id in data) {
				META[id] = data[id];
			}

		});

	}, true);

	global.META = META;

})(typeof window !== 'undefined' ? window : this);


// document.addEventListener('DOMContentLoaded', _ => {
//
// 	map.on('locationfound', event => {
//
// 		let radius = event.accuracy / 2;
// 		let marker = L.marker({
// 			lat: event.latitude,
// 			lng: event.longitude
// 		});
// 		let circle = L.circle({
// 			lat: event.latitude,
// 			lng: event.longitude
// 		}, radius);
//
// 		marker.addTo(map);
// 		circle.addTo(map);
//
// 		marker.bindPopup('You are within ' + radius + 'm from this point');
// 		marker.openPopup();
//
// 		map.setView(MAP.center);
//
// 	});
//
// 	map.locate({
// 		setView: false,
// 		maxZoom: 15
// 	});
//
// }, true);

