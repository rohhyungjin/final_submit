// =========================================================================
// screen_2_lobby.js (수정본)
// =========================================================================

function drawLobbyScreen() {
  background(240);
  image(imgBackground, 0, 0, windowWidth, windowHeight);

  // 1. 상단 안내 텍스트
  fill(0);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("🕹️ 당신의 담당 방향을 선택하세요", windowWidth / 2, windowHeight * 0.15);

  let margin = windowWidth * 0.1;  
  let gap = 20;                    
  let bw = (windowWidth - (margin * 2) - (gap * 3)) / 4; 
  let bh = windowHeight * 0.4;     
  let by = (windowHeight - bh) / 2; 

  // 2. 방향 선택 버튼 그리기
  for (let i = 0; i < 4; i++) {
    let bx = margin + i * (bw + gap);
    let taken = isRoleTaken(i);

    if (me.role === i) fill(46, 204, 113); // 내가 고른 것
    else if (taken) fill(189, 195, 199);   // 남이 고른 것
    else fill(255);                        // 선택 가능

    stroke(150);
    strokeWeight(3);
    rect(bx, by, bw, bh, 15); 

    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24); 
    
    if (me.role === i) {
      text(ROLES[i] + "\n\n[내 방향]", bx + bw/2, by + bh/2);
    } else if (taken) {
      text(ROLES[i] + "\n\n[선택 불가]", bx + bw/2, by + bh/2);
    } else {
      text(ROLES[i] + "\n\n[선택 가능]", bx + bw/2, by + bh/2);
    }
  }

  // ⭐️ 추가: 방장 전용 "혼자서 모두 조종하기" 버튼 (Y축 75% 지점에 배치)
  if (partyIsHost()) {
    let soloBtnW = 350;
    let soloBtnH = 50;
    let soloBtnX = (windowWidth - soloBtnW) / 2;
    let soloBtnY = windowHeight * 0.75;

    if (me.role === 4) fill(241, 196, 15); // 선택되었을 때 황금색
    else fill(255);                        // 미선택 시 흰색

    stroke(0);
    strokeWeight(2);
    rect(soloBtnX, soloBtnY, soloBtnW, soloBtnH, 10);

    fill(0);
    noStroke();
    textSize(18);
    text("👑 솔로 플레이 (방장 전용)", windowWidth / 2, soloBtnY + soloBtnH / 2);
  }

  // 3. 다음으로 넘어가는 하단 버튼
  let nextBtnW = 350;
  let nextBtnH = 60;
  let nextBtnX = (windowWidth - nextBtnW) / 2;
  let nextBtnY = windowHeight * 0.85;

  fill(255, 150, 150);
  stroke(0);
  strokeWeight(2);
  rect(nextBtnX, nextBtnY, nextBtnW, nextBtnH, 10);
  
  fill(0);
  noStroke();
  textSize(20);
  text("모드 선택", windowWidth/2, nextBtnY + nextBtnH/2);
}

function mousePressedLobby(mx, my) {
  let margin = windowWidth * 0.1;
  let gap = 20;
  let bw = (windowWidth - (margin * 2) - (gap * 3)) / 4;
  let bh = windowHeight * 0.4;
  let by = (windowHeight - bh) / 2;

  // 1. 역할 선택 버튼 클릭 체크
  for (let i = 0; i < 4; i++) {
    let bx = margin + i * (bw + gap);

    if (mx > bx && mx < bx + bw && my > by && my < by + bh) {
      if (!isRoleTaken(i)) {
        me.role = i;
      }
    }
  }

  // ⭐️ 추가: 방장 전용 솔로 버튼 클릭 체크
  if (partyIsHost()) {
    let soloBtnW = 350;
    let soloBtnH = 50;
    let soloBtnX = (windowWidth - soloBtnW) / 2;
    let soloBtnY = windowHeight * 0.75;

    if (mx > soloBtnX && mx < soloBtnX + soloBtnW && my > soloBtnY && my < soloBtnY + soloBtnH) {
      me.role = 4; // 전지전능한 4번 역할 부여
    }
  }

  // 2. 하단 다음 화면 버튼 클릭 체크
  let nextBtnW = 350;
  let nextBtnH = 60;
  let nextBtnX = (windowWidth - nextBtnW) / 2;
  let nextBtnY = windowHeight * 0.85;

  if (mx > nextBtnX && mx < nextBtnX + nextBtnW && my > nextBtnY && my < nextBtnY + nextBtnH) {
    partyEmit("changeGameState", 3);
  }
}

function isRoleTaken(roleIndex) {
  for (let p of participants) {
    if (p.role === roleIndex && p.role !== me.role) return true;
  }
  return false;
}