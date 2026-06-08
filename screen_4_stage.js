// =========================================================================
// screen_4_stage.js
// =========================================================================

function drawStageSelectScreen() {
  background(255, 200, 150);
  image(imgBackground, 0, 0, windowWidth, windowHeight);

  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0);
  let titleText = sharedSignal.selectedMode === "MAZE" ? "🧩 미로 모드 : 스테이지 선택" : "🔥 탄막 모드 : 스테이지 선택";
  text(titleText, windowWidth/2, 100);

  let btnW = 320;
  let btnH = 60;
  let gapX = 40;
  let gapY = 30;
  let startX = windowWidth/2 - btnW - (gapX / 2);
  let startY = 180;

  const mazeNames = ["1. 초원", "2. 숲", "3. 연못", "4. 심해", "5. 협곡", "6. 사막"];

  if (sharedSignal.selectedMode === "BULLET") {
    let bx = windowWidth/2 - btnW/2;
    let by = startY + (btnH + gapY);
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(bx, by, btnW, btnH, 15);
    fill(0);
    noStroke();
    textSize(20);
    text("보스전", bx + btnW/2, by + btnH/2);
  } else {
    for (let i = 1; i <= 6; i++) {
      let col = (i - 1) % 2;
      let row = Math.floor((i - 1) / 2);
      let bx = startX + col * (btnW + gapX);
      let by = startY + row * (btnH + gapY);

      // ⭐️ 수정: 서버에 값이 없으면 기본값 1을 사용하도록 '|| 1' 추가
      let maxStage = sharedSignal.maxUnlockedMazeStage || 1;
      let isUnlocked = i <= maxStage;

      if (isUnlocked) fill(255);
      else fill(180); // 잠긴 스테이지는 어둡게

      stroke(0);
      strokeWeight(2);
      rect(bx, by, btnW, btnH, 15);
      
      fill(0);
      noStroke();
      textSize(20);
      let stName = mazeNames[i-1];
      
      if (isUnlocked) {
        text(stName, bx + btnW/2, by + btnH/2);
      } else {
        text("🔒 " + stName, bx + btnW/2, by + btnH/2);
      }
    }
  }

  let returnBy = startY + 3 * (btnH + gapY) + 20;
  fill(200, 220, 255);
  stroke(0);
  strokeWeight(2);
  rect(windowWidth/2 - 150, returnBy, 300, 50, 15);
  fill(0);
  noStroke();
  textSize(18);
  text("🔙 모드 선택으로 돌아가기", windowWidth/2, returnBy + 25);

  //스킨
  let skinY = startY + 3 * (btnH + gapY) + 100;
  fill(0); textSize(24); textAlign(CENTER, CENTER);
  text("👕 캐릭터 스킨 선택", windowWidth/2, skinY);

  let sBtnW = 150; let sBtnH = 60; let sGap = 30;
  let sStartX = windowWidth/2 - (sBtnW * 1.5) - sGap;

  let skinNames = ["기본 스킨", "✨ 빛의 요정", "👑 제왕의 왕관"];
  let skinUnlocked = [true, sharedSignal.isMazeCleared, sharedSignal.isBulletCleared];

  for (let i = 0; i < 3; i++) {
    let bx = sStartX + i * (sBtnW + sGap);
    
    if (sharedSignal.selectedSkin === i) fill(100, 255, 100); // 선택됨
    else if (!skinUnlocked[i]) fill(150); // 잠김
    else fill(255); // 선택 가능

    stroke(0); strokeWeight(2);
    rect(bx, skinY + 30, sBtnW, sBtnH, 10);

    fill(0); noStroke(); textSize(16);
    if (!skinUnlocked[i]) text("🔒 잠김", bx + sBtnW/2, skinY + 30 + sBtnH/2);
    else text(skinNames[i], bx + sBtnW/2, skinY + 30 + sBtnH/2);
  }
}

function mousePressedStage(mx, my) {
  let btnW = 320;
  let btnH = 60;
  let gapX = 40;
  let gapY = 30;
  let startX = windowWidth/2 - btnW - (gapX / 2);
  let startY = 180;

  if (sharedSignal.selectedMode === "BULLET") {
    let bx = windowWidth/2 - btnW/2;
    let by = startY + (btnH + gapY);
    if (mx > bx && mx < bx + btnW && my > by && my < by + btnH) {
      partyEmit("enterStage", 1);
    }
  } else {
    for (let i = 1; i <= 6; i++) {
      let col = (i - 1) % 2;
      let row = Math.floor((i - 1) / 2);
      let bx = startX + col * (btnW + gapX);
      let by = startY + row * (btnH + gapY);

      if (mx > bx && mx < bx + btnW && my > by && my < by + btnH) {
        let maxStage = sharedSignal.maxUnlockedMazeStage || 1;
        if (i <= maxStage) {
          partyEmit("enterStage", i);
        }
      }
    }
  }

  // 4. 스킨 버튼 클릭 감지 추가
  let skinY = startY + 3 * (btnH + gapY) + 100;
  let sBtnW = 150; let sBtnH = 60; let sGap = 30;
  let sStartX = windowWidth/2 - (sBtnW * 1.5) - sGap;
  let skinUnlocked = [true, sharedSignal.isMazeCleared, sharedSignal.isBulletCleared];

  for (let i = 0; i < 3; i++) {
    let bx = sStartX + i * (sBtnW + sGap);
    if (mx > bx && mx < bx + sBtnW && my > skinY + 30 && my < skinY + 30 + sBtnH) {
      if (skinUnlocked[i]) {
        partyEmit("changeSkin", i);
      }
    }
  }

  let returnBy = startY + 3 * (btnH + gapY) + 20;
  if (mx > windowWidth/2 - 150 && mx < windowWidth/2 + 150 && my > returnBy && my < returnBy + 50) {
    partyEmit("changeGameState", 3); 
  }
}

