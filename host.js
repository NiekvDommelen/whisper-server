const WebSocket = require('ws');
const http = require('http');

var host = "";
var server = http.createServer();

server.listen(8080, host, function () {});

const wss = new WebSocket.Server({ httpServer: server, port: 3001 });

wss.on("connection", (ws, req) => {

    var client_adress = ws._socket.remoteAddress;
    var client_port = ws._socket.remotePort;    


    ws.on("message", (message) => {
    
        data = JSON.parse(message.toString());
        data["timestamp"] = new Date().getTime();
        

        if(data["status"] == "connecting"){
            clients[data["userid"]] = ws;
            return;
        }


        data["sender"] = Object.keys(clients).find(key => clients[key] === ws);

        let messageData = JSON.stringify({"message": data["message"], "timestamp": data["timestamp"], "sender": data["sender"]});
        
    });

    ws.on("close", () => {
        clients[data["userid"]] = null;
    });

});