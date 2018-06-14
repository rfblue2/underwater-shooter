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

