const WebSocket = require('ws');
const http = require('http');
const axios = require('axios').default;

class database {

    constructor() {
        this.pingAPI();
    }

    async pingAPI() {
        try {
            let response = await axios.post(`http://${host}:3000/api/ping`);
            if (response.data === "pong") {
            console.log("\x1b[32mAPI is available\x1b[0m");
            } else {
            console.error("\x1b[31mAPI is unavailable\x1b[0m");
            }
        } catch (error) {
            console.error("\x1b[31mError pinging API:\x1b[0m", error);
        }
    }

    async saveMessage(messageData) {
    await axios({
     url: `http://${host}:3000/api/message`,
     method: 'POST',
     headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
     },
     data: messageData,

    }).catch(error => {
        console.error("\x1b[31mError saving message:\x1b[0m", error);
    });
    }
}

var clients = {};
var messages = [];

var host = "10.59.138.24";
var server = http.createServer();

server.listen(8080, host, function () {
    console.log("\x1b[32mserver online\x1b[0m");
    console.log('Listening to port:  ' + 8080);
});

const db = new database();

const wss = new WebSocket.Server({ httpServer: server, port: 3001 });



wss.on("connection", (ws, req) => {
    //ws.send("Connected to server");
    var client_adress = ws._socket.remoteAddress;
    var client_port = ws._socket.remotePort;    

    // ___DEBUG___
    console.log("___NEW CONNECTION___");
    console.log("host: " + client_adress);
    console.log("port: " + client_port);
    
    
    ws.on("message", (message) => {
        date = new Date();
        data = JSON.parse(message.toString());
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        data["timestamp"] = `${year}-${month}-${day} ${hours}:${minutes}`;

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
        console.log("message_data: " + data["message_data"]);

        let messageData = JSON.stringify({"message_data": data["message_data"], "timestamp": data["timestamp"], "sender": data["sender"]});
        
        clients[data["receiver"]].send(messageData);

        db.saveMessage(data);

        messages.push(messageData);

    });

    ws.on("close", () => {
        clients[data["userid"]] = null;
        console.log("___CONNECTION CLOSED___");
    });
});


