var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/server.html");
});

var words = [];
words.push("ena");
words.push("geslo");
words.push("beseda");
words.push("primer");
words.push("belka");

function randomNUM(min, max) { 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

let users = [];

function joinUser(socketId , userName) {
	const user = {socketID :  socketId, username : userName}
	users.push(user)
	return user;
}

function removeUser(id) {
	const getID = users => users.socketID === id;
	const index =  users.findIndex(getID);
	if (index !== -1) {
	console.log(users[index].username + " has disconnected.");
	return users.splice(index, 1)[0];
  }
}

io.on("connection", function (socket) {
	socket.on("join room", (data) => {;
		let Newuser = joinUser(socket.id, data.username)
		socket.broadcast.emit('send data' , {id: socket.id, username: Newuser.username });
		console.log(Newuser.username + " has connected.");
		socket.join(Newuser);
		socket.broadcast.emit('joined' , {data: "joined", user: Newuser.username });
	});
  
	var gameOn = false;
	var passw = "";
	socket.on("chat message", (data) => {
		
		let msg = {value: encrypt(data.value), user: data.user}
		
				if(gameOn){
			console.log(msg.user + " won. GAME ENDED. The word was: " + decrypt(msg.value) )

			if(decrypt(msg.value) == "geslo"){
					data.value = " WON THE GUESSING GAME"
					console.log(msg.user + " won. GAME ENDED. The word was: " + decrypt(msg.value) )
					io.emit("chat message", {data:data ,id : socket.id});
					gameOn = false
			}
			else{
					io.emit("chat message", {data:data,id : socket.id});
					console.log(msg.user + " said: " + decrypt(msg.value) + " (encrypted: " + msg.value.content + ")")
			}
		}
		
		if(decrypt(msg.value) === "#GAMESTART"){ 
			gameOn = true 
			data.value = "STARTING A GUESSING GAME"
			console.log(msg.user + " started a guessing game")
			io.emit("chat message", {data:data ,id : socket.id});
			const random = randomNUM(0,4);
			var geslo = words[random];
			passw = geslo;
			console.log("Geslo je " + passw);
		}
		
		else if (gameOn == false){
			io.emit("chat message", {data:data,id : socket.id});
			console.log(msg.user + " said: " + decrypt(msg.value) + " (encrypted: " + msg.value.content + ")")
		}
		
		
	});
  
	socket.on("disconnect", (data) => {
		const user = removeUser(socket.id);
	});
});

http.listen(3000, function () {});
