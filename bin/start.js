const http = require('http');
const https = require('https');

const fs = require('fs');

let host = process.argv[2] || 'google.com';
let port = process.argv[3] || 8080;

let key, cert;
try {
  key = fs.readFileSync('./ssl/ssl.key');
  cert = fs.readFileSync('./ssl/ssl.crt');
}
catch {
  console.log('No SSL key and/or certificate provided, using HTTP instead');
}

let protocol = http;
let options = {};
if (key) {
  if (cert) {
    protocol = https;
    options = {
      key: key,
      cert: cert,
    };
  }
}

protocol.createServer(options, (request, response) => {
  Object.entries(request.headers).forEach((header) => {
    let key = header[0];
    if (key.toUpperCase() == 'IF-NONE-MATCH') {
      delete request.headers[key];
    } else if (key.toUpperCase() == 'HOST') {
      // request.headers[key] = host;
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

    protocol.request(options, (res) => {
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