const hostnames = require('./include.js');


const configTest = () => {	
	if(hostnames.length !== 0){
		let errors = [];

		for(let i of hostnames){
			if(!i.serverName || !i.root || !i.indexFile || !i.errorPages || !i.errorPages.error404 || !i.logs || !i.logs.accessLog || !i.logs.errorLog){
				errors.push(i);
			}
		}

		if(errors.length > 0){
			console.error(`Missing required properties in ${errors.length} config files: \n${JSON.stringify(errors)}
				EXPECTED: 
					serverName: 'yourdomain.tld',
					root: '/path/to/root/directory',
					indexFile: 'index.html',
					errorPages: {
						error404: '/path/to/error/page',
					},
					logs: {
						accessLog: '/path/to/logfiles',
						errorLog: '/path/to/logfiles',
					},
			`);
			process.exit();
		} else {
			console.log('Config-test OK');
		  }


	} else {
	    console.log('Config-test OK, no config to test');
	}
}


module.exports = configTest;

configTest();
