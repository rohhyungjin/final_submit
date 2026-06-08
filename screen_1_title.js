// =========================================================================
// screen_1_title.js
// =========================================================================

function drawTitleScreen() {
  background(100, 150, 255);
  image(imgTitle, 0, 0, windowWidth, windowHeight);

  textAlign(CENTER, CENTER);
  textSize(40);
  if (frameCount % 60 < 30) {
    fill(0);
    text("- 화면을 클릭하여 시작하세요 -", windowWidth/2, windowHeight/15);
  }

  textAlign(LEFT, BOTTOM);
  textSize(24);
  fill(255);
  stroke(0);
  strokeWeight(4);
  text("제작자 - 나영민, 노형진, 정재훈", 30, windowHeight - 30);
  noStroke();
}

function mousePressedTitle(mx, my) {
  partyEmit("changeGameState", 2); 
}