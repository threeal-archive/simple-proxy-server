const http = require('http');

let host = process.argv[2] || 'google.com';
let port = process.argv[3] || 8080;

http.createServer((request, response) => {
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
      host: host,
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
}).listen(port);

console.log(`Starting proxy server for ${host} in port ${port}`);