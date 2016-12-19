var configValues = require('./config.json')

module.exports = {
	getDbConnectionString: function() {
		var test;
		test = 'mongodb://' + configValues.uname + ':' + configValues.pwd + '@ds127878.mlab.com:27878/evoppi';
		//console.log(test);
		//return 'mongodb://' + configValues.uname + ':' + configValues.pwd + '@ds127878.mlab.com:27878/evoppi';
		return test;
	}
	//mongodb://<dbuser>:<dbpassword>@ds127878.mlab.com:27878/evoppi
}