// =========================================================================
// desert hidden gimmick overrides
// =========================================================================

function enterStage(stageNum) {   // 기존 enterStage 함수 내용을 덮어쓰기?
  sharedSignal.selectedStage = stageNum;
  sharedPos.px = 0.125; 
  sharedPos.py = 0.15625;
  sharedSignal.isDead = false;
  sharedSignal.isSuccess = false;
  sharedSignal.currentDir = "NONE";
  sharedSignal.speedMode = "NORMAL";
  sharedSignal.isPaused = false;
  sharedSignal.breath = 100;
  sharedSignal.isReversed = false;

  if (typeof resetMap6HiddenState === "function") {
    resetMap6HiddenState();
  }

  initMonsters(stageNum);
  sharedSignal.currentGameState = 5;
}

function initMonsters(stageNum) {   // 기존 initMonsters 함수 내용을 덮어쓰기?
  if (typeof resetMap6HiddenState === "function") {
    resetMap6HiddenState();
  }
  if (!partyIsHost()) return;
  sharedSignal.monsters = [];

  if (sharedSignal.selectedMode === "MAZE" && stageNum === 2) {
    sharedSignal.monsters.push({type: "SLIME", baseX: 9.5, baseY: 9.5, px: 9.5, py: 9.5, targetX: 9.5, targetY: 9.5, vx: 0, vy: 0, timer: 0, isJumping: false});
    sharedSignal.monsters.push({type: "SLIME", baseX: 9.5, baseY: 6.5, px: 9.5, py: 6.5, targetX: 9.5, targetY: 6.5, vx: 0, vy: 0, timer: 0, isJumping: false});
    sharedSignal.monsters.push({type: "WOLF", px: 12.5, py: 12.5, moveAxis: "X", minBound: 12.5, maxBound: 14.5, dir: 1, speed: 0.06, Xangle: true});
    sharedSignal.monsters.push({type: "WOLF", px: 8.5, py: 10.5, moveAxis: "Y", minBound: 10.5, maxBound: 15.5, dir: 1, speed: 0.06, Yangle: true});
  }

  if (sharedSignal.selectedMode === "MAZE" && stageNum === 3) {
    sharedSignal.monsters.push({ type: "WATER_SPIRIT", px: 10.5, py: 4.5, timer: 0 });
    sharedSignal.monsters.push({ type: "CROCODILE", timer: 0, state: "IDLE", biteR: -1, biteC: -1 });
    sharedSignal.monsters.push({ type: "CROCODILE", timer: 45, state: "IDLE", biteR: -1, biteC: -1 });
    sharedSignal.monsters.push({ type: "CROCODILE", timer: 90, state: "IDLE", biteR: -1, biteC: -1 });
    sharedSignal.monsters.push({ type: "SIREN", px: 13.5, py: 11.5, pullTimer: 0 });
  }

  if (sharedSignal.selectedMode === "MAZE" && stageNum === 4) {
    let bubbleCoords = [ { r: 12, c: 5 }, { r: 10, c: 13 }, { r: 7, c: 10 }, { r: 6, c: 4 }, { r: 14, c: 11 } ];
    for (let bc of bubbleCoords) {
      sharedSignal.monsters.push({ type: "BUBBLE", px: bc.c + 0.5, py: bc.r + 0.5, timer: random(0, 10) });
    }
    sharedSignal.monsters.push({ type: "MERMAID", px: 0.5, py: 7 });
    sharedSignal.monsters.push({ type: "SHARK", px: 8.5, py: 5.5, state: "HIDE", timer: 0 });
    sharedSignal.monsters.push({ type: "JELLYFISH", px: 8.5, py: 4.5, vx: 0.03, vy: 0.04 });
    sharedSignal.monsters.push({ type: "OCTOPUS", px: 9.5, py: 8.5, timer: 0, inkZones: [] });
  }

  
  if (sharedSignal.selectedMode === "MAZE" && stageNum === 5) {
    /*
    sharedSignal.monsters.push({
      type: "CENTIPEDE",
      px: 4.5,
      py: 3.5,
      dirX: 1,
      dirY: 0,
      timer: 0,
      body: []
    });
    */
    sharedSignal.monsters.push({ type: "EAGLE", px: 2.5, py: 1.5, dir: 1, timer: 0 });
    sharedSignal.monsters.push({ type: "BANSHEE", px: 10.5, py: 9.5, timer: 0, state: 0, duration: 300 });
  }

  if (sharedSignal.selectedMode === "MAZE" && stageNum === 6) {
    sharedSignal.monsters = [];
  }
}
