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
            console.error("\x1b[31mAPI offline\x1b[0m");
        }
    }

    async saveMessage(messageData) {
    await axios({
     url: `http://${host}:3000/api/message`,
     method: 'POST',
     headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
     },
     data: {
        "sender": messageData["sender"],
        "receiver": messageData["receiver"],
        "message_data": messageData["message_data"],
        "sender_message_data": messageData["sender_message_data"],
        "timestamp": messageData["timestamp"],
        "userid": messageData["sender"],
        "token": messageData["token"]
     },

    }).catch(error => {
        console.error("\x1b[31mError saving message:\x1b[0m", error);
    });
    }
}

var clients = {};
var messages = [];

var host = "192.168.1.196";
var server = http.createServer();

server.listen(8080, host, function () {
    console.log("\x1b[32mserver online\x1b[0m");
    console.log('\x1b[33mListening to port:  ' + 8080 + '\x1b[0m');
});

const db = new database();

const wss = new WebSocket.Server({ httpServer: server, port: 3001 });



wss.on("connection", (ws, req) => {
    //ws.send("Connected to server");
    var client_adress = ws._socket.remoteAddress;
    var client_port = ws._socket.remotePort;    

    // ___DEBUG___
    console.log("\x1b[36m___NEW CONNECTION___\x1b[0m");
    console.log("\x1b[36mHost:\x1b[0m", client_adress);
    console.log("\x1b[36mPort:\x1b[0m", client_port);
    
    
    
    ws.on("message", (message) => {
        date = new Date();
        data = JSON.parse(message.toString());
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2 , '0');
        
        data["timestamp"] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        if(data["status"] == "connecting"){
            console.log("___CONNECTION MSG___");
            console.log("userid: " + data["userid"]);
            console.log("status: " + data["status"]);
            console.log("timestamp: " + data["timestamp"]);
            clients[data["userid"]] = ws;
            return;
        }
        
        data["sender"] = Object.keys(clients).find(key => clients[key] === ws);
        console.log("message_data (bytes): " + data["message_data"].toString());
        data["message_data"] = btoa(String.fromCharCode(...data["message_data"]));
        data["sender_message_data"] = btoa(String.fromCharCode(...data["sender_message_data"]));
        // ___DEBUG___
        console.log("___NEW MESSAGE___");
        console.log("receiver: " + data["receiver"]);
        console.log("sender: " + data["sender"]);
        console.log("timestamp: " + data["timestamp"]);
        console.log("message_data: " + data["message_data"].toString());
        console.log("sender_message_data: " + data["sender_message_data"].toString());
    
        let messageData = JSON.stringify({"message_data": data["message_data"], "sender_message_data": data["sender_message_data"], "timestamp": data["timestamp"], "sender": data["sender"], "receiver": data["receiver"]});
        
        if(clients[data["receiver"]]){
            clients[data["receiver"]].send(messageData);
        }
        

        if(clients[data["sender"]]){
            clients[data["sender"]].send(messageData);
        }
        

        db.saveMessage(data);

        messages.push(messageData);

    });

    ws.on("close", () => {
        clients[data["userid"]] = null;
        console.log("___CONNECTION CLOSED___");
    });
});


