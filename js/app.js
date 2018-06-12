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
      if (dolphin.sprite.y + 5 < enemyMgr.enemies.children[k].y + 33 &&
          dolphin.sprite.y + dolphin.HEIGHT - 5 > enemyMgr.enemies.children[k].y &&
          dolphin.sprite.x + 5 < enemyMgr.enemies.children[k].x + 50 &&
          dolphin.sprite.x + dolphin.WIDTH - 5 > enemyMgr.enemies.children[k].x 
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
    
