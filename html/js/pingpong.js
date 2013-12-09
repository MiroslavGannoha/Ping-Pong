(function(global, window, document, undefined){
    'use strict';
    function PingPong(){
        /* Table class */
        function Table(options){

            var defaultOptions = {
                width: 250,
                height: 500,
                FPS: 30,
                ballOffset: 50,
                DOMScore: '.score-block',
                DOMContainer: '.wrap',
                socket: null,
                playersColors: ['blue', 'red', 'green', 'yellow'],
                ballColor: 'black',
                tableColor: 'lightblue',
                clientsPlayer: null,
                players: []
            }

            for(var option in defaultOptions) this[option] = options && options[option]!==undefined ? options[option] : defaultOptions[option];


            var canvasElement = this.canvasElement = document.createElement('canvas');
            canvasElement.width = this.width;
            canvasElement.height = this.height;
            document.querySelector(this.DOMContainer).appendChild(canvasElement);
            this.canvas = canvasElement.getContext('2d');
            this.canvas.backgroundColor= this.tableColor;

            this.ball = new Ball(this, this.width/2, this.height/2);

            var that = this;
            this.canvasTimer = setInterval(function() {
                that.canvas.clearRect(0, 0, that.width, that.height);
                that.handleCollisions();
                that.players.forEach(function(p){
                    p.update();
                });
                that.ball.update();
                options.onUpdate && options.onUpdate();
            }, 1000/that.FPS);
        }

        Table.prototype = {
            updateScore: function(){
                //document.querySelector(this.DOMScore).innerText = document.querySelector(this.DOMScore).contentText = this.players[0].score + ':' + this.players[1].score;
            },
            clamp: function(min, max) {
                return Math.min(Math.max(this, min), max);
            },
            addPlayer: function(player){
                this.players.push(player);
            },
            addNewPlayer: function(playerConfig, clientsPlayer){
                if(this.players.length < 3){
                    /*var xPos = this.width/2,
                        yPos = homeBase == 'top' ? this.height : 0;*/

                    playerConfig.color = playerConfig.color || this.playersColors[this.players.length] || this.playersColors[0];


                    var player = new Player(playerConfig, this, clientsPlayer);
                    if (!player.config.id){
                        player.config.id = this.players.length;
                        this.players.push(player);
                    }
                    else{
                        this.players[player.config.id] = player;
                    }
                    if(clientsPlayer) this.clientsPlayer = player;
                    return player;
                }
                return false;

            },
            scored: function(scoredHomeBase){
                var homeBase = scoredHomeBase == 'top' ? 'bottom' : 'top';
                this.players.forEach(function(player){
                    if(player.homeBase == homeBase) player.score += 1;
                    player.reset();
                });
                this.ball.reset(homeBase);
                this.updateScore(homeBase);

            },
            handleCollisions: function() {
                var ball = this.ball;
                this.players.forEach(function(player){
                    var k = player.midpoint().x / ball.midpoint().x;
                    if (k<1){ k = k-2; }
                    else if (k===1){ k = 0; }
                    if (player.pushFromTop(ball)) {
                        ball.velocityY = -9;
                        ball.velocityX = -2*k;
                    }
                    else if(player.pushFromBot(ball)){
                        ball.velocityY = 9;
                        ball.velocityX = -2*k;
                    }
                });

                if (ball.y > this.height - ball.height){
                    this.scored('top');
                }
                else if(ball.y < 0){
                    this.scored('bottom')
                }

            }
        }

        /* Canvas Item class*/
        function CanvasItem(){
            this.config = {};
            this.config.x = 0;
            this.config.y = 0;
            this.width = 10;
            this.height = 10;
            this.color = 'grey';
        }
        CanvasItem.prototype.draw = function(){
            this.table.canvas.fillStyle = this.config.color;
            this.table.canvas.fillRect(this.config.x, this.config.y, this.width, this.height);
        }
        CanvasItem.prototype.collides = function (a) {
            return this.config.x < a.config.x + a.width &&
                this.config.x + this.width > a.config.x &&
                this.config.y < a.config.y + a.height &&
                this.config.y + this.height > a.config.y;
        }
        CanvasItem.prototype.midpoint = function() {
            return {
                x: this.config.x + this.width/2,
                y: this.config.y + this.height/2
            };
        }
        /* -------- */

        /* Player class */
        function Player(config, table, clientsPlayer){
            this.config = config;
            this.startPositionX = config.x;
            this.startPositionY = config.y;
            this.width = 50;
            this.height = 12;
            this.score = 0;
            this.table = table;
            this.color = config.color;
            this.clientsPlayer = clientsPlayer;

           /* var that = this;
            /*if (!this.clientsPlayer){
                socket.on('message', function(msg) {
                    that.x = msg.x;
                    that.y = msg.y;

                    that.update();
                });
            }*/
        }
        Player.prototype = new CanvasItem();

        Player.prototype.update = function(){
            if(this.clientsPlayer){
                if (keydown.left) this.config.x -= 5;
                if (keydown.right) this.config.x += 5;
                if (keydown.up) this.config.y -= 3;
                if (keydown.down) this.config.y += 3;
            }
            //this.x = clamp(0, canvasWidth - this.width);
            this.config.x = Math.max(Math.min(this.config.x, this.table.width - this.width), 0);
            this.config.y = Math.max(Math.min(this.config.y, this.table.height - this.height), 0);
            this.draw();
            return this;
        }
        Player.prototype.reset = function(){
            this.config.x = this.startPositionX;
            this.config.y = this.startPositionY;
        }
        Player.prototype.pushFromBot = function(pushedObj){
            return this.collides(pushedObj) && this.config.y < pushedObj.config.y;
        },
        Player.prototype.pushFromTop = function(pushedObj){
            return this.collides(pushedObj) && this.config.y > pushedObj.config.y;
        }
        /* -------- */

        /* Ball class */
        function Ball(table, x, y){
            this.x = this.startPositionX = x;
            this.y = this.startPositionY = y;
            this.color = table.ballColor;
            this.velocityY = 0;
            this.velocityX = 0;
            this.table = table;
        };
        Ball.prototype = new CanvasItem();
        Ball.prototype.update = function(){
            this.y += this.velocityY;
            this.x += this.velocityX;

            if (this.x > this.table.width - this.width || this.x < 0){
                this.velocityX = -this.velocityX;
            }
            this.draw();
        };
        Ball.prototype.reset = function(homeBase){
            this.x = this.startPositionX;
            this.y = homeBase == 'top' ? this.table.ballOffset : this.table.height - this.table.ballOffset;
            this.velocityY = 0;
            this.velocityX = 0;
        };

        /* Public API */
        return {
            getPrivateVar: function(){
                return privateVar;
            },
            createTable: function(opts){
                return new Table(opts);
            }
        };

    }
    global.pingPongGame = new PingPong;
})(this, window, document, undefined);