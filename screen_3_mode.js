// =========================================================================
// screen_3_mode.js
// =========================================================================

function drawModeSelectScreen() {
  background(40, 50, 70);
  image(imgBackground, 0, 0, windowWidth, windowHeight);
  
  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("플레이할 모드를 선택하세요", windowWidth / 2, windowHeight * 0.2);

  let btnW = windowWidth * 0.3;
  let btnH = windowHeight * 0.4;
  let gap = windowWidth * 0.05;
  
  let mazeX = windowWidth / 2 - btnW - gap/2;
  let bulletX = windowWidth / 2 + gap/2;
  let btnY = windowHeight * 0.35;

  // 1. 미로 모드
  fill(100, 200, 150);
  stroke(255);
  strokeWeight(3);
  rect(mazeX, btnY, btnW, btnH, 20);
  fill(0);
  noStroke();
  textSize(35);
  text("🧩 미로 탐험", mazeX + btnW/2, btnY + btnH/2 - 20);
  textSize(18);
  fill(50);
  text("테마별 기믹과 몬스터를 돌파하세요", mazeX + btnW/2, btnY + btnH/2 + 30);

  // 2. 보스전
  if (sharedSignal.isMazeCleared) {
    fill(255, 100, 100); // 해금됨
  } else {
    fill(100); // 잠금됨 (회색 처리)
  }
  stroke(255);
  strokeWeight(3);
  rect(bulletX, btnY, btnW, btnH, 20);
  fill(0);
  noStroke();
  textSize(35);
  text("🔥 보스전", bulletX + btnW/2, btnY + btnH/2 - 20);
  textSize(18);
  
  if (sharedSignal.isMazeCleared) {
    fill(50);
    text("사방에서 날아오는 투사체를 피하세요", bulletX + btnW/2, btnY + btnH/2 + 30);
  } else {
    fill(200, 50, 50);
    text("🔒 미로 모드 클리어 시 해금", bulletX + btnW/2, btnY + btnH/2 + 30);
  }
  
  // 뒤로가기
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(windowWidth/2 - 100, windowHeight * 0.85, 200, 50, 10);
  fill(0);
  noStroke();
  textSize(20);
  text("🔙 로비로", windowWidth/2, windowHeight * 0.85 + 25);
}

function mousePressedMode(mx, my) {
  let btnW = windowWidth * 0.3;
  let btnH = windowHeight * 0.4;
  let gap = windowWidth * 0.05;
  let mazeX = windowWidth / 2 - btnW - gap/2;
  let bulletX = windowWidth / 2 + gap/2;
  let btnY = windowHeight * 0.35;

  if (mx > mazeX && mx < mazeX + btnW && my > btnY && my < btnY + btnH) {
    partyEmit("changeMode", "MAZE");
    partyEmit("changeGameState", 4); 
  }

  if (mx > bulletX && mx < bulletX + btnW && my > btnY && my < btnY + btnH) {
    if (sharedSignal.isMazeCleared) {
      partyEmit("changeMode", "BULLET");
      partyEmit("changeGameState", 4); 
    }
  }

  if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight * 0.85 && my < windowHeight * 0.85 + 50) {
    partyEmit("changeGameState", 2);
  }
}