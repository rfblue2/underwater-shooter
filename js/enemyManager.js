function EnemyManager(stage) {
  var enemies = new createjs.Container();
  this.enemies = enemies;

  function addEnemy() {
    var NUM_ENEMIES = 31;
    var enemy = new Enemy('e' + Math.floor(Math.random() * NUM_ENEMIES));
    enemy.sprite.x = WIDTH - 50; 
    enemy.sprite.y = Math.floor(Math.random() * (HEIGHT - 33)) + 33;
    enemies.addChild(enemy.sprite);
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
