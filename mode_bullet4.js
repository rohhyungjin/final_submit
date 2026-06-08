// =========================================================================
// mode_bullet4.js  – 탄막 보스전 생존 모드 (BULLET 스테이지 4)
// =========================================================================

let b4Initialized = false;

function drawDungeonBackground() {
  background(25, 40, 55);
  stroke(15, 25, 40);
  strokeWeight(3);
  let brickW = 100;
  let brickH = 50;
  for (let y = 0; y < windowHeight + brickH; y += brickH) {
    line(0, y, windowWidth, y);
    let offset = (Math.floor(y / brickH) % 2 === 0) ? 0 : brickW / 2;
    for (let x = -offset; x < windowWidth; x += brickW) {
      line(x, y, x, y + brickH);
    }
  }
}

let b4LocalPx = 0.5;
let b4LocalPy = 0.75;

function initBullet4Mode() {
  b4LocalPx = 0.5;
  b4LocalPy = 0.75;

  if (partyIsHost()) {
    sharedPos.px = 0.5;
    sharedPos.py = 0.75;
    sharedSignal.isDead = false;
    sharedSignal.isSuccess = false;
    sharedSignal.currentDir = "NONE";
    
    sharedSignal.bossPx = 0.5;
    sharedSignal.bossMoveDir = 1;
    
    // 패턴 및 체력 (2스테이지 기믹 추가)
    sharedSignal.bossHp        = 10; // 체력 10으로 하향
    sharedSignal.bossMaxHp     = 10;
    sharedSignal.bossPattern         = [];  
    sharedSignal.bossInputStep       = 0;   
    sharedSignal.bossPatternCooldown = 120; 
    
    sharedSignal.b4Bullets = []; // 탄막 배열
    sharedSignal.b4Warnings = []; // 경고 영역 배열
    sharedSignal.b4WarningTimer = 0; // 경고 패턴 쿨다운
  }

  b4Initialized = true;
}

function generateBoss4Pattern() {
  const dirs = ["UP", "DOWN", "LEFT", "RIGHT"];
  let pat = [];
  for (let i = 0; i < 5; i++) { // 4스테이지는 패턴 길이 5
    pat.push(dirs[Math.floor(random(4))]);
  }
  sharedSignal.bossPattern   = pat;
  sharedSignal.bossInputStep = 0;
}

function spawnBoss4Bullet() {
  let bx = (sharedSignal.bossPx || 0.5) * windowWidth;
  let by = windowHeight * 0.13;
  let px = sharedPos.px * windowWidth;
  let py = sharedPos.py * windowHeight;

  let baseAngle = atan2(py - by, px - bx);
  let offsets = [-0.3, 0, 0.3]; // 3발 동시 발사
  
  if (!sharedSignal.b4Bullets) sharedSignal.b4Bullets = [];
  for (let off of offsets) {
    let ang = baseAngle + off;
    sharedSignal.b4Bullets.push({ x: bx, y: by, vx: cos(ang), vy: sin(ang), speed: 4.5, size: 14 });
  }
}

function generateBoss4Attack() {
  // 다양한 형태의 경고 영역 생성
  let type = floor(random(3));
  if (!sharedSignal.b4Warnings) sharedSignal.b4Warnings = [];
  
  if (type === 0) {
    // 세로 레이저 형태
    let wx = random(0.1, 0.9) * windowWidth;
    sharedSignal.b4Warnings.push({
      type: "RECT",
      x: wx - 40, y: 0, w: 80, h: windowHeight,
      timer: 90, maxTimer: 90, activeFrames: 15
    });
  } else if (type === 1) {
    // 가로 레이저 형태
    let wy = random(0.4, 0.9) * windowHeight;
    sharedSignal.b4Warnings.push({
      type: "RECT",
      x: 0, y: wy - 40, w: windowWidth, h: 80,
      timer: 90, maxTimer: 90, activeFrames: 15
    });
  } else {
    // 거대한 원형 폭발
    let wx = random(0.2, 0.8) * windowWidth;
    let wy = random(0.4, 0.9) * windowHeight;
    sharedSignal.b4Warnings.push({
      type: "CIRCLE",
      x: wx, y: wy, r: 150,
      timer: 120, maxTimer: 120, activeFrames: 15
    });
  }
}

