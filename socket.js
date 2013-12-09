function start(){
    var io = require('socket.io').listen(8082);
    io.set('log level', 2);
    var tableData = {players: []}

    io.sockets.on('connection', function (socket, data) {
        socket.emit('connected', tableData.players);
        socket.on('playerUpdate', function(playerConfig){
            tableData.players[playerConfig.id] = playerConfig;
            socket.broadcast.emit('playerUpdate', playerConfig);
        });

        socket.on('newPlayer', function (playerConfig) {
            tableData.players[playerConfig.id] = playerConfig;
            socket.broadcast.emit('newPlayer', playerConfig);
        });
        /*socket.on('disconnect', function() {
        });*/
    });
}

exports.start = start;