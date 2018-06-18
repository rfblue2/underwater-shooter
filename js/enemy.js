var enemySheet;
var enemyData = {}

$.getJSON("img/fishes.json", function(json) {
    enemySheet = new createjs.SpriteSheet(json);
    for(var sprite in json.animations){
      enemyData[sprite] = {
        h: json.frames[json.animations[sprite].frames[0]][3],
        w: json.frames[json.animations[sprite].frames[0]][2],
      }
    }
});

function Enemy(name) {
  var enemy = enemyData[name];
  var sprite = new createjs.Sprite(enemySheet, name);
  this.sprite = sprite;

  this.HEIGHT = enemy.h;
  this.WIDTH = enemy.w;

  this.sprite.gotoAndPlay(name);
}