function drawBullet4ModeScreen() {
  if (!b4Initialized) initBullet4Mode();

  drawDungeonBackground(); // 1, 2스테이지와 동일 배경

  // ── 방장 전용 로직 ───────────────────────────────────────────────
  if (partyIsHost() && !sharedSignal.isDead && !sharedSignal.isSuccess && !sharedSignal.isPaused) {
    // 1. 플레이어 이동
    let spd = MOVE_SPEED_X;
    let dir = sharedSignal.currentDir;
    if      (dir === "UP")    sharedPos.py -= spd;
    else if (dir === "DOWN")  sharedPos.py += spd;
    else if (dir === "LEFT")  sharedPos.px -= spd;
    else if (dir === "RIGHT") sharedPos.px += spd;

    let margin = 1.5 / COLS;
    sharedPos.px = constrain(sharedPos.px, margin, 1 - margin);
    sharedPos.py = constrain(sharedPos.py, 0.30, 1 - margin);

    // 3. 보스 좌우 이동
    sharedSignal.bossPx += 0.004 * sharedSignal.bossMoveDir;
    if (sharedSignal.bossPx >= 0.85 || sharedSignal.bossPx <= 0.15) {
      sharedSignal.bossMoveDir *= -1;
    }

    // 4. 경고 패턴 생성
    sharedSignal.b4WarningTimer++;
    // 체력이 5 이하(흑화)면 패턴 속도 약간 가속
    let spawnRate = (sharedSignal.bossHp <= 5) ? 45 : 70; 
    if (sharedSignal.b4WarningTimer >= spawnRate) {
      generateBoss4Attack();
      sharedSignal.b4WarningTimer = 0;
    }

    // 5. 경고 영역 타이머 처리
    if (sharedSignal.b4Warnings) {
      let pX = sharedPos.px * windowWidth;
      let pY = sharedPos.py * windowHeight;
      
      for (let i = sharedSignal.b4Warnings.length - 1; i >= 0; i--) {
        let w = sharedSignal.b4Warnings[i];
        
        if (w.timer > 0) {
          w.timer--; // 경고 진행 중
        } else if (w.activeFrames > 0) {
          // 공격 판정 활성화 중
          w.activeFrames--;
          
          // 충돌 판정
          let isHit = false;
          if (w.type === "RECT") {
            if (pX > w.x && pX < w.x + w.w && pY > w.y && pY < w.y + w.h) isHit = true;
          } else if (w.type === "CIRCLE") {
            if (dist(pX, pY, w.x, w.y) < w.r) isHit = true;
          }
          
          if (isHit) {
            sharedSignal.isDead = true;
            sharedSignal.currentDir = "NONE";
          }
        } else {
          // 판정 종료 시 배열에서 제거
          sharedSignal.b4Warnings.splice(i, 1);
        }
      }
    }

    // 6. 패턴 쿨다운 및 새 패턴 생성
    if (sharedSignal.bossPatternCooldown > 0) {
      sharedSignal.bossPatternCooldown -= 1;
    } else if (!sharedSignal.bossPattern || sharedSignal.bossPattern.length === 0) {
      generateBoss4Pattern();
    }

    // 7. 탄막 생성 (주기적으로 발사)
    if (frameCount % 60 === 0) spawnBoss4Bullet();

    // 8. 탄막 이동 & 충돌 판정
    if (!sharedSignal.b4Bullets) sharedSignal.b4Bullets = [];
    let pX = sharedPos.px * windowWidth;
    let pY = sharedPos.py * windowHeight;
    for (let i = sharedSignal.b4Bullets.length - 1; i >= 0; i--) {
      let b = sharedSignal.b4Bullets[i];
      b.x += b.vx * b.speed;
      b.y += b.vy * b.speed;

      if (!sharedSignal.isDead && dist(b.x, b.y, pX, pY) < b.size / 2 + 8) {
        sharedSignal.isDead    = true;
        sharedSignal.currentDir = "NONE";
      }
      if (b.x < -60 || b.x > windowWidth + 60 || b.y < -60 || b.y > windowHeight + 60) {
        sharedSignal.b4Bullets.splice(i, 1);
      }
    }

    // 9. 승리 판정 (보스 체력 0)
    if (sharedSignal.bossHp <= 0 && !sharedSignal.isSuccess) {
      sharedSignal.isSuccess  = true;
      sharedSignal.currentDir = "NONE";
      sharedSignal.isBulletCleared = true;
    }
  }

  // ── 렌더링 ────────────────────────────────────────────────────────
  drawB4Boss();       
  drawB4Warnings();
  drawB4Bullets(); // 탄막 그리기
  drawB4Pattern(); // 패턴 UI 그리기
  drawB4Player();     
  drawB4UI();         

  if (sharedSignal.isDead) drawB4GameOver();
  else if (sharedSignal.isSuccess) drawB4Clear();
  else if (sharedSignal.isPaused) drawB4Pause();
}

