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

  var lifeMgr = new LifeManager(stage, WIDTH - 16*3 - 10, HEIGHT - 16 - 10);
  stage.addChild(lifeMgr.lives);

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

    for (var k = 0; k < enemyMgr.enemies.children.length; k++) {
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
          break;
        }
      }

      // test for enemy player collision
      if (dolphin.sprite.y + dolphin.HEIGHT/2 > enemyMgr.enemies.children[k].y &&
          dolphin.sprite.y + dolphin.HEIGHT/2 < enemyMgr.enemies.children[k].y + 33 &&
          dolphin.sprite.x + dolphin.WIDTH/2 > enemyMgr.enemies.children[k].x &&
          dolphin.sprite.x + dolphin.WIDTH/2 < enemyMgr.enemies.children[k].x + 50
      ) {
        console.log("hit");
        enemyMgr.enemies.removeChildAt(k);
        var dead = lifeMgr.hurt();
        if (dead) {
          alert("Game Over");
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

function LifeManager(stage, x, y) {
  this.MAX_LIVES = 3;
  var lives = new createjs.Container();
  this.lives = lives;

  for (var i = 0; i < this.MAX_LIVES; i++) {
    var sprite = new createjs.Bitmap("img/heart.png");
    sprite.x = x + i * 16;
    sprite.y = y;
    lives.addChild(sprite);
  }
  
  // lose a life, returns true if 0 lives
  this.hurt = function() {
    lives.removeChildAt(lives.children.length - 1);
    return lives.children.length <= 0;
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImJ1bGxldE1hbmFnZXIuanMiLCJlbmVteS5qcyIsImVuZW15TWFuYWdlci5qcyIsImxpZmVNYW5hZ2VyLmpzIiwicGxheWVyLmpzIiwic2NvcmVNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBMRUZUICA9IDM3O1xudmFyIFVQICAgID0gMzg7XG52YXIgUklHSFQgPSAzOTtcbnZhciBET1dOICA9IDQwO1xudmFyIFNQQUNFID0gMzI7XG52YXIgSEVJR0hUID0gNDgwO1xudmFyIFdJRFRIID0gNjQwO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICB2YXIga2V5cyA9IHt9O1xuICB2YXIgc3RhZ2UgPSBuZXcgY3JlYXRlanMuU3RhZ2UoXCJkZW1vQ2FudmFzXCIpO1xuXG4gIHZhciBiZzEgPSBuZXcgY3JlYXRlanMuQml0bWFwKFwiaW1nL2JnLnBuZ1wiKTtcbiAgdmFyIGJnMiA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoXCJpbWcvYmcucG5nXCIpO1xuICBiZzIueCA9IFdJRFRIO1xuICBzdGFnZS5hZGRDaGlsZChiZzEsIGJnMik7XG5cbiAgdmFyIGVuZW15TWdyID0gbmV3IEVuZW15TWFuYWdlcihzdGFnZSk7XG4gIHN0YWdlLmFkZENoaWxkKGVuZW15TWdyLmVuZW1pZXMpO1xuICBcbiAgdmFyIHNjb3JlTWdyID0gbmV3IFNjb3JlTWFuYWdlcihzdGFnZSk7XG4gIHN0YWdlLmFkZENoaWxkKHNjb3JlTWdyLnNjb3JlVGV4dCk7XG5cbiAgdmFyIGxpZmVNZ3IgPSBuZXcgTGlmZU1hbmFnZXIoc3RhZ2UsIFdJRFRIIC0gMTYqMyAtIDEwLCBIRUlHSFQgLSAxNiAtIDEwKTtcbiAgc3RhZ2UuYWRkQ2hpbGQobGlmZU1nci5saXZlcyk7XG5cbiAgdmFyIGRvbHBoaW4gPSBuZXcgRG9scGhpbihzdGFnZSk7XG4gIHN0YWdlLmFkZENoaWxkKGRvbHBoaW4uc3ByaXRlKTtcblxuICB0aGlzLmRvY3VtZW50Lm9ua2V5ZG93biA9IGtleWRvd247XG4gIHRoaXMuZG9jdW1lbnQub25rZXl1cCA9IGtleXVwO1xuXG4gIGNyZWF0ZWpzLlRpY2tlci5hZGRFdmVudExpc3RlbmVyKFwidGlja1wiLCBoYW5kbGVUaWNrKTtcblxuICBmdW5jdGlvbiBrZXlkb3duKGV2ZW50KSB7XG4gICAga2V5c1tldmVudC5rZXlDb2RlXSA9IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBrZXl1cChldmVudCkge1xuICAgIGRlbGV0ZSBrZXlzW2V2ZW50LmtleUNvZGVdO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlVGljayhldmVudCkge1xuICAgIC8vIHNjcm9sbGluZyBiZ1xuICAgIGJnMS54IC09IDc7XG4gICAgYmcyLnggLT0gNztcbiAgICBpZiAoYmcxLnggPCAtV0lEVEggKyA3KSBiZzEueCA9IFdJRFRIO1xuICAgIGlmIChiZzIueCA8IC1XSURUSCArIDcpIGJnMi54ID0gV0lEVEg7XG5cbiAgICBlbmVteU1nci51cGRhdGUoKTtcbiAgICBkb2xwaGluLnVwZGF0ZShrZXlzKTtcblxuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbi5sZW5ndGg7IGsrKykge1xuICAgICAgLy8gdGVzdCBmb3IgZW5lbXkvYnVsbGV0IGNvbGxpc2lvblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkb2xwaGluLmJ1bGxldE1nci5idWxsZXRzLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIC8vIHJlZmVyZW5jZSBpcyBpbiBjZW50ZXIgb2YgYnVsbGV0LCBzbyBnaXZlICsvLSA1IHJhZGl1c1xuICAgICAgICBpZiAoZG9scGhpbi5idWxsZXRNZ3IuYnVsbGV0cy5jaGlsZHJlbltqXS55ICsgNSA+IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW5ba10ueSAtIDUgJiYgXG4gICAgICAgICAgICBkb2xwaGluLmJ1bGxldE1nci5idWxsZXRzLmNoaWxkcmVuW2pdLnkgKyA1IDwgZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbltrXS55ICsgMzMgKyA1ICYmXG4gICAgICAgICAgICBkb2xwaGluLmJ1bGxldE1nci5idWxsZXRzLmNoaWxkcmVuW2pdLnggKyA1ID4gZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbltrXS54IC0gNSAmJlxuICAgICAgICAgICAgZG9scGhpbi5idWxsZXRNZ3IuYnVsbGV0cy5jaGlsZHJlbltqXS54ICsgNSA8IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW5ba10ueCArIDUwICsgNVxuICAgICAgICApIHsgXG4gICAgICAgICAgZG9scGhpbi5idWxsZXRNZ3IuYnVsbGV0cy5yZW1vdmVDaGlsZEF0KGopOyBcbiAgICAgICAgICBlbmVteU1nci5lbmVtaWVzLnJlbW92ZUNoaWxkQXQoayk7IFxuICAgICAgICAgIHN0YWdlLnVwZGF0ZSgpOyBcbiAgICAgICAgICBzY29yZU1nci5hZGQoMTApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHRlc3QgZm9yIGVuZW15IHBsYXllciBjb2xsaXNpb25cbiAgICAgIGlmIChkb2xwaGluLnNwcml0ZS55ICsgZG9scGhpbi5IRUlHSFQvMiA+IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW5ba10ueSAmJlxuICAgICAgICAgIGRvbHBoaW4uc3ByaXRlLnkgKyBkb2xwaGluLkhFSUdIVC8yIDwgZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbltrXS55ICsgMzMgJiZcbiAgICAgICAgICBkb2xwaGluLnNwcml0ZS54ICsgZG9scGhpbi5XSURUSC8yID4gZW5lbXlNZ3IuZW5lbWllcy5jaGlsZHJlbltrXS54ICYmXG4gICAgICAgICAgZG9scGhpbi5zcHJpdGUueCArIGRvbHBoaW4uV0lEVEgvMiA8IGVuZW15TWdyLmVuZW1pZXMuY2hpbGRyZW5ba10ueCArIDUwXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJoaXRcIik7XG4gICAgICAgIGVuZW15TWdyLmVuZW1pZXMucmVtb3ZlQ2hpbGRBdChrKTtcbiAgICAgICAgdmFyIGRlYWQgPSBsaWZlTWdyLmh1cnQoKTtcbiAgICAgICAgaWYgKGRlYWQpIHtcbiAgICAgICAgICBhbGVydChcIkdhbWUgT3ZlclwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNjb3JlTWdyLnVwZGF0ZSgpO1xuICAgIHN0YWdlLnVwZGF0ZShldmVudCk7XG4gIH1cbn1cbiAgICBcbiIsImZ1bmN0aW9uIEJ1bGxldE1hbmFnZXIoc3RhZ2UpIHtcbiAgdmFyIGJ1bGxldHMgPSBuZXcgY3JlYXRlanMuQ29udGFpbmVyKCk7XG4gIHRoaXMuYnVsbGV0cyA9IGJ1bGxldHM7XG5cbiAgdmFyIGJ1bGxldERhdGEgPSB7XG4gICAgaW1hZ2VzOiBbXCJpbWcvYnVsbGV0LnBuZ1wiXSxcbiAgICBmcmFtZXM6IHt3aWR0aDoxMCxoZWlnaHQ6MTB9LFxuICAgIGZyYW1lcmF0ZTogMTIsXG4gIH07XG4gIHZhciBidWxsZXRTaGVldCA9IG5ldyBjcmVhdGVqcy5TcHJpdGVTaGVldChidWxsZXREYXRhKTtcblxuICB0aGlzLmFkZEJ1bGxldCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgYiA9IG5ldyBjcmVhdGVqcy5TcHJpdGUoYnVsbGV0U2hlZXQpO1xuICAgIGIueCA9IHg7XG4gICAgYi55ID0geTtcblxuICAgIGIuZ290b0FuZFBsYXkoMCk7XG4gICAgYnVsbGV0cy5hZGRDaGlsZChiKTtcbiAgICBzdGFnZS51cGRhdGUoKTtcbiAgfVxuXG4gIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gdXBkYXRlIGJ1bGxldHNcbiAgICBmb3IodmFyIGogPSAwOyBqIDwgYnVsbGV0cy5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgYnVsbGV0cy5jaGlsZHJlbltqXS54ICs9IDIwO1xuXG4gICAgICAvLyByZW1vdmUgb2Zmc3RhZ2UgYnVsbGV0cyBcbiAgICAgIGlmKGJ1bGxldHMuY2hpbGRyZW5bal0ueCA+IFdJRFRIICsgMTApIHtcbiAgICAgICAgYnVsbGV0cy5yZW1vdmVDaGlsZEF0KGopO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG5cbiIsImZ1bmN0aW9uIEZpc2goKSB7XG4gIHRoaXMuSEVJR0hUID0gMzM7XG4gIHRoaXMuV0lEVEggPSA1MDtcblxuICB2YXIgZmlzaDFEYXRhID0ge1xuICAgIGltYWdlczogW1wiaW1nL2Zpc2gyLnBuZ1wiXSxcbiAgICBmcmFtZXM6IHt3aWR0aDo1MCwgaGVpZ2h0OjMzfSxcbiAgICBmcmFtZXJhdGU6IDEyLFxuICB9O1xuICB2YXIgZmlzaDFTaGVldCA9IG5ldyBjcmVhdGVqcy5TcHJpdGVTaGVldChmaXNoMURhdGEpO1xuICB2YXIgc3ByaXRlID0gbmV3IGNyZWF0ZWpzLlNwcml0ZShmaXNoMVNoZWV0KTtcbiAgc3ByaXRlLmdvdG9BbmRQbGF5KDApO1xuXG4gIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xufVxuXG4iLCJmdW5jdGlvbiBFbmVteU1hbmFnZXIoc3RhZ2UpIHtcbiAgdmFyIGVuZW1pZXMgPSBuZXcgY3JlYXRlanMuQ29udGFpbmVyKCk7XG4gIHRoaXMuZW5lbWllcyA9IGVuZW1pZXM7XG5cbiAgZnVuY3Rpb24gYWRkRW5lbXkoKSB7XG4gICAgdmFyIGZpc2gxID0gbmV3IEZpc2goKTsgXG4gICAgZmlzaDEuc3ByaXRlLnggPSBXSURUSCAtIDUwOyBcbiAgICBmaXNoMS5zcHJpdGUueSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChIRUlHSFQgLSAzMykpICsgMzM7XG4gICAgZW5lbWllcy5hZGRDaGlsZChmaXNoMS5zcHJpdGUpO1xuICAgIHN0YWdlLnVwZGF0ZSgpO1xuICB9XG5cbiAgdmFyIHRpbWVyU291cmNlID0gc2V0SW50ZXJ2YWwoYWRkRW5lbXksIDEwMDApOyBcblxuICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIHVwZGF0ZSBlbmVtaWVzXG4gICAgZm9yKHZhciBqID0gMDsgaiA8IHRoaXMuZW5lbWllcy5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgdGhpcy5lbmVtaWVzLmNoaWxkcmVuW2pdLnggLT0gNTtcblxuICAgICAgLy8gcmVtb3ZlIG9mZnN0YWdlIGVuZW1pZXNcbiAgICAgIGlmKHRoaXMuZW5lbWllcy5jaGlsZHJlbltqXS54IDwgLTI1KVxuICAgICAgICB0aGlzLmVuZW1pZXMucmVtb3ZlQ2hpbGRBdChqKTtcbiAgICB9XG4gIH1cbn1cbiIsImZ1bmN0aW9uIExpZmVNYW5hZ2VyKHN0YWdlLCB4LCB5KSB7XG4gIHRoaXMuTUFYX0xJVkVTID0gMztcbiAgdmFyIGxpdmVzID0gbmV3IGNyZWF0ZWpzLkNvbnRhaW5lcigpO1xuICB0aGlzLmxpdmVzID0gbGl2ZXM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLk1BWF9MSVZFUzsgaSsrKSB7XG4gICAgdmFyIHNwcml0ZSA9IG5ldyBjcmVhdGVqcy5CaXRtYXAoXCJpbWcvaGVhcnQucG5nXCIpO1xuICAgIHNwcml0ZS54ID0geCArIGkgKiAxNjtcbiAgICBzcHJpdGUueSA9IHk7XG4gICAgbGl2ZXMuYWRkQ2hpbGQoc3ByaXRlKTtcbiAgfVxuICBcbiAgLy8gbG9zZSBhIGxpZmUsIHJldHVybnMgdHJ1ZSBpZiAwIGxpdmVzXG4gIHRoaXMuaHVydCA9IGZ1bmN0aW9uKCkge1xuICAgIGxpdmVzLnJlbW92ZUNoaWxkQXQobGl2ZXMuY2hpbGRyZW4ubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIGxpdmVzLmNoaWxkcmVuLmxlbmd0aCA8PSAwO1xuICB9XG5cbn1cbiIsImZ1bmN0aW9uIERvbHBoaW4oc3RhZ2UpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLkhFSUdIVCA9IDk4O1xuICB0aGlzLldJRFRIID0gMTUwO1xuXG4gIHZhciBidWxsZXRNZ3IgPSBuZXcgQnVsbGV0TWFuYWdlcihzdGFnZSk7XG4gIHRoaXMuYnVsbGV0TWdyID0gYnVsbGV0TWdyO1xuXG4gIHN0YWdlLmFkZENoaWxkKHRoaXMuYnVsbGV0TWdyLmJ1bGxldHMpO1xuXG4gIHZhciBkb2xwaGluRGF0YSA9IHtcbiAgICBpbWFnZXM6IFtcImltZy9kb2xwaGluMi5wbmdcIl0sXG4gICAgZnJhbWVzOiB7d2lkdGg6dGhpcy5XSURUSCwgaGVpZ2h0OnRoaXMuSEVJR0hUfSxcbiAgICBmcmFtZXJhdGU6IDEyLFxuICB9O1xuICB2YXIgZG9scGhpblNoZWV0ID0gbmV3IGNyZWF0ZWpzLlNwcml0ZVNoZWV0KGRvbHBoaW5EYXRhKTtcbiAgdmFyIGRvbHBoaW4gPSBuZXcgY3JlYXRlanMuU3ByaXRlKGRvbHBoaW5TaGVldCk7XG4gIGRvbHBoaW4uZ290b0FuZFBsYXkoMCk7XG5cbiAgdGhpcy5zcHJpdGUgPSBkb2xwaGluO1xuXG4gIGZ1bmN0aW9uIHNob290KCkge1xuICAgIGJ1bGxldE1nci5hZGRCdWxsZXQoXG4gICAgICBkb2xwaGluLnggKyBzZWxmLldJRFRILFxuICAgICAgZG9scGhpbi55ICsgc2VsZi5IRUlHSFQvMlxuICAgICk7XG4gIH1cblxuICB2YXIgc2hvb3RDb3VudGVyID0gMDtcblxuICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGtleXMpIHtcbiAgICAvLyBtb3ZlIGRvbHBoaW5cbiAgICBpZiAoa2V5c1tMRUZUXSkgIGRvbHBoaW4ueCAtPSAxNTtcbiAgICBpZiAoa2V5c1tVUF0pICAgIGRvbHBoaW4ueSAtPSAxNTtcbiAgICBpZiAoa2V5c1tSSUdIVF0pIGRvbHBoaW4ueCArPSAxNTtcbiAgICBpZiAoa2V5c1tET1dOXSkgIGRvbHBoaW4ueSArPSAxNTtcblxuICAgIC8vIHdhbGwgY29sbGlzaW9uXG4gICAgaWYgKGRvbHBoaW4ueCA8IC10aGlzLldJRFRILzIpIGRvbHBoaW4ueCA9IC10aGlzLldJRFRILzI7XG4gICAgaWYgKGRvbHBoaW4ueSA8IC10aGlzLkhFSUdIVC8yKSBkb2xwaGluLnkgPSAtdGhpcy5IRUlHSFQvMjtcbiAgICBpZiAoZG9scGhpbi54ID4gV0lEVEggLSB0aGlzLldJRFRILzIpIGRvbHBoaW4ueCA9IFdJRFRIIC0gdGhpcy5XSURUSC8yO1xuICAgIGlmIChkb2xwaGluLnkgPiBIRUlHSFQgLSB0aGlzLkhFSUdIVC8yKSBkb2xwaGluLnkgPSBIRUlHSFQgLSB0aGlzLkhFSUdIVC8yO1xuXG4gICAgLy8gc2hvb3RpbmdcbiAgICBpZiAoa2V5c1tTUEFDRV0pIHtcbiAgICAgIGlmIChzaG9vdENvdW50ZXIgPT0gMCkgc2hvb3QoKVxuICAgICAgc2hvb3RDb3VudGVyID0gKHNob290Q291bnRlciArIDEpICUgMztcbiAgICB9IGVsc2Uge1xuICAgICAgc2hvb3RDb3VudGVyID0gMDtcbiAgICB9XG5cbiAgICBidWxsZXRNZ3IudXBkYXRlKCk7XG4gIH1cblxufVxuXG4iLCJmdW5jdGlvbiBTY29yZU1hbmFnZXIoc3RhZ2UpIHtcbiAgdmFyIHNjb3JlID0gMDtcbiAgdGhpcy5zY29yZSA9IHNjb3JlO1xuICB2YXIgc2NvcmVUZXh0ID0gbmV3IGNyZWF0ZWpzLlRleHQoJzAnLCAnYm9sZCAyMHB4IENvdXJpZXIgTmV3JywgJyNGRkZGRkYnKTtcbiAgc2NvcmVUZXh0Lm1heFdpZHRoID0gMTAwMDtcbiAgc2NvcmVUZXh0LnkgPSAxMDtcbiAgc2NvcmVUZXh0LnggPSAxMDtcbiAgdGhpcy5zY29yZVRleHQgPSBzY29yZVRleHQ7XG5cbiAgdGhpcy5hZGQgPSBmdW5jdGlvbihhbXQpIHtcbiAgICBzY29yZSArPSBhbXQ7XG4gIH1cbiAgXG4gIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgc2NvcmVUZXh0LnRleHQgPSBzY29yZTsgXG4gIH1cbn1cblxuIl19
