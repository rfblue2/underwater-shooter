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
    
