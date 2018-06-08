var LEFT  = 37;
var UP    = 38;
var RIGHT = 39;
var DOWN  = 40;
var SPACE = 32;
var HEIGHT = 480;
var WIDTH = 640;

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
    if (bg1.x < -WIDTH) bg1.x = WIDTH;
    if (bg2.x < -WIDTH) bg2.x = WIDTH;

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
    
