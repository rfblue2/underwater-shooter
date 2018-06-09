var LEFT  = 37;
var UP    = 38;
var RIGHT = 39;
var DOWN  = 40;
var SPACE = 32;
var HEIGHT = 480;
var WIDTH = 640;

function init() {
  var keys = {};
  var stage = new createjs.Stage("demoCanvas");

  var bg1 = new createjs.Bitmap("img/bg.png");
  var bg2 = new createjs.Bitmap("img/bg.png");
  bg2.x = WIDTH;
  stage.addChild(bg1, bg2);

  var enemyMgr = new EnemyManager(stage);
  stage.addChild(enemyMgr.enemies);
  
  var scoreMgr = new ScoreManager(stage);
  stage.addChild(scoreMgr.scoreText);

  var dolphin = new Dolphin(stage);
  stage.addChild(dolphin.sprite);

  this.document.onkeydown = keydown;
  this.document.onkeyup = keyup;

  createjs.Ticker.addEventListener("tick", handleTick);

  function keydown(event) {
    keys[event.keyCode] = true;
  }

  function keyup(event) {
    delete keys[event.keyCode];
  }

  function handleTick(event) {
    // scrolling bg
    bg1.x -= 7;
    bg2.x -= 7;
    if (bg1.x < -WIDTH + 7) bg1.x = WIDTH;
    if (bg2.x < -WIDTH + 7) bg2.x = WIDTH;

    enemyMgr.update();
    dolphin.update(keys);

    // test for enemy/bullet collision
    for (var j = 0; j < dolphin.bulletMgr.bullets.children.length; j++) {
      for (var k = 0; k < enemyMgr.enemies.children.length; k++) {
        // reference is in center of bullet, so give +/- 5 radius
        if (dolphin.bulletMgr.bullets.children[j].y + 5 > enemyMgr.enemies.children[k].y - 5 && 
            dolphin.bulletMgr.bullets.children[j].y + 5 < enemyMgr.enemies.children[k].y + 33 + 5 &&
            dolphin.bulletMgr.bullets.children[j].x + 5 > enemyMgr.enemies.children[k].x - 5 &&
            dolphin.bulletMgr.bullets.children[j].x + 5 < enemyMgr.enemies.children[k].x + 50 + 5
        ) { 
          dolphin.bulletMgr.bullets.removeChildAt(j); 
          enemyMgr.enemies.removeChildAt(k); 
          stage.update(); 
          scoreMgr.add(10);
          break;
        }
      }
    }

    scoreMgr.update();
    stage.update(event);
  }
}
    

function BulletManager(stage) {
  var bullets = new createjs.Container();
  this.bullets = bullets;

  var bulletData = {
    images: ["img/bullet.png"],
    frames: {width:10,height:10},
    framerate: 12,
  };
  var bulletSheet = new createjs.SpriteSheet(bulletData);

  this.addBullet = function(x, y) {
    var b = new createjs.Sprite(bulletSheet);
    b.x = x;
    b.y = y;

    b.gotoAndPlay(0);
    bullets.addChild(b);
    stage.update();
  }

  this.update = function() {
    // update bullets
    for(var j = 0; j < bullets.children.length; j++) {
      bullets.children[j].x += 20;

      // remove offstage bullets 
      if(bullets.children[j].x > WIDTH + 10) {
        bullets.removeChildAt(j);
      }
    }
  }

}


function Fish() {
  this.HEIGHT = 33;
  this.WIDTH = 50;

  var fish1Data = {
    images: ["img/fish2.png"],
    frames: {width:50, height:33},
    framerate: 12,
  };
  var fish1Sheet = new createjs.SpriteSheet(fish1Data);
  var sprite = new createjs.Sprite(fish1Sheet);
  sprite.gotoAndPlay(0);

  this.sprite = sprite;
}


function EnemyManager(stage) {
  var enemies = new createjs.Container();
  this.enemies = enemies;

  function addEnemy() {
    var fish1 = new Fish(); 
    fish1.sprite.x = WIDTH - 50; 
    fish1.sprite.y = Math.floor(Math.random() * (HEIGHT - 33)) + 33;
    enemies.addChild(fish1.sprite);
    stage.update();
  }

  var timerSource = setInterval(addEnemy, 1000); 

  this.update = function() {
    // update enemies
    for(var j = 0; j < this.enemies.children.length; j++) {
      this.enemies.children[j].x -= 5;

      // remove offstage enemies
      if(this.enemies.children[j].x < -25)
        this.enemies.removeChildAt(j);
    }
  }
}

