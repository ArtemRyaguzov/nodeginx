module.exports = {
	serverName: 'example.com',
	root: `${__dirname}/../content-folders/public/example.com`,
	indexFile: 'index.html',
	errorPages: {
		error404: `${__dirname}/../content-folders/public/example.com/404.html`,
	},
	logs: {
		accessLog: `${__dirname}/../logs/example.com.access.log`,
		errorLog: `${__dirname}/../logs/example.com.error.log`,
	},
}
