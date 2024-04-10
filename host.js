const WebSocket = require('ws');
const http = require('http');

var clients = {};
var messages = [];

var host = "10.59.138.9";
var server = http.createServer();

server.listen(8080, host, function () {
    console.log('Listening to port:  ' + 8080);
});

const wss = new WebSocket.Server({ httpServer: server, port: 3001 });


wss.on("connection", (ws, req) => {
    ws.send("Connected to server");
    var client_adress = ws._socket.remoteAddress;
    var client_port = ws._socket.remotePort;    

    // ___DEBUG___
    console.log("___NEW CONNECTION___");
    console.log("host: " + client_adress);
    console.log("port: " + client_port);
    
    
    ws.on("message", (message) => {
    
        data = JSON.parse(message.toString());
        data["timestamp"] = new Date().getTime();
        

        if(data["status"] == "connecting"){
            console.log("___CONNECTION MSG___");
            console.log("userid: " + data["userid"]);
            console.log("status: " + data["status"]);
            console.log("timestamp: " + data["timestamp"]);
            clients[data["userid"]] = ws;
            return;
        }
        
        data["sender"] = Object.keys(clients).find(key => clients[key] === ws);

        // ___DEBUG___
        console.log("___NEW MESSAGE___");
        console.log("receiver: " + data["receiver"]);
        console.log("timestamp: " + data["timestamp"]);
        console.log("message: " + data["message"]);

        let messageData = JSON.stringify({"message": data["message"], "timestamp": data["timestamp"], "sender": data["sender"]});
        
        clients[data["receiver"]].send(messageData);

        messages.push(messageData);

    });
});