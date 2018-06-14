var LEFT  = 37;
var UP    = 38;
var RIGHT = 39;
var DOWN  = 40;
var SPACE = 32;
var HEIGHT = 480;
var WIDTH = 640;
var BEGIN = 1;
var GAME = 2;
var END = 3;

function init() {
  var state = BEGIN;
  var keys = {};
  var stage = new createjs.Stage("demoCanvas");

  var gameOverText = new createjs.Text("Press any key to play again", "24px Arial", "#ffffff");
  gameOverText.y = HEIGHT/2;
  gameOverText.x = WIDTH/2 - 120;
  var startText = new createjs.Text("Press any key to begin", "24px Arial", "#ffffff");
  startText.y = HEIGHT/2;
  startText.x = WIDTH/2 - 100;

  var bg1 = new createjs.Bitmap("img/bg.png");
  var bg2 = new createjs.Bitmap("img/bg.png");
  stage.addChild(bg1, bg2, startText);
  bg2.x = WIDTH;

  var enemyMgr = new EnemyManager(stage);
  var scoreMgr = new ScoreManager(stage);
  var lifeMgr = new LifeManager(stage, WIDTH - 16*3 - 10, HEIGHT - 16 - 10);
  var dolphin = new Dolphin(stage);

  function startGame() {
    state = GAME;
    stage.removeAllChildren();
    stage.addChild(bg1, bg2);
    stage.addChild(enemyMgr.enemies);
    stage.addChild(scoreMgr.scoreText);
    stage.addChild(dolphin.sprite);
    stage.addChild(dolphin.bulletMgr.bullets);
    stage.addChild(lifeMgr.lives);
    dolphin.sprite.x = 0;
    dolphin.sprite.y = 0;
    enemyMgr.start();
  }

  this.document.onkeydown = keydown;
  this.document.onkeyup = keyup;

  createjs.Ticker.addEventListener("tick", handleTick);

  function keydown(event) {
    keys[event.keyCode] = true;
    if (state == END || state == BEGIN) {
      stage.removeChild(gameOverText);
      stage.removeChild(startText);
      state = GAME;
      startGame();
    }
  }

  function keyup(event) {
    delete keys[event.keyCode];
  }

  function handleTickBegin(event) {
    // scrolling bg
    bg1.x -= 7;
    bg2.x -= 7;
    if (bg1.x < -WIDTH + 7) bg1.x = WIDTH;
    if (bg2.x < -WIDTH + 7) bg2.x = WIDTH;
    stage.update(event);
  }

  function handleTickEnd(event) {
    // scrolling bg
    bg1.x -= 7;
    bg2.x -= 7;
    if (bg1.x < -WIDTH + 7) bg1.x = WIDTH;
    if (bg2.x < -WIDTH + 7) bg2.x = WIDTH;
    stage.update(event);
  }

  function handleTickGame(event) {
    // scrolling bg
    bg1.x -= 7;
    bg2.x -= 7;
    if (bg1.x < -WIDTH + 7) bg1.x = WIDTH;
    if (bg2.x < -WIDTH + 7) bg2.x = WIDTH;

    enemyMgr.update();
    dolphin.update(keys);

    for (var k = 0; k < enemyMgr.enemies.children.length; k++) {
      var cont = false;
      // test for enemy/bullet collision
      for (var j = 0; j < dolphin.bulletMgr.bullets.children.length; j++) {
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
          cont = true;
          break;
        }
      }

      if (cont) continue;

      // test for enemy player collision
      if (dolphin.sprite.y + 5 < enemyMgr.enemies.children[k].y + 33 &&
          dolphin.sprite.y + dolphin.HEIGHT - 5 > enemyMgr.enemies.children[k].y &&
          dolphin.sprite.x + 5 < enemyMgr.enemies.children[k].x + 50 &&
          dolphin.sprite.x + dolphin.WIDTH - 5 > enemyMgr.enemies.children[k].x 
      ) {
        console.log("hit");
        enemyMgr.enemies.removeChildAt(k);
        var dead = lifeMgr.hurt();
        if (dead) {
          endGame();
        }
      }
    }

    scoreMgr.update();
    stage.update(event);
  }

  function endGame() {
    state = END;
    enemyMgr.stop();
    enemyMgr.reset();
    dolphin.reset();
    scoreMgr.reset();
    lifeMgr.reset();
    stage.removeAllChildren();
    stage.addChild(bg1, bg2, gameOverText);
  }

  function handleTick(event) {
    switch (state) {
      case BEGIN: handleTickBegin(event); break;
      case GAME: handleTickGame(event); break;
      case END: handleTickEnd(event); break;
      default: console.err("INVALID GAME STATE!"); break;
    }
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

  this.reset = function() {
    for (var i = 0; i < bullets.children.length; i++) {
      bullets.removeChildAt(i);
    }
  }

}