function drawB4Pause() {
  fill(0, 0, 0, 150);
  rect(0, 0, windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(50);
  text("⏸️ 일시정지 ⏸️", windowWidth/2, windowHeight/2 - 120);

  fill(100, 255, 100);
  stroke(0);
  strokeWeight(2);
  rect(windowWidth/2 - 100, windowHeight/2 - 40, 200, 50, 10);
  fill(0);
  noStroke();
  textSize(20);
  text("▶️ 계속하기", windowWidth/2, windowHeight/2 - 15);

  fill(255, 200, 100);
  stroke(0);
  strokeWeight(2);
  rect(windowWidth/2 - 100, windowHeight/2 + 20, 200, 50, 10);
  fill(0);
  noStroke();
  textSize(20);
  text("🔄 다시하기", windowWidth/2, windowHeight/2 + 45);

  fill(200);
  stroke(0);
  strokeWeight(2);
  rect(windowWidth/2 - 100, windowHeight/2 + 80, 200, 50, 10);
  fill(0);
  noStroke();
  textSize(20);
  text("🔙 스테이지 선택", windowWidth/2, windowHeight/2 + 105);

  fill(255, 150, 200); // 눈에 띄는 핑크색
  stroke(0);
  strokeWeight(2);
  rect(windowWidth/2 - 100, windowHeight/2 + 140, 200, 50, 10);
  fill(0);
  noStroke();
  textSize(20);
  text("⏭️ 보스전 스킵", windowWidth/2, windowHeight/2 + 165);
}

function drawB4Boss() {
  let bx = (sharedSignal.bossPx || 0.5) * windowWidth;
  let by = windowHeight * 0.15;
  
  push();
  imageMode(CENTER);
  
  // 체력이 5 이하면 완전 흑화 (검은색)
  if (sharedSignal.bossHp <= 5) {
    tint(40, 40, 40, 255);
  } else {
    // 기본은 보라색 기운
    tint(200, 100, 255, 255); 
  }
  
  if (typeof imgBalrog !== "undefined" && imgBalrog) {
    image(imgBalrog, bx, by, 180, 180);
  } else {
    fill(100, 50, 150); ellipse(bx, by, 100, 100);
  }
  pop();

  // ── 보스 체력바 ────────────────────────────────────────────────────────────
  let barW = 300;
  let barX = windowWidth / 2 - barW / 2;
  let barY = 63;

  fill(40); noStroke();
  rect(barX, barY, barW, 22, 5);

  let ratio = constrain((sharedSignal.bossHp || 0) / (sharedSignal.bossMaxHp || 1), 0, 1);
  if (ratio > 0.5) fill(80, 200, 80);
  else             fill(220, 60, 60);
  rect(barX, barY, barW * ratio, 22, 5);

  fill(255); textAlign(CENTER, CENTER); textSize(13); noStroke();
  let titleStr = (sharedSignal.bossHp <= 5) ? "🌑 완전 흑화 보스 HP" : "👾 흑화 보스 HP";
  text(titleStr + "  " + (sharedSignal.bossHp || 0) + " / " + (sharedSignal.bossMaxHp || 10),
       windowWidth / 2, barY + 11);
}

function drawB4Bullets() {
  noStroke();
  let isBlackened = (sharedSignal.bossHp <= 5);
  let bullets = sharedSignal.b4Bullets || [];
  for (let b of bullets) {
    if (isBlackened) {
      fill(100, 100, 100); // 흑화 시 코어 회색
      ellipse(b.x, b.y, b.size * 0.45, b.size * 0.45);
      fill(0, 0, 0, 200); // 흑화 시 테두리 검은색
      ellipse(b.x, b.y, b.size, b.size);
    } else {
      fill(255, 100, 255); // 보라색 탄막
      ellipse(b.x, b.y, b.size * 0.45, b.size * 0.45);
      fill(150, 0, 200, 200);
      ellipse(b.x, b.y, b.size, b.size);
    }
  }
}

function drawB4Pattern() {
  let pattern = sharedSignal.bossPattern;
  let step    = sharedSignal.bossInputStep || 0;
  
  let startX = windowWidth / 2 + 180;
  let boxY   = 55;

  if (!pattern || pattern.length === 0) {
    noStroke(); fill(140, 140, 140, 160); textAlign(LEFT, CENTER); textSize(14);
    text("패턴 장전 중...", startX, boxY + 20);
    return;
  }

  let boxSize = 36;
  let gap     = 8;
  let totalW  = pattern.length * boxSize + (pattern.length - 1) * gap;

  fill(0, 0, 0, 150); noStroke();
  rect(startX - 10, boxY - 10, totalW + 20, boxSize + 35, 8);

  const B4_ICON  = { UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→" };
  const B4_COLOR = {
    UP:    [100, 200, 255],
    DOWN:  [100, 255, 160],
    LEFT:  [255, 200, 80],
    RIGHT: [255, 100, 200]
  };

  for (let i = 0; i < pattern.length; i++) {
    let bx  = startX + i * (boxSize + gap);
    let dir = pattern[i];
    let c   = B4_COLOR[dir];

    if (i < step) {
      fill(c[0] * 0.35, c[1] * 0.35, c[2] * 0.35, 160);
      stroke(c[0] * 0.5, c[1] * 0.5, c[2] * 0.5); strokeWeight(1);
    } else if (i === step) {
      fill(c[0], c[1], c[2], 230);
      stroke(255); strokeWeight(2);
    } else {
      fill(c[0] * 0.45, c[1] * 0.45, c[2] * 0.45, 160);
      stroke(c[0] * 0.65, c[1] * 0.65, c[2] * 0.65); strokeWeight(1);
    }
    rect(bx, boxY, boxSize, boxSize, 6);

    noStroke(); fill(i < step ? 100 : 255); textAlign(CENTER, CENTER); textSize(20);
    text(B4_ICON[dir], bx + boxSize / 2, boxY + boxSize / 2);
  }

  noStroke(); fill(255, 240, 180); textAlign(CENTER, CENTER); textSize(11);
  text("화살표로 공격!", startX + totalW / 2, boxY + boxSize + 12);
}

function drawB4Warnings() {
  if (!sharedSignal.b4Warnings) return;
  
  let isBlackened = (sharedSignal.bossHp <= 5);

  for (let w of sharedSignal.b4Warnings) {
    push();
    if (w.timer > 0) {
      // 경고 단계: 투명도 조절
      let alpha = map(w.timer, w.maxTimer, 0, 50, 180);
      if (isBlackened) {
        fill(0, 0, 0, alpha); // 흑화 시 검은색 장판
        stroke(50, 50, 50, alpha + 50);
      } else {
        fill(255, 0, 0, alpha); // 기본 붉은색 장판
        stroke(255, 50, 50, alpha + 50);
      }
      strokeWeight(2);
    } else {
      // 공격 활성화 단계
      if (isBlackened) {
        if (frameCount % 4 < 2) fill(100);
        else fill(0);
      } else {
        if (frameCount % 4 < 2) fill(255);
        else fill(255, 50, 50);
      }
      noStroke();
    }
    
    if (w.type === "RECT") {
      rect(w.x, w.y, w.w, w.h);
    } else if (w.type === "CIRCLE") {
      ellipse(w.x, w.y, w.r * 2);
    }
    pop();
  }
}

function drawB4Player() {
  b4LocalPx = lerp(b4LocalPx, sharedPos.px, 0.2);
  b4LocalPy = lerp(b4LocalPy, sharedPos.py, 0.2);
  let drawX = b4LocalPx * windowWidth;
  let drawY = b4LocalPy * windowHeight;

  let prevDir = "NONE";

  if(sharedSignal.currentDir === "NONE"){
    image(imgMainCharacter[0], drawX - 15, drawY - 15, 30, 30);
  }
  if(sharedSignal.currentDir === "RIGHT"){
    if (frameCount % 60 < 30) {
      image(imgMainCharacter[0], drawX - 15, drawY - 15, 30, 30);
    } else{
      image(imgMainCharacter[1], drawX - 15, drawY - 15, 30, 30);
    }
    prevDir = "RIGHT";
  }
  if(sharedSignal.currentDir === "LEFT"){
    if (frameCount % 60 < 30) {
      image(imgMainCharacter[2], drawX - 15, drawY - 15, 30, 30);
    } else{
      image(imgMainCharacter[3], drawX - 15, drawY - 15, 30, 30);
    }
    prevDir = "LEFT";
  }
  if(sharedSignal.currentDir === "UP"){
    if (frameCount % 60 < 30) {
        image(imgMainCharacter[0], drawX - 15, drawY - 15, 30, 30);
      } else{
        image(imgMainCharacter[1], drawX - 15, drawY - 15, 30, 30);
      }
  }
  if(sharedSignal.currentDir === "DOWN"){
    if (frameCount % 60 < 30) {
        image(imgMainCharacter[2], drawX - 15, drawY - 15, 30, 30);
      } else{
        image(imgMainCharacter[3], drawX - 15, drawY - 15, 30, 30);
      }
  }

  //스킨
  if (sharedSignal.selectedSkin === 1) {
    if (frameCount % 3 === 0) {
      skinParticles.push({ x: drawX, y: drawY, vx: random(-1.5, 1.5), vy: random(-1.5, 1.5), life: 255 });
    }
    for (let i = skinParticles.length - 1; i >= 0; i--) {
      let p = skinParticles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 12;
      fill(255, 220, 100, p.life);
      noStroke();
      ellipse(p.x, p.y, 6, 6);
      if (p.life <= 0) skinParticles.splice(i, 1);
    }
  }
  if (sharedSignal.selectedSkin === 2) {
    if (typeof imgCrown !== 'undefined' && imgCrown) {
      image(imgCrown, drawX - 15, drawY - 35, 30, 24);
    }
  }

  textAlign(CENTER); textSize(10); fill(255); noStroke();
  text(sharedSignal.isDead ? "사망" : "", drawX, drawY + 20);
}

function drawB4UI() {
  fill(10, 5, 25, 215); noStroke();
  rect(0, 0, windowWidth, 55);

  textAlign(LEFT, CENTER); textSize(18); fill(255, 100, 255); noStroke();
  let titleStr = (sharedSignal.bossHp <= 5) ? "🌑 보스 완전 흑화!" : "👿 보스 생존전 – 스테이지 4";
  text(titleStr, 20, 27);

  textAlign(RIGHT, CENTER); textSize(14); fill(200); noStroke();
  text(partyIsHost() ? "👑 방장" : "👤 게스트", windowWidth - 20, 27);

  // 하단 안내
  let gy = windowHeight - 44;
  fill(0, 0, 0, 160); noStroke();
  rect(0, gy, windowWidth, 44);

  textAlign(CENTER, CENTER); textSize(13); fill(210); noStroke();
  let msg;
  if      (me.role === 4) msg = "👑 솔로 | WASD: 이동 | ↑↓←→: 공격 (장판 주의!)";
  else if (me.role === 0) msg = "역할 ⬆️ UP   | W: 이동 | ↑↓←→: 공격 (장판 주의!)";
  else if (me.role === 1) msg = "역할 ⬅️ LEFT  | A: 이동 | ↑↓←→: 공격 (장판 주의!)";
  else if (me.role === 2) msg = "역할 ⬇️ DOWN  | S: 이동 | ↑↓←→: 공격 (장판 주의!)";
  else if (me.role === 3) msg = "역할 ➡️ RIGHT | D: 이동 | ↑↓←→: 공격 (장판 주의!)";
  else                    msg = "로비에서 역할을 먼저 선택하세요!";
  text(msg, windowWidth / 2, gy + 22);
}

function keyPressedBullet4Mode() {
  if (keyCode === ESCAPE || key === 'Escape') {
    if (!sharedSignal.isDead && !sharedSignal.isSuccess) {
      partyEmit("togglePause");
    }
    return false;
  }

  if (sharedSignal.isPaused) return false;
  if (sharedSignal.isDead || sharedSignal.isSuccess) return false;

  let k = key ? key.toLowerCase() : "";

  let newDir = null;
  if (me.role === 4) {
    if (k === 'w' || key === 'ㅈ') newDir = "UP";
    if (k === 'a' || key === 'ㅁ') newDir = "LEFT";
    if (k === 's' || key === 'ㄴ') newDir = "DOWN";
    if (k === 'd' || key === 'ㅇ') newDir = "RIGHT";
  } else {
    if (me.role === 0 && (k === 'w' || key === 'ㅈ')) newDir = "UP";
    if (me.role === 1 && (k === 'a' || key === 'ㅁ')) newDir = "LEFT";
    if (me.role === 2 && (k === 's' || key === 'ㄴ')) newDir = "DOWN";
    if (me.role === 3 && (k === 'd' || key === 'ㅇ')) newDir = "RIGHT";
  }

  if (newDir) {
    partyEmit("playerInput", newDir);
  }

  // ── 화살표 키: 보스 패턴 입력 ──────
  let arrowDir = null;
  if      (keyCode === UP_ARROW)    arrowDir = "UP";
  else if (keyCode === DOWN_ARROW)  arrowDir = "DOWN";
  else if (keyCode === LEFT_ARROW)  arrowDir = "LEFT";
  else if (keyCode === RIGHT_ARROW) arrowDir = "RIGHT";

  if (!arrowDir) return; 

  if (!sharedSignal.bossPattern || sharedSignal.bossPattern.length === 0) return false;

  let step = sharedSignal.bossInputStep || 0;
  if (step >= sharedSignal.bossPattern.length) return false;

  if (arrowDir === sharedSignal.bossPattern[step]) {
    sharedSignal.bossInputStep = step + 1;

    if (sharedSignal.bossInputStep >= sharedSignal.bossPattern.length) {
      sharedSignal.bossHp       = max(0, (sharedSignal.bossHp || 0) - 1);
      sharedSignal.bossPattern  = []; 
      sharedSignal.bossPatternCooldown = 60;
    }
  }

  return false;
}

function mousePressedBullet4Mode(mx, my) {
  if (sharedSignal.isPaused && !sharedSignal.isDead && !sharedSignal.isSuccess) {
    if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 - 40 && my < windowHeight/2 + 10) {
      partyEmit("togglePause");
    }
    else if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 + 20 && my < windowHeight/2 + 70) {
      partyEmit("bullet4Retry");
    }
    else if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 + 80 && my < windowHeight/2 + 130) {
      partyEmit("changeGameState", 4);
    }
    else if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 + 140 && my < windowHeight/2 + 190) {
      partyEmit("bullet4SkipStage");
    }
    return;
  }

  if (!sharedSignal.isDead && !sharedSignal.isSuccess) return;

  if (mx > windowWidth / 2 - 180 && mx < windowWidth / 2 - 20 &&
      my > windowHeight / 2 + 30  && my < windowHeight / 2 + 80) {
    partyEmit("bullet4Retry");
    return;
  }

  if (mx > windowWidth / 2 + 20  && mx < windowWidth / 2 + 180 &&
      my > windowHeight / 2 + 30  && my < windowHeight / 2 + 80) {
    if (typeof b4Initialized !== "undefined") b4Initialized = false;
    if (sharedSignal.isSuccess) {
      partyEmit("changeGameState", 6);
    } else {
      partyEmit("changeGameState", 4);
    }
  }
}

