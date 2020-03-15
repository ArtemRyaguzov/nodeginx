const http = require('http');
const fs = require('fs');
const path = require('path');
const cluster = require('cluster');
const os = require('os');

const pid = process.pid;

const hostnames = require('./include.js');
const getMimeType = require('./mime-types.js');
const blackList = require('./generalIpBlackList.js');
const logger = require('./logger.js');

const port = 3001;


if(cluster.isMaster){

	const configTest = require('./config-test.js');

	logger({
          path: `${__dirname}/logs/system.log`,
          pid: pid,
          msg: `Master process is running`
    	});

	const cpuCount = os.cpus().length;

	for(let i = 0; i < cpuCount; i++){
        	cluster.fork();
    	}

	
	cluster.on('fork', (worker) => {

        	logger({
            	  path: `${__dirname}/logs/system.log`,
            	  msg: `Worker id: ${worker.id} is online`
        	});
    	});


	cluster.on('listening', (worker, address) => {

        	logger({
            	  path: `${__dirname}/logs/system.log`,
            	  msg: `Worker id: ${worker.id} is now connected to ${JSON.stringify(address)}`
        	});
    	});

	
	cluster.on('disconnect', (worker) => {

        	logger({
            	  path: `${__dirname}/logs/system.log`,
            	  msg: `Worker id: ${worker.id} has disconnected`
        	});
    	});


	cluster.on('exit', (worker) => {

       		logger({
            	  path: `${__dirname}/logs/system.log`,
            	  msg: `Worker id: ${worker.id} is dead`
        	});

        	cluster.fork();
    	});

} else {

const server = http.createServer((req, res) => {
  const reqDomain = req.headers.host.split(':')[0];
  const remoteAddress = req.socket.remoteAddress.split(':').pop();
  const date = new Date().toString();

 
  let shouldBeBlocked = false;


  if(blackList.length !== 0){
	blackList.forEach(i => {
		if(i === remoteAddress){
			shouldBeBlocked = true;
		}
	});
  }


  if(shouldBeBlocked){

	res.writeHead(403, {
                'Content-Type': 'text/plain',
                'X-Powered-By': 'NODEGINX'
        });
        res.end('403 Forbidden');

	logger({
		path: `${__dirname}/logs/access.log`,
		msg: `Request handled by Worker ID: ${cluster.worker.id}, Process ID: ${pid}`,
		clientIp: remoteAddress,
		method: req.method,
		protocol: req.httpVersion,
		requestTime: date,
		destination: req.headers.host,
		url: req.url,
		userAgent: req.headers['user-agent'],
		response: 403
	});
  } else {

        let matchedHostname = {};

	const validateHostname = str => {
		return str.split(' ')
			.filter(i => i === reqDomain)
			.toString();
	}

	for(let i of hostnames){
		const validatedHost = validateHostname(i.serverName);

        	if(validatedHost !== ''){
                	matchedHostname = {
                        	serverExactName: validatedHost,
                        	...i
                	}
        	}

	}


        if(reqDomain === matchedHostname.serverExactName){
		let shouldRedirect = false;

		if(matchedHostname.redirects !== undefined){

			matchedHostname.redirects.forEach(redirect => {
				if(redirect.from === req.url){
					shouldRedirect = true;

					res.writeHead(redirect.statusCode, {
						'Location': redirect.to,
						'X-Powered-By': 'NODEGINX'
					});
					res.end();

					logger({
					  path: matchedHostname.logs.accessLog,
					  msg: `Request handled by Worker ID: ${cluster.worker.id}, Process ID: ${pid}`,
					  clientIp: remoteAddress,
			                  method: req.method,
			                  protocol: req.httpVersion,
			                  requestTime: date,
			                  destination: req.headers.host,
			                  url: req.url,
                			  userAgent: req.headers['user-agent'],
               				  response: redirect.statusCode					  
					});
				}
			});
		}


		if(!shouldRedirect){
			const filePath = path.join(matchedHostname.root, req.url === '/' ? `/${matchedHostname.indexFile}` : req.url);
		
			const extname = path.extname(filePath);

			const contentType = getMimeType(extname);


			fs.access(filePath, err => {
				if(err) {
         		   	  if(err.code == 'ENOENT') {

                   			 	res.writeHead(200, { 
							'Content-Type': 'text/html',
							'X-Powered-By': 'NODEGINX'
					 	});

						const readStream = fs.createReadStream(matchedHostname.errorPages.error404);

						readStream.pipe(res);


						logger({
					  	  path: matchedHostname.logs.errorLog,
						  msg: `Request handled by Worker ID: ${cluster.worker.id}, Process ID: ${pid}`,
					  	  clientIp: remoteAddress,
			                  	  method: req.method,
			                          protocol: req.httpVersion,
			                  	  requestTime: date,
			                  	  destination: req.headers.host,
			                  	  url: req.url,
                			  	  userAgent: req.headers['user-agent'],
               				  	  response: matchedHostname.errorPages.error404				  
						});

				
           		   	  } else {

                			res.writeHead(500, { 'X-Powered-By': 'NODEGINX' });
                			res.end(`Server Error: ${err.code}`);

						logger({
                                                  path: matchedHostname.logs.errorLog,
						  msg: `Request handled by Worker ID: ${cluster.worker.id}, Process ID: ${pid}`,
                                                  clientIp: remoteAddress,
                                                  method: req.method,
                                                  protocol: req.httpVersion,
                                                  requestTime: date,
                                                  destination: req.headers.host,
                                                  url: req.url,
                                                  userAgent: req.headers['user-agent'],
                                                  response: err.code
                                                });
           		     	    }
       		        	} else {					

			    		res.writeHead(200, {
						'Content-Type': contentType,
                				'X-Powered-By': 'NODEGINX'
		            		});

					const readStream = fs.createReadStream(filePath);

					readStream.pipe(res);

						logger({
                                                  path: matchedHostname.logs.accessLog,
						  msg: `Request handled by Worker ID: ${cluster.worker.id}, Process ID: ${pid}`,
                                                  clientIp: remoteAddress,
                                                  method: req.method,
                                                  protocol: req.httpVersion,
                                                  requestTime: date,
                                                  destination: req.headers.host,
                                                  url: req.url,
                                                  userAgent: req.headers['user-agent'],
                                                  response: filePath
                                                });
        		  	}
			});      

		}

        } else {

	    res.writeHead(200, { 
		'Content-Type': 'text/plain',
		'X-Powered-By': 'NODEGINX'
	    });
            res.end('Default Page');


		logger({
                  path: `${__dirname}/logs/access.log`,
	          msg: `Request handled by Worker ID: ${cluster.worker.id}, Process ID: ${pid}`,	  
                  clientIp: remoteAddress,
                  method: req.method,
                  protocol: req.httpVersion,
                  requestTime: date,
                  destination: req.headers.host,
                  url: req.url,
                  userAgent: req.headers['user-agent'],
                  response: 200
                });

	  }

    }
});

server.listen(port, () => {
  logger({
	path: `${__dirname}/logs/system.log`,
	msg: `Worker ${cluster.worker.id} started server on port: ${port}, process ID: ${pid}`,
	port: port,
	pid: pid
  });
});

}



