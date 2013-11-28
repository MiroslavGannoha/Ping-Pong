function start(){
    var io = require('socket.io').listen(8082);
    io.set('log level', 2);
    var tableData = {players: []}

    // Навешиваем обработчик на подключение нового клиента
    io.sockets.on('connection', function (socket, data) {
        //var ID = (socket.id).toString().substr(0, 5);
        // Навешиваем обработчик на входящее сообщение
        socket.emit('connected', tableData.players);
        socket.on('playerUpdate', function(playerConfig){
            tableData.players[playerConfig.id] = playerConfig;
            socket.broadcast.emit('playerUpdate', playerConfig);
        });

        socket.on('newPlayer', function (playerConfig) {
            tableData.players[playerConfig.id] = playerConfig;
            socket.broadcast.emit('newPlayer', playerConfig);
        });
        // При отключении клиента - уведомляем остальных
        /*socket.on('disconnect', function() {
            var time = (new Date).toLocaleTimeString();
            io.sockets.json.send({'event': 'userSplit', 'name': name, 'time': time});
        });*/
    });

    /* handshake
    io.set('authorization', function (data) {
        console.log('data11: ', data.query);
    });*/
}

exports.start = start;