function drawB4GameOver() {
  fill(0, 0, 0, 185); noStroke(); rect(0, 0, windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  fill(255, 50, 50); textSize(50);
  text("💀 게임 오버!", windowWidth / 2, windowHeight / 2 - 70);
  fill(255); textSize(22);
  text("보스의 공격을 버티지 못했습니다!", windowWidth / 2, windowHeight / 2 - 15);

  fill(255); stroke(0); strokeWeight(2);
  rect(windowWidth / 2 - 180, windowHeight / 2 + 30, 160, 50, 10);
  fill(0); noStroke(); textSize(18);
  text("🔄 다시 하기", windowWidth / 2 - 100, windowHeight / 2 + 55);

  fill(200); stroke(0); strokeWeight(2);
  rect(windowWidth / 2 + 20, windowHeight / 2 + 30, 160, 50, 10);
  fill(0); noStroke(); textSize(18);
  text("🔙 스테이지 선택", windowWidth / 2 + 100, windowHeight / 2 + 55);
}

function drawB4Clear() {
  fill(255, 255, 255, 205); noStroke(); rect(0, 0, windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  fill(50, 100, 255); textSize(50);
  text("🎉 최종 보스 격파!", windowWidth / 2, windowHeight / 2 - 70);
  fill(0); textSize(22);
  text("모든 패턴을 파훼하고 보스를 물리쳤습니다!", windowWidth / 2, windowHeight / 2 - 15);

  fill(200, 255, 200); stroke(0); strokeWeight(2);
  rect(windowWidth / 2 - 180, windowHeight / 2 + 30, 160, 50, 10);
  fill(0); noStroke(); textSize(18);
  text("🔄 다시 하기", windowWidth / 2 - 100, windowHeight / 2 + 55);

  fill(255, 215, 0); stroke(0); strokeWeight(2);
  rect(windowWidth / 2 + 20, windowHeight / 2 + 30, 160, 50, 10);
  fill(0); noStroke(); textSize(18);
  text("🎬 엔딩 보기", windowWidth / 2 + 100, windowHeight / 2 + 55);
}