function Fish() {
  this.HEIGHT = 32;
  this.WIDTH = 32;

  var fish1Data = {
    images: ["img/fish1.png"],
    frames: {width:this.WIDTH, height:this.HEIGHT},
    framerate: 4,
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

  var timerSource = 0;

  this.start = function() {
    timerSource = setInterval(addEnemy, 1000); 
  }

  this.update = function() {
    // update enemies
    for(var j = 0; j < this.enemies.children.length; j++) {
      this.enemies.children[j].x -= 5;

      // remove offstage enemies
      if(this.enemies.children[j].x < -25)
        this.enemies.removeChildAt(j);
    }
  }

  this.stop = function() {
    clearInterval(timerSource);
  }


  this.reset = function() {
    for (var i = 0; i < this.enemies.children.length; i++) {
      this.enemies.removeChildAt(i);
    }
  }
}

function LifeManager(stage, x, y) {
  this.MAX_LIVES = 3;
  var lives = new createjs.Container();
  this.lives = lives;

  // lose a life, returns true if 0 lives
  this.hurt = function() {
    lives.removeChildAt(lives.children.length - 1);
    return lives.children.length <= 0;
  }

  this.reset = function() {
    for (var i = 0; i < lives.children.length; i++) {
      this.lives.removeChildAt(i);
    }
    for (var i = 0; i < this.MAX_LIVES; i++) {
      var sprite = new createjs.Bitmap("img/heart.png");
      sprite.x = x + i * 16;
      sprite.y = y;
      lives.addChild(sprite);
    }
  }

  this.reset();

}

function Dolphin(stage) {
  var self = this;
  this.HEIGHT = 98;
  this.WIDTH = 150;

  var bulletMgr = new BulletManager(stage);
  this.bulletMgr = bulletMgr;

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

  this.reset = function() {
    bulletMgr.reset();
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

  this.reset = function() {
    score = 0;
    scoreText.text = "0"
  }
}


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImJ1bGxldE1hbmFnZXIuanMiLCJlbmVteS5qcyIsImVuZW15TWFuYWdlci5qcyIsImxpZmVNYW5hZ2VyLmpzIiwicGxheWVyLmpzIiwic2NvcmVNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgTEVGVCAgPSAzNztcbnZhciBVUCAgICA9IDM4O1xudmFyIFJJR0hUID0gMzk7XG52YXIgRE9XTiAgPSA0MDtcbnZhciBTUEFDRSA9IDMyO1xudmFyIEhFSUdIVCA9IDQ4MDtcbnZhciBXSURUSCA9IDY0MDtcbnZhciBCRUdJTiA9IDE7XG52YXIgR0FNRSA9IDI7XG52YXIgRU5EID0gMztcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIHN0YXRlID0gQkVHSU47XG4gIHZhciBrZXlzID0ge307XG4gIHZhciBzdGFnZSA9IG5ldyBjcmVhdGVqcy5TdGFnZShcImRlbW9DYW52YXNcIik7XG5cbiAgdmFyIGdhbWVPdmVyVGV4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KFwiUHJlc3MgYW55IGtleSB0byBwbGF5IGFnYWluXCIsIFwiMjRweCBBcmlhbFwiLCBcIiNmZmZmZmZcIik7XG4gIGdhbWVPdmVyVGV4dC55ID0gSEVJR0hULzI7XG4gIGdhbWVPdmVyVGV4dC54ID0gV0lEVEgvMiAtIDEyMDtcbiAgdmFyIHN0YXJ0VGV4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KFwiUHJlc3MgYW55IGtleSB0byBiZWdpblwiLCBcIjI0cHggQXJpYWxcIiwgXCIjZmZmZmZmXCIpO1xuICBzdGFydFRleHQueSA9IEhFSUdIVC8yO1xuICBzdGFydFRleHQueCA9IFdJRFRILzIgLSAxMDA7XG5cbiAgdmFyIGJnMSA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoXCJpbWcvYmcucG5nXCIpO1xuICB2YXIgYmcyID0gbmV3IGNyZWF0ZWpzLkJpdG1hcChcImltZy9iZy5wbmdcIik7XG4gIHN0YWdlLmFkZENoaWxkKGJnMSwgYmcyLCBzdGFydFRleHQpO1xuICBiZzIueCA9IFdJRFRIO1xuXG4gIHZhciBlbmVteU1nciA9IG5ldyBFbmVteU1hbmFnZXIoc3RhZ2UpO1xuICB2YXIgc2NvcmVNZ3IgPSBuZXcgU2NvcmVNYW5hZ2VyKHN0YWdlKTtcbiAgdmFyIGxpZmVNZ3IgPSBuZXcgTGlmZU1hbmFnZXIoc3RhZ2UsIFdJRFRIIC0gMTYqMyAtIDEwLCBIRUlHSFQgLSAxNiAtIDEwKTtcbiAgdmFyIGRvbHBoaW4gPSBuZXcgRG9scGhpbihzdGFnZSk7XG5cbiAgZnVuY3Rpb24gc3RhcnRHYW1lKCkge1xuICAgIHN0YXRlID0gR0FNRTtcbiAgICBzdGFnZS5yZW1vdmVBbGxDaGlsZHJlbigpO1xuICAgIHN0YWdlLmFkZENoaWxkKGJnMSwgYmcyKTtcbiAgICBzdGFnZS5hZGRDaGlsZChlbmVteU1nci5lbmVtaWVzKTtcbiAgICBzdGFnZS5hZGRDaGlsZChzY29yZU1nci5zY29yZVRleHQpO1xuICAgIHN0YWdlLmFkZENoaWxkKGRvbHBoaW4uc3ByaXRlKTtcbiAgICBzdGFnZS5hZGRDaGlsZChkb2xwaGluLmJ1bGxldE1nci5idWxsZXRzKTtcbiAgICBzdGFnZS5hZGRDaGlsZChsaWZlTWdyLmxpdmVzKTtcbiAgICBkb2xwaGluLnNwcml0ZS54ID0gMDtcbiAgICBkb2xwaGluLnNwcml0ZS55ID0gMDtcbiAgICBlbmVteU1nci5zdGFydCgpO1xuICB9XG5cbiAgdGhpcy5kb2N1bWVudC5vbmtleWRvd24gPSBrZXlkb3duO1xuICB0aGlzLmRvY3VtZW50Lm9ua2V5dXAgPSBrZXl1cDtcblxuICBjcmVhdGVqcy5UaWNrZXIuYWRkRXZlbnRMaXN0ZW5lcihcInRpY2tcIiwgaGFuZGxlVGljayk7XG5cbiAgZnVuY3Rpb24ga2V5ZG93bihldmVudCkge1xuICAgIGtleXNbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xuICAgIGlmIChzdGF0ZSA9PSBFTkQgfHwgc3RhdGUgPT0gQkVHSU4pIHtcbiAgICAgIHN0YWdlLnJlbW92ZUNoaWxkKGdhbWVPdmVyVGV4dCk7XG4gICAgICBzdGFnZS5yZW1vdmVDaGlsZChzdGFydFRleHQpO1xuICAgICAgc3RhdGUgPSBHQU1FO1xuICAgICAgc3RhcnRHYW1lKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24ga2V5dXAoZXZlbnQpIHtcbiAgICBkZWxldGUga2V5c1tldmVudC5rZXlDb2RlXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVRpY2tCZWdpbihldmVudCkge1xuICAgIC8vIHNjcm9sbGluZyBiZ1xuICAgIGJnMS54IC09IDc7XG4gICAgYmcyLnggLT0gNztcbiAgICBpZiAoYmcxLnggPCAtV0lEVEggKyA3KSBiZzEueCA9IFdJRFRIO1xuICAgIGlmIChiZzIueCA8IC1XSURUSCArIDcpIGJnMi54ID0gV0lEVEg7XG4gICAgc3RhZ2UudXBkYXRlKGV2ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVRpY2tFbmQoZXZlbnQpIHtcbiAgICAvLyBzY3JvbGxpbmcgYmdcbiAgICBiZzEueCAtPSA3O1xuICAgIGJnMi54IC09IDc7XG4gICAgaWYgKGJnMS54IDwgLVdJRFRIICsgNykgYmcxLnggPSBXSURUSDtcbiAgICBpZiAoYmcyLnggPCAtV0lEVEggKyA3KSBiZzIueCA9IFdJRFRIO1xuICAgIHN0YWdlLnVwZGF0ZShldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVUaWNrR2FtZShldmVudCkge1xuICAgIC8vIHNjcm9sbGluZyBiZ1xuICAgIGJnMS54IC09IDc7XG4gICAgYmcyLnggLT0gNztcbiAgICBpZiAoYmcxLnggPCAtV0lEVEggKyA3KSBiZzEueCA9IFdJRFRIO1xuICAgIGlmIChiZzIueCA8IC1XSURUSCArIDcpIGJnMi54ID0gV0lEVEg7XG5cbiAgICBlbmVteU1nci51cGRhdGUoKTtcbiAgICBkb2xwaGluLnVwZGF0ZShrZXlzKTtcblxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbi5sZW5ndGg7IGsrKykge1xuICAgICAgdmFyIGNvbnQgPSBmYWxzZTtcbiAgICAgIC8vIHRlc3QgZm9yIGVuZW15L2J1bGxldCBjb2xsaXNpb25cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZG9scGhpbi5idWxsZXRNZ3IuYnVsbGV0cy5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICAvLyByZWZlcmVuY2UgaXMgaW4gY2VudGVyIG9mIGJ1bGxldCwgc28gZ2l2ZSArLy0gNSByYWRpdXNcbiAgICAgICAgaWYgKGRvbHBoaW4uYnVsbGV0TWdyLmJ1bGxldHMuY2hpbGRyZW5bal0ueSArIDUgPiBlbmVteU1nci5lbmVtaWVzLmNoaWxkcmVuW2tdLnkgLSA1ICYmIFxuICAgICAgICAgICAgZG9scGhpbi5idWxsZXRNZ3IuYnVsbGV0cy5jaGlsZHJlbltqXS55ICsgNSA8IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW5ba10ueSArIDMzICsgNSAmJlxuICAgICAgICAgICAgZG9scGhpbi5idWxsZXRNZ3IuYnVsbGV0cy5jaGlsZHJlbltqXS54ICsgNSA+IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW5ba10ueCAtIDUgJiZcbiAgICAgICAgICAgIGRvbHBoaW4uYnVsbGV0TWdyLmJ1bGxldHMuY2hpbGRyZW5bal0ueCArIDUgPCBlbmVteU1nci5lbmVtaWVzLmNoaWxkcmVuW2tdLnggKyA1MCArIDVcbiAgICAgICAgKSB7IFxuICAgICAgICAgIGRvbHBoaW4uYnVsbGV0TWdyLmJ1bGxldHMucmVtb3ZlQ2hpbGRBdChqKTsgXG4gICAgICAgICAgZW5lbXlNZ3IuZW5lbWllcy5yZW1vdmVDaGlsZEF0KGspOyBcbiAgICAgICAgICBzdGFnZS51cGRhdGUoKTsgXG4gICAgICAgICAgc2NvcmVNZ3IuYWRkKDEwKTtcbiAgICAgICAgICBjb250ID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY29udCkgY29udGludWU7XG5cbiAgICAgIC8vIHRlc3QgZm9yIGVuZW15IHBsYXllciBjb2xsaXNpb25cbiAgICAgIGlmIChkb2xwaGluLnNwcml0ZS55ICsgNSA8IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW5ba10ueSArIDMzICYmXG4gICAgICAgICAgZG9scGhpbi5zcHJpdGUueSArIGRvbHBoaW4uSEVJR0hUIC0gNSA+IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW5ba10ueSAmJlxuICAgICAgICAgIGRvbHBoaW4uc3ByaXRlLnggKyA1IDwgZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbltrXS54ICsgNTAgJiZcbiAgICAgICAgICBkb2xwaGluLnNwcml0ZS54ICsgZG9scGhpbi5XSURUSCAtIDUgPiBlbmVteU1nci5lbmVtaWVzLmNoaWxkcmVuW2tdLnggXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJoaXRcIik7XG4gICAgICAgIGVuZW15TWdyLmVuZW1pZXMucmVtb3ZlQ2hpbGRBdChrKTtcbiAgICAgICAgdmFyIGRlYWQgPSBsaWZlTWdyLmh1cnQoKTtcbiAgICAgICAgaWYgKGRlYWQpIHtcbiAgICAgICAgICBlbmRHYW1lKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY29yZU1nci51cGRhdGUoKTtcbiAgICBzdGFnZS51cGRhdGUoZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZW5kR2FtZSgpIHtcbiAgICBzdGF0ZSA9IEVORDtcbiAgICBlbmVteU1nci5zdG9wKCk7XG4gICAgZW5lbXlNZ3IucmVzZXQoKTtcbiAgICBkb2xwaGluLnJlc2V0KCk7XG4gICAgc2NvcmVNZ3IucmVzZXQoKTtcbiAgICBsaWZlTWdyLnJlc2V0KCk7XG4gICAgc3RhZ2UucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICBzdGFnZS5hZGRDaGlsZChiZzEsIGJnMiwgZ2FtZU92ZXJUZXh0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVRpY2soZXZlbnQpIHtcbiAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICBjYXNlIEJFR0lOOiBoYW5kbGVUaWNrQmVnaW4oZXZlbnQpOyBicmVhaztcbiAgICAgIGNhc2UgR0FNRTogaGFuZGxlVGlja0dhbWUoZXZlbnQpOyBicmVhaztcbiAgICAgIGNhc2UgRU5EOiBoYW5kbGVUaWNrRW5kKGV2ZW50KTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiBjb25zb2xlLmVycihcIklOVkFMSUQgR0FNRSBTVEFURSFcIik7IGJyZWFrO1xuICAgIH1cbiAgfVxufVxuICAgIFxuIiwiZnVuY3Rpb24gQnVsbGV0TWFuYWdlcihzdGFnZSkge1xuICB2YXIgYnVsbGV0cyA9IG5ldyBjcmVhdGVqcy5Db250YWluZXIoKTtcbiAgdGhpcy5idWxsZXRzID0gYnVsbGV0cztcblxuICB2YXIgYnVsbGV0RGF0YSA9IHtcbiAgICBpbWFnZXM6IFtcImltZy9idWxsZXQucG5nXCJdLFxuICAgIGZyYW1lczoge3dpZHRoOjEwLGhlaWdodDoxMH0sXG4gICAgZnJhbWVyYXRlOiAxMixcbiAgfTtcbiAgdmFyIGJ1bGxldFNoZWV0ID0gbmV3IGNyZWF0ZWpzLlNwcml0ZVNoZWV0KGJ1bGxldERhdGEpO1xuXG4gIHRoaXMuYWRkQnVsbGV0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBiID0gbmV3IGNyZWF0ZWpzLlNwcml0ZShidWxsZXRTaGVldCk7XG4gICAgYi54ID0geDtcbiAgICBiLnkgPSB5O1xuXG4gICAgYi5nb3RvQW5kUGxheSgwKTtcbiAgICBidWxsZXRzLmFkZENoaWxkKGIpO1xuICAgIHN0YWdlLnVwZGF0ZSgpO1xuICB9XG5cbiAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyB1cGRhdGUgYnVsbGV0c1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCBidWxsZXRzLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICBidWxsZXRzLmNoaWxkcmVuW2pdLnggKz0gMjA7XG5cbiAgICAgIC8vIHJlbW92ZSBvZmZzdGFnZSBidWxsZXRzIFxuICAgICAgaWYoYnVsbGV0cy5jaGlsZHJlbltqXS54ID4gV0lEVEggKyAxMCkge1xuICAgICAgICBidWxsZXRzLnJlbW92ZUNoaWxkQXQoaik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnVsbGV0cy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgYnVsbGV0cy5yZW1vdmVDaGlsZEF0KGkpO1xuICAgIH1cbiAgfVxuXG59XG5cbiIsImZ1bmN0aW9uIEZpc2goKSB7XG4gIHRoaXMuSEVJR0hUID0gMzI7XG4gIHRoaXMuV0lEVEggPSAzMjtcblxuICB2YXIgZmlzaDFEYXRhID0ge1xuICAgIGltYWdlczogW1wiaW1nL2Zpc2gxLnBuZ1wiXSxcbiAgICBmcmFtZXM6IHt3aWR0aDp0aGlzLldJRFRILCBoZWlnaHQ6dGhpcy5IRUlHSFR9LFxuICAgIGZyYW1lcmF0ZTogNCxcbiAgfTtcbiAgdmFyIGZpc2gxU2hlZXQgPSBuZXcgY3JlYXRlanMuU3ByaXRlU2hlZXQoZmlzaDFEYXRhKTtcbiAgdmFyIHNwcml0ZSA9IG5ldyBjcmVhdGVqcy5TcHJpdGUoZmlzaDFTaGVldCk7XG4gIHNwcml0ZS5nb3RvQW5kUGxheSgwKTtcblxuICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcbn1cblxuIiwiZnVuY3Rpb24gRW5lbXlNYW5hZ2VyKHN0YWdlKSB7XG4gIHZhciBlbmVtaWVzID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpO1xuICB0aGlzLmVuZW1pZXMgPSBlbmVtaWVzO1xuXG4gIGZ1bmN0aW9uIGFkZEVuZW15KCkge1xuICAgIHZhciBmaXNoMSA9IG5ldyBGaXNoKCk7IFxuICAgIGZpc2gxLnNwcml0ZS54ID0gV0lEVEggLSA1MDsgXG4gICAgZmlzaDEuc3ByaXRlLnkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoSEVJR0hUIC0gMzMpKSArIDMzO1xuICAgIGVuZW1pZXMuYWRkQ2hpbGQoZmlzaDEuc3ByaXRlKTtcbiAgICBzdGFnZS51cGRhdGUoKTtcbiAgfVxuXG4gIHZhciB0aW1lclNvdXJjZSA9IDA7XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRpbWVyU291cmNlID0gc2V0SW50ZXJ2YWwoYWRkRW5lbXksIDEwMDApOyBcbiAgfVxuXG4gIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gdXBkYXRlIGVuZW1pZXNcbiAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5lbmVtaWVzLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICB0aGlzLmVuZW1pZXMuY2hpbGRyZW5bal0ueCAtPSA1O1xuXG4gICAgICAvLyByZW1vdmUgb2Zmc3RhZ2UgZW5lbWllc1xuICAgICAgaWYodGhpcy5lbmVtaWVzLmNoaWxkcmVuW2pdLnggPCAtMjUpXG4gICAgICAgIHRoaXMuZW5lbWllcy5yZW1vdmVDaGlsZEF0KGopO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFySW50ZXJ2YWwodGltZXJTb3VyY2UpO1xuICB9XG5cblxuICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuZW5lbWllcy5yZW1vdmVDaGlsZEF0KGkpO1xuICAgIH1cbiAgfVxufVxuIiwiZnVuY3Rpb24gTGlmZU1hbmFnZXIoc3RhZ2UsIHgsIHkpIHtcbiAgdGhpcy5NQVhfTElWRVMgPSAzO1xuICB2YXIgbGl2ZXMgPSBuZXcgY3JlYXRlanMuQ29udGFpbmVyKCk7XG4gIHRoaXMubGl2ZXMgPSBsaXZlcztcblxuICAvLyBsb3NlIGEgbGlmZSwgcmV0dXJucyB0cnVlIGlmIDAgbGl2ZXNcbiAgdGhpcy5odXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgbGl2ZXMucmVtb3ZlQ2hpbGRBdChsaXZlcy5jaGlsZHJlbi5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gbGl2ZXMuY2hpbGRyZW4ubGVuZ3RoIDw9IDA7XG4gIH1cblxuICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXZlcy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5saXZlcy5yZW1vdmVDaGlsZEF0KGkpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuTUFYX0xJVkVTOyBpKyspIHtcbiAgICAgIHZhciBzcHJpdGUgPSBuZXcgY3JlYXRlanMuQml0bWFwKFwiaW1nL2hlYXJ0LnBuZ1wiKTtcbiAgICAgIHNwcml0ZS54ID0geCArIGkgKiAxNjtcbiAgICAgIHNwcml0ZS55ID0geTtcbiAgICAgIGxpdmVzLmFkZENoaWxkKHNwcml0ZSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5yZXNldCgpO1xuXG59XG4iLCJmdW5jdGlvbiBEb2xwaGluKHN0YWdlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5IRUlHSFQgPSA5ODtcbiAgdGhpcy5XSURUSCA9IDE1MDtcblxuICB2YXIgYnVsbGV0TWdyID0gbmV3IEJ1bGxldE1hbmFnZXIoc3RhZ2UpO1xuICB0aGlzLmJ1bGxldE1nciA9IGJ1bGxldE1ncjtcblxuICB2YXIgZG9scGhpbkRhdGEgPSB7XG4gICAgaW1hZ2VzOiBbXCJpbWcvZG9scGhpbjIucG5nXCJdLFxuICAgIGZyYW1lczoge3dpZHRoOnRoaXMuV0lEVEgsIGhlaWdodDp0aGlzLkhFSUdIVH0sXG4gICAgZnJhbWVyYXRlOiAxMixcbiAgfTtcbiAgdmFyIGRvbHBoaW5TaGVldCA9IG5ldyBjcmVhdGVqcy5TcHJpdGVTaGVldChkb2xwaGluRGF0YSk7XG4gIHZhciBkb2xwaGluID0gbmV3IGNyZWF0ZWpzLlNwcml0ZShkb2xwaGluU2hlZXQpO1xuICBkb2xwaGluLmdvdG9BbmRQbGF5KDApO1xuXG4gIHRoaXMuc3ByaXRlID0gZG9scGhpbjtcblxuICBmdW5jdGlvbiBzaG9vdCgpIHtcbiAgICBidWxsZXRNZ3IuYWRkQnVsbGV0KFxuICAgICAgZG9scGhpbi54ICsgc2VsZi5XSURUSCxcbiAgICAgIGRvbHBoaW4ueSArIHNlbGYuSEVJR0hULzJcbiAgICApO1xuICB9XG5cbiAgdmFyIHNob290Q291bnRlciA9IDA7XG5cbiAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbihrZXlzKSB7XG4gICAgLy8gbW92ZSBkb2xwaGluXG4gICAgaWYgKGtleXNbTEVGVF0pICBkb2xwaGluLnggLT0gMTU7XG4gICAgaWYgKGtleXNbVVBdKSAgICBkb2xwaGluLnkgLT0gMTU7XG4gICAgaWYgKGtleXNbUklHSFRdKSBkb2xwaGluLnggKz0gMTU7XG4gICAgaWYgKGtleXNbRE9XTl0pICBkb2xwaGluLnkgKz0gMTU7XG5cbiAgICAvLyB3YWxsIGNvbGxpc2lvblxuICAgIGlmIChkb2xwaGluLnggPCAtdGhpcy5XSURUSC8yKSBkb2xwaGluLnggPSAtdGhpcy5XSURUSC8yO1xuICAgIGlmIChkb2xwaGluLnkgPCAtdGhpcy5IRUlHSFQvMikgZG9scGhpbi55ID0gLXRoaXMuSEVJR0hULzI7XG4gICAgaWYgKGRvbHBoaW4ueCA+IFdJRFRIIC0gdGhpcy5XSURUSC8yKSBkb2xwaGluLnggPSBXSURUSCAtIHRoaXMuV0lEVEgvMjtcbiAgICBpZiAoZG9scGhpbi55ID4gSEVJR0hUIC0gdGhpcy5IRUlHSFQvMikgZG9scGhpbi55ID0gSEVJR0hUIC0gdGhpcy5IRUlHSFQvMjtcblxuICAgIC8vIHNob290aW5nXG4gICAgaWYgKGtleXNbU1BBQ0VdKSB7XG4gICAgICBpZiAoc2hvb3RDb3VudGVyID09IDApIHNob290KClcbiAgICAgIHNob290Q291bnRlciA9IChzaG9vdENvdW50ZXIgKyAxKSAlIDM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNob290Q291bnRlciA9IDA7XG4gICAgfVxuXG4gICAgYnVsbGV0TWdyLnVwZGF0ZSgpO1xuICB9XG5cbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIGJ1bGxldE1nci5yZXNldCgpO1xuICB9XG5cbn1cblxuIiwiZnVuY3Rpb24gU2NvcmVNYW5hZ2VyKHN0YWdlKSB7XG4gIHZhciBzY29yZSA9IDA7XG4gIHRoaXMuc2NvcmUgPSBzY29yZTtcbiAgdmFyIHNjb3JlVGV4dCA9IG5ldyBjcmVhdGVqcy5UZXh0KCcwJywgJ2JvbGQgMjBweCBDb3VyaWVyIE5ldycsICcjRkZGRkZGJyk7XG4gIHNjb3JlVGV4dC5tYXhXaWR0aCA9IDEwMDA7XG4gIHNjb3JlVGV4dC55ID0gMTA7XG4gIHNjb3JlVGV4dC54ID0gMTA7XG4gIHRoaXMuc2NvcmVUZXh0ID0gc2NvcmVUZXh0O1xuXG4gIHRoaXMuYWRkID0gZnVuY3Rpb24oYW10KSB7XG4gICAgc2NvcmUgKz0gYW10O1xuICB9XG4gIFxuICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHNjb3JlVGV4dC50ZXh0ID0gc2NvcmU7IFxuICB9XG5cbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHNjb3JlID0gMDtcbiAgICBzY29yZVRleHQudGV4dCA9IFwiMFwiXG4gIH1cbn1cblxuIl19
