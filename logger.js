const fs = require('fs');

const logger = args => {

	const { path, msg, port, pid, clientIp, method, protocol, requestTime, destination, url, userAgent, response } = args;

	const log = `[${msg === undefined ? '-' : msg}] [${port === undefined ? '-' : port}] [${pid === undefined ? '-' : pid}] [${clientIp === undefined ? '-' : clientIp}] [${method === undefined ? '-' : method}] [HTTP/${protocol === undefined ? '-' : protocol}] [${requestTime === undefined ? '-' : requestTime}] [${destination === undefined ? '-' : destination}] [${url === undefined ? '-' : url}] [${userAgent === undefined ? '-' : userAgent}] [${response === undefined ? '-' : response}]\n`;


	fs.appendFile(path, log, err => {
		if(err){
			fs.appendFile(`${__dirname}/logs/system.log`, err, error => {
				console.log(error);
			});
		}
	});

};

module.exports = logger;
