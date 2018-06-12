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

