'use strict';
const ejs 	= require('ejs');
const fs 		= require('fs-extra');

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
					var html = compiled({search : 'Search nearset Tube Station', errores: '', tubes: ''});
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
								$maxDistance: 1000,
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
									zone: tube[i].zone
								};
								tubes.push(tb);
							}
						}
						let html = compiled({search : 'Search nearset Tube Station', errores: errs.message, tubes:  tubes});
						reply(html);
					});
				}
			}
		}
	];

	server.route(routes);
};
