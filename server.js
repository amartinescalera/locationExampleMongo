'use strict';
const bell 		= require('bell');
const Hapi 			= require('hapi');
const MongoClient = require('mongodb').MongoClient;
const routes 		= require('./routes');
const server 		= new Hapi.Server();

let defs = {
	port: process.env.PORT || '3000',
	localhost: process.env.SERVER || '127.0.0.1',
	mongo: process.env.MONGO || 'mongodb://127.0.0.1:27017/locationDB'
};

server.connection({
	host: defs.localhost,
	port: defs.port
});

server.register(bell, (err) => {
	if (err) {
		throw err;
	}

	server.auth.strategy('facebook', 'bell', {
		provider: 'facebook',
		password: 'password',
		clientId: 'XXXXXXXX',
		clientSecret: 'YYYYYYYYYYYYYYYYYYYY',
		location: 'http://localhost:3000',
		isSecure: false     // Terrible idea but required if not using HTTPS especially if developing locally
	});

});

MongoClient.connect(defs.mongo, function(err, db) {
	if (err) {
		console.log('Error running the database..', server.info.uri);
		throw err;
	} else {
		routes(server, db);
	}
});

server.start(() => {
	console.log('Server running at:', server.info.uri);
});

module.exports = server;