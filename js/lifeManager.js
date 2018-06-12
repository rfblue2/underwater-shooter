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
