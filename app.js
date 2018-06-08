var LEFT  = 37;
var UP    = 38;
var RIGHT = 39;
var DOWN  = 40;
var SPACE = 32;
var HEIGHT = 480;
var WIDTH = 640;

function init() {
  var score = 0;
  var keys = {};
  var shootCounter = 0;
  var stage = new createjs.Stage("demoCanvas");
  var enemies = new createjs.Container();
  var bullets = new createjs.Container();

  var bg1 = new createjs.Bitmap("img/bg.png");
  var bg2 = new createjs.Bitmap("img/bg.png");
  bg2.x = WIDTH;
  stage.addChild(bg1, bg2);
  stage.addChild(enemies);
  stage.addChild(bullets);
  
  var scoreText = new createjs.Text('0', 'bold 20px Courier New', '#FFFFFF');
  scoreText.maxWidth = 1000;
  scoreText.y = 10;
  scoreText.x = 10;
  stage.addChild(scoreText)

  var dolphinData = {
    images: ["img/dolphin2.png"],
    frames: {width:150, height:98},
    framerate: 12,
  };
  var dolphinSheet = new createjs.SpriteSheet(dolphinData);
  var dolphin = new createjs.Sprite(dolphinSheet);
  dolphin.gotoAndPlay(0);
  stage.addChild(dolphin);

  var fish1Data = {
    images: ["img/fish2.png"],
    frames: {width:50, height:33},
    framerate: 12,
  };
  var fish1Sheet = new createjs.SpriteSheet(fish1Data);

  var bulletData = {
    images: ["img/bullet.png"],
    frames: {width:10,height:10},
    framerate: 12,
  };
  var bulletSheet = new createjs.SpriteSheet(bulletData);

  function addEnemy() {
    var fish1 = new createjs.Sprite(fish1Sheet);
    fish1.x = WIDTH - 50; 
    fish1.y = Math.floor(Math.random() * (HEIGHT - 33)) + 33;
    fish1.gotoAndPlay(0);
    enemies.addChild(fish1);
    stage.update();
  }

  var timerSource = setInterval(addEnemy, 1000); 

  function shoot() {
    var b = new createjs.Sprite(bulletSheet);
    b.gotoAndPlay(0);

    b.x = dolphin.x + 150;
    b.y = dolphin.y + 49;

    bullets.addChild(b);
    stage.update();
  }

  this.document.onkeydown = keydown;
  this.document.onkeyup = keyup;

  createjs.Ticker.addEventListener("tick", handleTick);

  function keydown(event) {
    keys[event.keyCode] = true
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

    // move dolphin
    if (keys[LEFT])  dolphin.x -= 15;
    if (keys[UP])    dolphin.y -= 15;
    if (keys[RIGHT]) dolphin.x += 15;
    if (keys[DOWN])  dolphin.y += 15;
    // wall collision
    if (dolphin.x < -30) dolphin.x = -30;
    if (dolphin.y < -30) dolphin.y = -30;
    if (dolphin.x > WIDTH - 150 + 30) dolphin.x = WIDTH - 150 + 30;
    if (dolphin.y > HEIGHT - 98 + 30) dolphin.y = HEIGHT - 98 + 30;
    
    // update enemies
    for(var j = 0; j < enemies.children.length; j++) {
      enemies.children[j].x -= 5;

      // remove offstage enemies
      if(enemies.children[j].x < -25)
        enemies.removeChildAt(j);
    }

    // shoot!
    if (keys[SPACE]) {
      if (shootCounter == 0) shoot()
      shootCounter = (shootCounter + 1) % 3;
    } else {
      shootCounter = 0
    }

    // update bullets
    for(var j = 0; j < bullets.children.length; j++) {
      bullets.children[j].x += 20;

      // remove offstage bullets 
      if(bullets.children[j].x > WIDTH + 10)
        bullets.removeChildAt(j);
    }

    for (var j = 0; j < bullets.children.length; j++) {
      // test for enemy/bullet collision
      for (var k = 0; k < enemies.children.length; k++) {
        // reference is in center of bullet, so give +/- 5 radius
        if (bullets.children[j].y + 5 > enemies.children[k].y - 5 && 
            bullets.children[j].y + 5 < enemies.children[k].y + 33 + 5 &&
            bullets.children[j].x + 5 > enemies.children[k].x - 5 &&
            bullets.children[j].x + 5 < enemies.children[k].x + 50 + 5
        ) { 
          bullets.removeChildAt(j); 
          enemies.removeChildAt(k); 
          stage.update(); 
          score += 10;
          break;
        }
      }
    }

    scoreText.text = score; 

    stage.update(event);
  }
}
    
