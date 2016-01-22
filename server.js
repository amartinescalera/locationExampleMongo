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
		provider: {
			auth: 'http://localhost:3000/auth',
			token: 'http://localhost:3000/token'
		},
		password: 'cookie_encryption_password',
		clientId: '679382918863071',
		clientSecret: 'beed24cb3bb2ef982f905c25c4a67785',
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