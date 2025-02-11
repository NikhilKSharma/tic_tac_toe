// @ts-nocheck

//import

const { Socket } = require('dgram');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

//initialization
const app = express();
const port = process.env.PORT || 3000;
var server = http.createServer(app);
const Room = require('./models/room')
var io = require('socket.io')(server);

const DB = "mongodb+srv://Nikhil:12345678987654321@cluster0.bhlcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
io.on("connection",(socket) => {
    console.log('socket connected!!');
    socket.on("createRoom",async ({nickname})=>{
        console.log(nickname);
        //room is created
        try{
            let room = new Room();
        let player = {
            socketID: socket.id,
            nickname: nickname,
            playerType: 'X',
        };
        //player is stored in the room
        room.players.push(player);
        room.turn = player;
        room = await room.save();
        console.log(room);
        const roomId = room._id.toString();
        socket.join(roomId);

        //io -> sending data to everyone
        //socket -> sending data to yourself
        io.to(roomId).emit('createRoomSuccess',room);
        }catch(e){
            console.log(e);
        }
    });

    socket.on('joinRoom',async ({nickname,roomId})=>{
        try{
            if(!roomId.match(/^[0-9a-fA-F]{24}$/)){
                socket.emit('errorOccurred','Please enter a valid room ID.');
                return;
            }
            let room = await Room.findById(roomId);
            if(room.isJoin){
                let player = {
                    nickname,
                    socketID: socket.id,
                    playerType: 'O',
                }
                socket.join(roomId);
                room.players.push(player);
                room.isJoin = false;
                room = await room.save();
                io.to(roomId).emit("joinRoomSuccess",room);
                io.to(roomId).emit("updatePlayers",room.players);
                io.to(roomId).emit('updateRoom',room);

            }else{
                socket.emit('errorOccurred','Room is already full');
            }
        }catch(e){
            console.log(e);
        }
    });
    socket.on('tap',async({index,roomId})=>{
        try{
            let room = await Room.findById(roomId);
            let choice = room.turn.playerType;
            if(room.turnIndex == 0){
                room.turn = room.players[1];
                room.turnIndex = 1;
            }else{
                room.turn = room.players[0];
                room.turnIndex = 0;
            }
            room  = await room.save();
            io.to(roomId).emit("tapped",{
                index,
                choice,
                room,
            });
        }catch(e){
            console.log(e);
        }
    });
    socket.on("winner",async ({winnerSocketId,roomId}) => {
        try{
            let room = await Room.findById(roomId);
            let player = room.players.find((player)=>player.socketID == winnerSocketId);
            player.points +=1;
            room = await room.save();
            if(player.points >= room.maxRounds){
                io.to(roomId).emit('endGame',player);
            }else{
                io.to(roomId).emit("pointIncrease",player);
            }
        }catch(e){
            console.log(e);
        }
    });
});

mongoose.connect(DB).then(() => {
    console.log("mongoose Connection Successful");
}).catch((e)=>{
    console.log(e);
});

app.use(express.json());

server.listen(port,'0.0.0.0',()=>{
    console.log(`server started at ${port}`);
});