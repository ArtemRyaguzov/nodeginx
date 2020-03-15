const getMimeType = extname => {
	let contentType = 'text/plain';

	switch(extname){
		case '.html':
		  contentType = 'text/html';
		break;	
		case '.css':
      contentType = 'text/css';
    break;
		case '.js':
      contentType = 'application/javascript';
    break; 	
		case '.ico':
      contentType = 'image/x-icon';
    break;
		case '.json':
      contentType = 'application/json';
    break;
		case '.jpg':
      contentType = 'image/jpeg';
    break;
		case '.jpeg':
      contentType = 'image/jpeg';
    break;
		case '.png':
      contentType = 'image/png';
    break;
		case '.md':
      contentType = 'text/markdown';
    break;
		case '.gif':
      contentType = 'image/gif';
    break;
		case '.svg':
      contentType = 'image/svg+xml';
    break;
		case '.woff':
      contentType = 'application/font-woff';
    break;
		case '.doc':
      contentType = 'application/msword';
    break;
		case '.pdf':
      contentType = 'application/pdf';
    break;
		case '.rtf':
      contentType = 'application/rtf';
    break;
		case '.mp3':
      contentType = 'audio/mpeg';
    break;
		case '.ogg':
      contentType = 'audio/ogg';
    break;
		case '.mp4':
      contentType = 'video/mp4';
    break;
		case '.webm':
      contentType = 'video/webm';
    break;
		case '.ogm':
      contentType = 'video/ogg';
    break;
		case '.ogv':
      contentType = 'video/ogg';
    break;
		case '.csv':
      contentType = 'text/csv';
    break;
	}

	return contentType;
}

module.exports = getMimeType;

