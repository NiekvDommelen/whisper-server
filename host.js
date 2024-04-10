const WebSocket = require('ws');
const http = require('http');

var host = "";
var server = http.createServer();

server.listen(8080, host, function () {});

const wss = new WebSocket.Server({ httpServer: server, port: 3001 });