function Dolphin(stage) {
  var self = this;
  this.HEIGHT = 98;
  this.WIDTH = 150;

  var bulletMgr = new BulletManager(stage);
  this.bulletMgr = bulletMgr;

  stage.addChild(this.bulletMgr.bullets);

  var dolphinData = {
    images: ["img/dolphin2.png"],
    frames: {width:this.WIDTH, height:this.HEIGHT},
    framerate: 12,
  };
  var dolphinSheet = new createjs.SpriteSheet(dolphinData);
  var dolphin = new createjs.Sprite(dolphinSheet);
  dolphin.gotoAndPlay(0);

  this.sprite = dolphin;

  function shoot() {
    bulletMgr.addBullet(
      dolphin.x + self.WIDTH,
      dolphin.y + self.HEIGHT/2
    );
  }

  var shootCounter = 0;

  this.update = function(keys) {
    // move dolphin
    if (keys[LEFT])  dolphin.x -= 15;
    if (keys[UP])    dolphin.y -= 15;
    if (keys[RIGHT]) dolphin.x += 15;
    if (keys[DOWN])  dolphin.y += 15;

    // wall collision
    if (dolphin.x < -this.WIDTH/2) dolphin.x = -this.WIDTH/2;
    if (dolphin.y < -this.HEIGHT/2) dolphin.y = -this.HEIGHT/2;
    if (dolphin.x > WIDTH - this.WIDTH/2) dolphin.x = WIDTH - this.WIDTH/2;
    if (dolphin.y > HEIGHT - this.HEIGHT/2) dolphin.y = HEIGHT - this.HEIGHT/2;

    // shooting
    if (keys[SPACE]) {
      if (shootCounter == 0) shoot()
      shootCounter = (shootCounter + 1) % 3;
    } else {
      shootCounter = 0;
    }

    bulletMgr.update();
  }

}


