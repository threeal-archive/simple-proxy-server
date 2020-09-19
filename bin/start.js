const http = require('http');

http.createServer((request, response) => {
  console.log(request.url);
  Object.entries(request.headers).forEach((header) => {
    let key = header[0];
    if (key.toUpperCase() == 'IF-NONE-MATCH') {
      delete request.headers[key];
    }
  });
  let body = [];
  request.on('error', (error) => {
    console.log(error);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    let options = {
      host: '10.122.1.201',
      path: request.url,
      method: request.method,
      headers: request.headers,
    };
    http.request(options, (res) => {
      let body = [];
      res.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        response.writeHead(res.statusCode, res.headers)
          .end(Buffer.concat(body));
      });
    }).end(Buffer.concat(body));
  });
}).listen(8080);