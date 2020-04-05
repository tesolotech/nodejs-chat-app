const path = require('path')
const http = require('http')
const express = require('express')
const app = express()
const Filter = require('bad-words')
const {generateMSG} = require('./utils/messages')
const {addUser,removeUserById,getUserById,getUserInRoom} = require('./utils/users')

const socketio = require('socket.io')

const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

const publicDir = path.join(__dirname,'../public')

app.use(express.static(publicDir))

// There are three types of event in socketio
// server.on -- specific
//io.emit -- to all connected user
//server.broadcast.emit -leaving by self


io.on('connection',(server)=>{
    console.log('New Websocket connection')

    //Join user and room
    server.on('join',(options,callbacks)=>{
        const {error,user} = addUser({id:server.id,...options})
        if(error){
            return callbacks(error)
        }
    server.join(user.room)

    server.emit('messages',generateMSG('Welcome to chat-app','Admin'))
    //Broadcast for new user join
    server.broadcast.to(user.room).emit('messages',generateMSG(`${user.username} has joined`,'Admin'))
    
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUserInRoom(user.room)
    })
    callbacks()
        
    })

    server.on('messageSEND',(msg,callbacks)=>{
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callbacks('profenity is not allowed')
        }
        const user = getUserById(server.id)
        if(user){
            io.to(user.room).emit('messages',generateMSG(msg,user.username))
        }
        callbacks()
    })

    // server get current location
    server.on('sendLocation',(position,callbacks)=>{
        const urls = `https://google.com/maps?q=${position.latitude},${position.longitude}`
        const user = getUserById(server.id)
        if(user){
            io.to(user.room).emit('locationMessages',generateMSG(urls,user.username))
        }
        
        callbacks()
    })  

    // user disconnect notification
    server.on('disconnect',()=>{
        const user = removeUserById(server.id)
        if(user){
            io.to(user.room).emit('messages',generateMSG(`${user.username} has left`,'Admin'))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUserInRoom(user.room)
            })
        }
    })


})



server.listen(port,()=>{
    console.log('Server listning on '+port);
})
