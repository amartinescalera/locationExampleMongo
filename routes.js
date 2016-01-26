'use strict';
const ejs 		= require('ejs');
const fs 			= require('fs-extra');
const geolib	= require('geolib');

module.exports = function(server, db) {
	let empty = {};
	var routes = [
		{
			method: 'GET',
			path: '/',
			handler: function (request, reply) {
				var compiled = ejs.compile(fs.readFileSync(__dirname + '/views/index.ejs', 'utf8'),empty);
				var html = compiled({});
				reply(html);
			}
		},
		{
			method: 'GET', // Must handle both GET and POST
			path: '/search',          // The callback endpoint registered with the provider
			config: {
				handler: function (request, reply) {
					var compiled = ejs.compile(fs.readFileSync(__dirname + '/views/search.ejs', 'utf8'),empty);
					var html = compiled({
						search : 'Search nearset Tube Station',
						errores: '',
						tubes: '',
						longitude: '',
						latitude: ''
					});
					reply(html);
				}
			}
		},
		{
			method: 'POST', // Must handle both GET and POST
			path: '/search',          // The callback endpoint registered with the provider
			config: {
				handler: function (request, reply) {
					let longitude = parseFloat(request.payload.long)  || 0;
					let latitude = parseFloat(request.payload.lati)  || 0;
					let databse = db.collection('tube');
					databse.find({
						loc:{
							$near: {
								$geometry: {
									type: "Point" ,
									coordinates: [ longitude, latitude ]
								},
								$maxDistance: 2000,
								$minDistance: 0
							}
						}
					}).toArray(function (err, tube) {
						var compiled = ejs.compile(fs.readFileSync(__dirname + '/views/search.ejs', 'utf8'),empty);
						let errs = '';
						let tubes = [];
						if (err || tube === null || tube.length === 0) {
							errs = err || new Error("Not tube station found");
						} else {
							for (let i=0; i<tube.length; i++){
								let tb = {
									name: tube[i].name,
									postcode: tube[i].postcode,
									zone: tube[i].zone,
									distance: geolib.getDistance(
										{latitude: latitude, longitude: longitude},
										{latitude: tube[i].loc.coordinates[1], longitude: tube[i].loc.coordinates[0]}
									)
								};
								tubes.push(tb);
							}
						}
						let html = compiled({
									search : 'Search nearset Tube Station',
									errores: errs.message,
									tubes:  tubes,
									longitude: longitude,
									latitude: latitude
						});
						reply(html);
					});
				}
			}
		}
	];

	server.route(routes);
};
