const util = require('util')
let socketio = require('socket.io')

module.exports.listen = function(server){
    let io = socketio.listen(server)

    // ------------------------------ Traitement du socket
    let objUtilisateur = {}
    let objMessage = {}

    io.on('connection', function(socket){
    console.log(socket.id)
    // ................................. //
    socket.on('setUser', function(data){
    	objUtilisateur[socket.id] = data.user
    	console.log(util.inspect(data))
    	socket.emit('valide_user', data)
    	io.sockets.emit('diffuser_list_user', objUtilisateur)
    })

    socket.on('setMessage', function(data){
    	data.user = objUtilisateur[socket.id]
    	console.log(util.inspect(data))
    	socket.emit('valide_message', data)
    	socket.broadcast.emit('diffuser_list_message', data/*objMessage*/)
    })

    socket.on('disconnect', function(data){
    	delete objUtilisateur[socket.id]
    	io.sockets.emit('diffuser_list_user', objUtilisateur)
    })
    })//fin connection
 return io
}

/// sockets -> a tout le monde
/// broadcast socket -> tout le monde sauf moi
/// socket -> moi