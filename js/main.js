var CANVAS_WIDTH = 250;
var CANVAS_HEIGHT = 500;
var canvas, canvasTimer;
function initHTML(){
    var $canvasElement = $('<canvas width="' + CANVAS_WIDTH + '" height="' + CANVAS_HEIGHT + '"></canvas>');
    canvas = $canvasElement.get(0).getContext("2d");
    $canvasElement.appendTo('body');
    canvas.backgroundColor="lightblue";

    var FPS = 30;
    canvasTimer = setInterval(function() {
        update();
        draw();
        player1.handleCollisions();
        player2.handleCollisions();
    }, 1000/FPS);
}

function update() {
    if (keydown.left) player.x -= 5;
    if (keydown.right) player.x += 5;
    if (keydown.up) player.y -= 3;
    if (keydown.down) player.y += 3;
    if (keydown.space) player.shoot();
    
    ball.y += ball.velocityY;
    ball.x += ball.velocityX;

    //player.x = clamp(0, CANVAS_WIDTH - player.width);
    player.x = Math.min(player.x, CANVAS_WIDTH - player.width);
    player.y = Math.min(player.y, CANVAS_HEIGHT - player.height);
    player.x = Math.max(player.x, 0);
    player.y = Math.max(player.y, 0);

    if (ball.x > CANVAS_WIDTH - ball.width || ball.x < 0){
        ball.velocityX = -ball.velocityX;
    }

}


function draw() {
    canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    player1.draw();
    player2.draw();
    ball.draw();
}



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

function Player(x, y){
    this.x = x;
    this.y = y;
    this.color = 'blue';
    this.width = 50;
}
Player.prototype = new CanvasItem();
Player.prototype.handleCollisions = function() {
    var k = player.midpoint().x / ball.midpoint().x ;
    if (k<1){ k = k-2; }
    else if (k===1){ k = 0; }
    if (pushFromTop(player, ball)) {
        ball.velocityY = -5;
        ball.velocityX = -2*k;
    }
    else if(pushFromBot(player, ball)){
        ball.velocityY = 5;
        ball.velocityX = -2*k;
    }
}

function Ball(){
    this.x = CANVAS_WIDTH/2;
    this.y = 460;//CANVAS_HEIGHT/2;
    this.color = 'red';
    this.velocityY = 0;
    this.velocityX = 0;
}
Ball.prototype = new CanvasItem();

function clamp(min, max) {
    return Math.min(Math.max(this, min), max);
}
function pushFromBot(a,b){
    return a.collides(b) && a.y < b.y;
}
function pushFromTop(a,b){
    return a.collides(b) && a.y > b.y;
}


var player1 = new Player(105, 500);
var player2 = new Player(105, 0);
var ball = new Ball();


$(document).ready(function(){
    initHTML();
});