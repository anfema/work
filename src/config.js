const Conf = require('conf');

const config = new Conf({
	defaults: {
		token: '',
		username: '',
	},
});

module.exports = config;
