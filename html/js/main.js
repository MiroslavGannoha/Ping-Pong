(function(global, window, document, undefined){
    function Tennis(){

        var ball = new Ball();

        /* Table class */
        function Table(options){

            var defaultOptions = {
                width: 250,
                height: 500,
                FPS: 30,
                ballOffset: 50,
                DOMScore: '.score-block'
            }
            for(var option in defaultOptions) this[option] = options && options[option]!==undefined ? options[option] : defaultOptions[option];


            var canvasElement = this.canvasElement = document.createElement('canvas');
            canvasElement.width = this.width;
            canvasElement.height = this.height;
            document.querySelector('.wrap').appendChild(canvasElement);
            this.canvas = canvasElement.getContext('2d');
            this.canvas.backgroundColor='lightblue';

            this.ball = new Ball(this, this.width/2, this.height/2);

            this.players = [];

            var that = this;
            this.canvasTimer = setInterval(function() {
                that.canvas.clearRect(0, 0, that.width, that.height);
                that.players.forEach(function(p){
                    p.draw();
                });
                that.ball.draw();
                that.handleCollisions();
                that.players.forEach(function(p){
                    p.update();
                });
                that.ball.update();
            }, 1000/that.FPS);
        }

        Table.prototype = {
            updateScore: function(){
                document.querySelector(this.DOMScore).innerText = document.querySelector(this.DOMScore).contentText = this.players[0].score + ':' + this.players[1].score;
            },
            clamp: function(min, max) {
                return Math.min(Math.max(this, min), max);
            },
            addPlayer: function(homeBase){
                if(this.players.length < 3){
                    var xPos = this.width/2,
                        yPos = homeBase == 'top' ? this.height : 0;

                    var player = new Player(this, xPos, yPos, homeBase);
                    this.players.push(player);
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
                    var k = player.midpoint().x / ball.midpoint().x ;
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
                else if(this.y < 0){
                    this.scored('bottom')
                }

            }
        }


        /* Canvas Item class*/
        function CanvasItem(){
            this.x = 0;
            this.y = 0;
            this.width = 10;
            this.height = 10;
            this.color = 'grey';
        }
        CanvasItem.prototype.draw = function(){
            this.table.canvas.fillStyle = this.color;
            this.table.canvas.fillRect(this.x, this.y, this.width, this.height);
        }
        CanvasItem.prototype.collides = function (a) {
            return this.x < a.x + a.width &&
                this.x + this.width > a.x &&
                this.y < a.y + a.height &&
                this.y + this.height > a.y;
        }
        CanvasItem.prototype.midpoint = function() {
            return {
                x: this.x + this.width/2,
                y: this.y + this.height/2
            };
        }
        /* -------- */

        /* Player class */
        function Player(table, x, y, homeBase){
            this.startPositionX = this.x = x;
            this.startPositionY = this.y = y;
            this.color = 'blue';
            this.width = 50;
            this.height = 12;
            this.score = 0;
            this.table = table;
            this.homeBase = homeBase;
        }
        Player.prototype = new CanvasItem();

        Player.prototype.update = function(){
            if (keydown.left) this.x -= 5;
            if (keydown.right) this.x += 5;
            if (keydown.up) this.y -= 3;
            if (keydown.down) this.y += 3;
            if (keydown.space) this.shoot();

            //this.x = clamp(0, canvasWidth - this.width);
            this.x = Math.max(Math.min(this.x, this.table.width - this.width), 0);
            this.y = Math.max(Math.min(this.y, this.table.height - this.height), 0);
            return this;
        }
        Player.prototype.reset = function(){
            this.x = this.startPositionX;
            this.y = this.startPositionY;
        }
        Player.prototype.pushFromBot = function(pushedObj){
            return this.collides(pushedObj) && this.y < pushedObj.y;
        },
        Player.prototype.pushFromTop = function(pushedObj){
            return this.collides(pushedObj) && this.y > pushedObj.y;
        }
        /* -------- */

        /* Ball class */
        function Ball(table, x, y){
            this.x = this.startPositionX = x;
            this.y = this.startPositionY = y;
            this.color = 'red';
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

        };
        Ball.prototype.reset = function(homeBase){
            this.x = this.startPositionX;
            this.y = homeBase == 'top' ? this.table.height - this.table.ballOffset : this.table.ballOffset;
            this.velocityY = 0;
            this.velocityX = 0;
        };
        Ball.prototype.subscribe = function(event, callback){
            if(this.subscribers.hasOwnProperty(event)){
                var index = this.subscribers[event].length;
                while(index--){
                    if(this.subscribers[event][index] == callback){
                        return false;
                    }
                }
                this.subscribers[event].push(callback);
            }
            else{
                this.subscribers[event]=[callback]
            }
            return true;
        };
        /* -------- */


        /* Public API */
        return {
            getPrivateVar: function(){
                return privateVar;
            },
            init: function(){
                var table = new Table(250, 500);
                table.addPlayer('top');
                table.addPlayer('bottom');
            }
        }
    }
    global.tennisGame = new Tennis;
})(this, window, document, undefined);

var socket;
$(document).ready(function(){
    tennisGame.init();
    if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
        socket = io.connect('http://localhost:8081', {'transports': ['xhr-polling']});
    } else {
        socket = io.connect('http://localhost:8081');
    }
});