function ScoreManager(stage) {
  var score = 0;
  this.score = score;
  var scoreText = new createjs.Text('0', 'bold 20px Courier New', '#FFFFFF');
  scoreText.maxWidth = 1000;
  scoreText.y = 10;
  scoreText.x = 10;
  this.scoreText = scoreText;

  this.add = function(amt) {
    score += amt;
  }
  
  this.update = function() {
    scoreText.text = score; 
  }
}


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImJ1bGxldE1hbmFnZXIuanMiLCJlbmVteS5qcyIsImVuZW15TWFuYWdlci5qcyIsInBsYXllci5qcyIsInNjb3JlTWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgTEVGVCAgPSAzNztcbnZhciBVUCAgICA9IDM4O1xudmFyIFJJR0hUID0gMzk7XG52YXIgRE9XTiAgPSA0MDtcbnZhciBTUEFDRSA9IDMyO1xudmFyIEhFSUdIVCA9IDQ4MDtcbnZhciBXSURUSCA9IDY0MDtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIGtleXMgPSB7fTtcbiAgdmFyIHN0YWdlID0gbmV3IGNyZWF0ZWpzLlN0YWdlKFwiZGVtb0NhbnZhc1wiKTtcblxuICB2YXIgYmcxID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChcImltZy9iZy5wbmdcIik7XG4gIHZhciBiZzIgPSBuZXcgY3JlYXRlanMuQml0bWFwKFwiaW1nL2JnLnBuZ1wiKTtcbiAgYmcyLnggPSBXSURUSDtcbiAgc3RhZ2UuYWRkQ2hpbGQoYmcxLCBiZzIpO1xuXG4gIHZhciBlbmVteU1nciA9IG5ldyBFbmVteU1hbmFnZXIoc3RhZ2UpO1xuICBzdGFnZS5hZGRDaGlsZChlbmVteU1nci5lbmVtaWVzKTtcbiAgXG4gIHZhciBzY29yZU1nciA9IG5ldyBTY29yZU1hbmFnZXIoc3RhZ2UpO1xuICBzdGFnZS5hZGRDaGlsZChzY29yZU1nci5zY29yZVRleHQpO1xuXG4gIHZhciBkb2xwaGluID0gbmV3IERvbHBoaW4oc3RhZ2UpO1xuICBzdGFnZS5hZGRDaGlsZChkb2xwaGluLnNwcml0ZSk7XG5cbiAgdGhpcy5kb2N1bWVudC5vbmtleWRvd24gPSBrZXlkb3duO1xuICB0aGlzLmRvY3VtZW50Lm9ua2V5dXAgPSBrZXl1cDtcblxuICBjcmVhdGVqcy5UaWNrZXIuYWRkRXZlbnRMaXN0ZW5lcihcInRpY2tcIiwgaGFuZGxlVGljayk7XG5cbiAgZnVuY3Rpb24ga2V5ZG93bihldmVudCkge1xuICAgIGtleXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24ga2V5dXAoZXZlbnQpIHtcbiAgICBkZWxldGUga2V5c1tldmVudC5rZXlDb2RlXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVRpY2soZXZlbnQpIHtcbiAgICAvLyBzY3JvbGxpbmcgYmdcbiAgICBiZzEueCAtPSA3O1xuICAgIGJnMi54IC09IDc7XG4gICAgaWYgKGJnMS54IDwgLVdJRFRIICsgNykgYmcxLnggPSBXSURUSDtcbiAgICBpZiAoYmcyLnggPCAtV0lEVEggKyA3KSBiZzIueCA9IFdJRFRIO1xuXG4gICAgZW5lbXlNZ3IudXBkYXRlKCk7XG4gICAgZG9scGhpbi51cGRhdGUoa2V5cyk7XG5cbiAgICAvLyB0ZXN0IGZvciBlbmVteS9idWxsZXQgY29sbGlzaW9uXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBkb2xwaGluLmJ1bGxldE1nci5idWxsZXRzLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW4ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgLy8gcmVmZXJlbmNlIGlzIGluIGNlbnRlciBvZiBidWxsZXQsIHNvIGdpdmUgKy8tIDUgcmFkaXVzXG4gICAgICAgIGlmIChkb2xwaGluLmJ1bGxldE1nci5idWxsZXRzLmNoaWxkcmVuW2pdLnkgKyA1ID4gZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbltrXS55IC0gNSAmJiBcbiAgICAgICAgICAgIGRvbHBoaW4uYnVsbGV0TWdyLmJ1bGxldHMuY2hpbGRyZW5bal0ueSArIDUgPCBlbmVteU1nci5lbmVtaWVzLmNoaWxkcmVuW2tdLnkgKyAzMyArIDUgJiZcbiAgICAgICAgICAgIGRvbHBoaW4uYnVsbGV0TWdyLmJ1bGxldHMuY2hpbGRyZW5bal0ueCArIDUgPiBlbmVteU1nci5lbmVtaWVzLmNoaWxkcmVuW2tdLnggLSA1ICYmXG4gICAgICAgICAgICBkb2xwaGluLmJ1bGxldE1nci5idWxsZXRzLmNoaWxkcmVuW2pdLnggKyA1IDwgZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbltrXS54ICsgNTAgKyA1XG4gICAgICAgICkgeyBcbiAgICAgICAgICBkb2xwaGluLmJ1bGxldE1nci5idWxsZXRzLnJlbW92ZUNoaWxkQXQoaik7IFxuICAgICAgICAgIGVuZW15TWdyLmVuZW1pZXMucmVtb3ZlQ2hpbGRBdChrKTsgXG4gICAgICAgICAgc3RhZ2UudXBkYXRlKCk7IFxuICAgICAgICAgIHNjb3JlTWdyLmFkZCgxMCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY29yZU1nci51cGRhdGUoKTtcbiAgICBzdGFnZS51cGRhdGUoZXZlbnQpO1xuICB9XG59XG4gICAgXG4iLCJmdW5jdGlvbiBCdWxsZXRNYW5hZ2VyKHN0YWdlKSB7XG4gIHZhciBidWxsZXRzID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpO1xuICB0aGlzLmJ1bGxldHMgPSBidWxsZXRzO1xuXG4gIHZhciBidWxsZXREYXRhID0ge1xuICAgIGltYWdlczogW1wiaW1nL2J1bGxldC5wbmdcIl0sXG4gICAgZnJhbWVzOiB7d2lkdGg6MTAsaGVpZ2h0OjEwfSxcbiAgICBmcmFtZXJhdGU6IDEyLFxuICB9O1xuICB2YXIgYnVsbGV0U2hlZXQgPSBuZXcgY3JlYXRlanMuU3ByaXRlU2hlZXQoYnVsbGV0RGF0YSk7XG5cbiAgdGhpcy5hZGRCdWxsZXQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGIgPSBuZXcgY3JlYXRlanMuU3ByaXRlKGJ1bGxldFNoZWV0KTtcbiAgICBiLnggPSB4O1xuICAgIGIueSA9IHk7XG5cbiAgICBiLmdvdG9BbmRQbGF5KDApO1xuICAgIGJ1bGxldHMuYWRkQ2hpbGQoYik7XG4gICAgc3RhZ2UudXBkYXRlKCk7XG4gIH1cblxuICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIHVwZGF0ZSBidWxsZXRzXG4gICAgZm9yKHZhciBqID0gMDsgaiA8IGJ1bGxldHMuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgIGJ1bGxldHMuY2hpbGRyZW5bal0ueCArPSAyMDtcblxuICAgICAgLy8gcmVtb3ZlIG9mZnN0YWdlIGJ1bGxldHMgXG4gICAgICBpZihidWxsZXRzLmNoaWxkcmVuW2pdLnggPiBXSURUSCArIDEwKSB7XG4gICAgICAgIGJ1bGxldHMucmVtb3ZlQ2hpbGRBdChqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuXG4iLCJmdW5jdGlvbiBGaXNoKCkge1xuICB0aGlzLkhFSUdIVCA9IDMzO1xuICB0aGlzLldJRFRIID0gNTA7XG5cbiAgdmFyIGZpc2gxRGF0YSA9IHtcbiAgICBpbWFnZXM6IFtcImltZy9maXNoMi5wbmdcIl0sXG4gICAgZnJhbWVzOiB7d2lkdGg6NTAsIGhlaWdodDozM30sXG4gICAgZnJhbWVyYXRlOiAxMixcbiAgfTtcbiAgdmFyIGZpc2gxU2hlZXQgPSBuZXcgY3JlYXRlanMuU3ByaXRlU2hlZXQoZmlzaDFEYXRhKTtcbiAgdmFyIHNwcml0ZSA9IG5ldyBjcmVhdGVqcy5TcHJpdGUoZmlzaDFTaGVldCk7XG4gIHNwcml0ZS5nb3RvQW5kUGxheSgwKTtcblxuICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcbn1cblxuIiwiZnVuY3Rpb24gRW5lbXlNYW5hZ2VyKHN0YWdlKSB7XG4gIHZhciBlbmVtaWVzID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpO1xuICB0aGlzLmVuZW1pZXMgPSBlbmVtaWVzO1xuXG4gIGZ1bmN0aW9uIGFkZEVuZW15KCkge1xuICAgIHZhciBmaXNoMSA9IG5ldyBGaXNoKCk7IFxuICAgIGZpc2gxLnNwcml0ZS54ID0gV0lEVEggLSA1MDsgXG4gICAgZmlzaDEuc3ByaXRlLnkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoSEVJR0hUIC0gMzMpKSArIDMzO1xuICAgIGVuZW1pZXMuYWRkQ2hpbGQoZmlzaDEuc3ByaXRlKTtcbiAgICBzdGFnZS51cGRhdGUoKTtcbiAgfVxuXG4gIHZhciB0aW1lclNvdXJjZSA9IHNldEludGVydmFsKGFkZEVuZW15LCAxMDAwKTsgXG5cbiAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyB1cGRhdGUgZW5lbWllc1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCB0aGlzLmVuZW1pZXMuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgIHRoaXMuZW5lbWllcy5jaGlsZHJlbltqXS54IC09IDU7XG5cbiAgICAgIC8vIHJlbW92ZSBvZmZzdGFnZSBlbmVtaWVzXG4gICAgICBpZih0aGlzLmVuZW1pZXMuY2hpbGRyZW5bal0ueCA8IC0yNSlcbiAgICAgICAgdGhpcy5lbmVtaWVzLnJlbW92ZUNoaWxkQXQoaik7XG4gICAgfVxuICB9XG59XG4iLCJmdW5jdGlvbiBEb2xwaGluKHN0YWdlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5IRUlHSFQgPSA5ODtcbiAgdGhpcy5XSURUSCA9IDE1MDtcblxuICB2YXIgYnVsbGV0TWdyID0gbmV3IEJ1bGxldE1hbmFnZXIoc3RhZ2UpO1xuICB0aGlzLmJ1bGxldE1nciA9IGJ1bGxldE1ncjtcblxuICBzdGFnZS5hZGRDaGlsZCh0aGlzLmJ1bGxldE1nci5idWxsZXRzKTtcblxuICB2YXIgZG9scGhpbkRhdGEgPSB7XG4gICAgaW1hZ2VzOiBbXCJpbWcvZG9scGhpbjIucG5nXCJdLFxuICAgIGZyYW1lczoge3dpZHRoOnRoaXMuV0lEVEgsIGhlaWdodDp0aGlzLkhFSUdIVH0sXG4gICAgZnJhbWVyYXRlOiAxMixcbiAgfTtcbiAgdmFyIGRvbHBoaW5TaGVldCA9IG5ldyBjcmVhdGVqcy5TcHJpdGVTaGVldChkb2xwaGluRGF0YSk7XG4gIHZhciBkb2xwaGluID0gbmV3IGNyZWF0ZWpzLlNwcml0ZShkb2xwaGluU2hlZXQpO1xuICBkb2xwaGluLmdvdG9BbmRQbGF5KDApO1xuXG4gIHRoaXMuc3ByaXRlID0gZG9scGhpbjtcblxuICBmdW5jdGlvbiBzaG9vdCgpIHtcbiAgICBidWxsZXRNZ3IuYWRkQnVsbGV0KFxuICAgICAgZG9scGhpbi54ICsgc2VsZi5XSURUSCxcbiAgICAgIGRvbHBoaW4ueSArIHNlbGYuSEVJR0hULzJcbiAgICApO1xuICB9XG5cbiAgdmFyIHNob290Q291bnRlciA9IDA7XG5cbiAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihrZXlzKSB7XG4gICAgLy8gbW92ZSBkb2xwaGluXG4gICAgaWYgKGtleXNbTEVGVF0pICBkb2xwaGluLnggLT0gMTU7XG4gICAgaWYgKGtleXNbVVBdKSAgICBkb2xwaGluLnkgLT0gMTU7XG4gICAgaWYgKGtleXNbUklHSFRdKSBkb2xwaGluLnggKz0gMTU7XG4gICAgaWYgKGtleXNbRE9XTl0pICBkb2xwaGluLnkgKz0gMTU7XG5cbiAgICAvLyB3YWxsIGNvbGxpc2lvblxuICAgIGlmIChkb2xwaGluLnggPCAtdGhpcy5XSURUSC8yKSBkb2xwaGluLnggPSAtdGhpcy5XSURUSC8yO1xuICAgIGlmIChkb2xwaGluLnkgPCAtdGhpcy5IRUlHSFQvMikgZG9scGhpbi55ID0gLXRoaXMuSEVJR0hULzI7XG4gICAgaWYgKGRvbHBoaW4ueCA+IFdJRFRIIC0gdGhpcy5XSURUSC8yKSBkb2xwaGluLnggPSBXSURUSCAtIHRoaXMuV0lEVEgvMjtcbiAgICBpZiAoZG9scGhpbi55ID4gSEVJR0hUIC0gdGhpcy5IRUlHSFQvMikgZG9scGhpbi55ID0gSEVJR0hUIC0gdGhpcy5IRUlHSFQvMjtcblxuICAgIC8vIHNob290aW5nXG4gICAgaWYgKGtleXNbU1BBQ0VdKSB7XG4gICAgICBpZiAoc2hvb3RDb3VudGVyID09IDApIHNob290KClcbiAgICAgIHNob290Q291bnRlciA9IChzaG9vdENvdW50ZXIgKyAxKSAlIDM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNob290Q291bnRlciA9IDA7XG4gICAgfVxuXG4gICAgYnVsbGV0TWdyLnVwZGF0ZSgpO1xuICB9XG5cbn1cblxuIiwiZnVuY3Rpb24gU2NvcmVNYW5hZ2VyKHN0YWdlKSB7XG4gIHZhciBzY29yZSA9IDA7XG4gIHRoaXMuc2NvcmUgPSBzY29yZTtcbiAgdmFyIHNjb3JlVGV4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KCcwJywgJ2JvbGQgMjBweCBDb3VyaWVyIE5ldycsICcjRkZGRkZGJyk7XG4gIHNjb3JlVGV4dC5tYXhXaWR0aCA9IDEwMDA7XG4gIHNjb3JlVGV4dC55ID0gMTA7XG4gIHNjb3JlVGV4dC54ID0gMTA7XG4gIHRoaXMuc2NvcmVUZXh0ID0gc2NvcmVUZXh0O1xuXG4gIHRoaXMuYWRkID0gZnVuY3Rpb24oYW10KSB7XG4gICAgc2NvcmUgKz0gYW10O1xuICB9XG4gIFxuICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHNjb3JlVGV4dC50ZXh0ID0gc2NvcmU7IFxuICB9XG59XG5cbiJdfQ==
