(function(global, window, document, undefined){
    function Tennis(){
        var canvasWidth = 250;
        var canvasHeight = 500;
        var canvas, canvasTimer;

        /* Canvas Item class*/
        function CanvasItem(){
            this.x = 0;
            this.y = 0;
            this.width = 10;
            this.height = 10;
            this.color = 'grey';
        }
        CanvasItem.prototype.draw = function(){
            canvas.fillStyle = this.color;
            canvas.fillRect(this.x, this.y, this.width, this.height);
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
        function Player(x, y, ball){
            this.startPositionX = this.x = x;
            this.startPositionY = this.y = y;
            this.color = 'blue';
            this.width = 50;
            this.height = 12;
            this.score = 0;
            this.ball = ball;
        }
        Player.prototype = new CanvasItem();
        Player.prototype.handleCollisions = function() {
            var ball = this.ball;
            var k = this.midpoint().x / ball.midpoint().x ;
            if (k<1){ k = k-2; }
            else if (k===1){ k = 0; }
            if (pushFromTop(this, ball)) {
                ball.velocityY = -9;
                ball.velocityX = -2*k;
            }
            else if(pushFromBot(this, ball)){
                ball.velocityY = 9;
                ball.velocityX = -2*k;
            }
            return this;
        }
        Player.prototype.update = function(){
            if (keydown.left) this.x -= 5;
            if (keydown.right) this.x += 5;
            if (keydown.up) this.y -= 3;
            if (keydown.down) this.y += 3;
            if (keydown.space) this.shoot();

            //this.x = clamp(0, canvasWidth - this.width);
            this.x = Math.min(this.x, canvasWidth - this.width);
            this.y = Math.min(this.y, canvasHeight - this.height);
            this.x = Math.max(this.x, 0);
            this.y = Math.max(this.y, 0);
            return this;
        }
        Player.prototype.reset = function(){
            this.x = this.startPositionX;
            this.y = this.startPositionY;
        }
        /* -------- */

        /* Ball class */
        function Ball(){
            this.x = canvasWidth/2;
            this.y = 460;//canvasHeight/2;
            this.color = 'red';
            this.velocityY = 0;
            this.velocityX = 0;
        };
        Ball.prototype = new CanvasItem();
        Ball.prototype.update = function(){
            this.y += this.velocityY;
            this.x += this.velocityX;

            if (this.x > canvasWidth - this.width || this.x < 0){
                this.velocityX = -this.velocityX;
            }
            if (this.y > canvasHeight - this.height){
                player1.score += 1;
                updateScore();
                this.reset(true);
                player1.reset();
                player2.reset();
            }
            else if(this.y < 0){
                player2.score += 1;
                updateScore();
                this.reset(false);
                player1.reset();
                player2.reset();
            }
        };
        Ball.prototype.reset = function(isPositionBot){
            this.x = canvasWidth/2;
            this.y = isPositionBot ? 460 : 40;
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

        function updateScore(){
            document.querySelector('.score-block').innerText = document.querySelector('.score-block').contentText = player1.score + ':' + player2.score;
        }

        function clamp(min, max) {
            return Math.min(Math.max(this, min), max);
        }
        function pushFromBot(a,b){
            return a.collides(b) && a.y < b.y;
        }
        function pushFromTop(a,b){
            return a.collides(b) && a.y > b.y;
        }

        var ball = new Ball();
        var player1 = new Player(105, 500, ball);
        var player2 = new Player(105, 0, ball);


        return {
            getPrivateVar: function(){
                return privateVar;
            },
            init: function(){
                var canvasElement = document.createElement('canvas');
                canvasElement.width = canvasWidth;
                canvasElement.height = canvasHeight;
                document.querySelector('.wrap').appendChild(canvasElement);
                canvas = canvasElement.getContext('2d');
                canvas.backgroundColor='lightblue';

                var FPS = 30;
                canvasTimer = setInterval(function() {
                    canvas.clearRect(0, 0, canvasWidth, canvasHeight);
                    player1.draw();
                    player2.draw();
                    ball.draw();
                    player1.handleCollisions().update();
                    player2.handleCollisions().update();
                    ball.update();
                }, 1000/FPS);
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



