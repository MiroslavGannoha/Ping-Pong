(function(global, window, document, undefined){
    document.addEventListener('DOMContentLoaded', init, false);
    function init(){
        var IO = {
            init: function(){
                if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1)
                     { IO.socket = io.connect('http://localhost:8082', {'transports': ['xhr-polling']} ); }
                else { IO.socket = io.connect('http://localhost:8082'); }
                IO.bindEvents();
            },
            bindEvents: function(){
                 IO.socket.on('playerUpdate', IO.playerUpdate);
                 IO.socket.on('connected', IO.connected);
                 IO.socket.on('newPlayer', IO.newPlayer);
                 IO.socket.on('removePlayer', IO.removePlayer);
            },
            playerUpdate: function(updatedPlayerConfig){
                App.table.players[updatedPlayerConfig.id].config = updatedPlayerConfig;
            },
            connected: function(playersConfig){
                playersConfig.forEach(function(playerConfig){
                    App.table.addNewPlayer(playerConfig);
                });
            },

            newPlayer: function(playerConfig){
                App.table.addNewPlayer(playerConfig);
            },
            removePlayer: function(playerConfig, index){
                App.table.players.forEach(function(player){
                    if(player.config.id ==  playerConfig.id) App.table.players.splice(index, 1);
                });
            }
        };
        var App = {
            init: function(){
                App.table = pingPongGame.createTable({onUpdate: App.onUpdate});
                App.bindEvents();
            },
            bindEvents: function(){
                document.getElementById('enter-table').addEventListener('click', App.enterTable, false);
            },
            enterTable: function(){
                if (!App.table.clientsPlayer){
                    var newPlayer = App.table.addNewPlayer({x:100, y: 100}, true);
                    IO.socket.emit('newPlayer', newPlayer.config);
                }
            },
            onUpdate: function(){
                if(App.table.clientsPlayer) IO.socket.emit('playerUpdate', App.table.clientsPlayer.config);
            }
        };
        App.init();
        IO.init();
    }
})(this, window, document, undefined);