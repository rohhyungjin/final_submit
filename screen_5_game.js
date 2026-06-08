// =========================================================================
// screen_5_game.js
// =========================================================================

let localPx = 0.125; 
let localPy = 0.15625;

const COLS = 20;
const ROWS = 16;
const START_PX = 2.5 / COLS;   
const START_PY = 2.5 / ROWS;   

function drawGameScreen() {
  background(240);

  let cellW = windowWidth / COLS;
  let cellH = windowHeight / ROWS;
  let currentMap = getCurrentMap();

  // 1. 미로 배경 및 방해 아이템 그리기
  noStroke();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let cellType = currentMap[r][c];

      if (sharedSignal.selectedStage === 6 && cellType === 7) {
        fill(194, 160, 92, 180);
        noStroke();
        ellipse(c * cellW + cellW / 2, r * cellH + cellH / 2, cellW * 0.92, cellH * 0.92);
        fill(60, 35, 15, 220);
        ellipse(c * cellW + cellW / 2, r * cellH + cellH / 2, cellW * 0.35, cellH * 0.35);
        fill(255, 230, 180, 160);
        ellipse(c * cellW + cellW / 2 - cellW * 0.12, r * cellH + cellH / 2 - cellH * 0.12, cellW * 0.08, cellH * 0.08);
      }

      const drawPathImage = () => {
        if (sharedSignal.selectedMode === "MAZE") {
          if (sharedSignal.selectedStage === 1 && r > 0) {
            image(imgGrassPath, c * cellW, r * cellH, cellW, cellH);
          } else if (sharedSignal.selectedStage === 2 && r > 0) {
            image(imgForestPath, c * cellW, r * cellH, cellW, cellH);
          } else if (sharedSignal.selectedStage === 3 && r > 0) {
            image(imgPondPath, c * cellW, r * cellH, cellW, cellH);
          } else if (sharedSignal.selectedStage === 4 && r > 0) {
            if(r > 5 && r < 8 && c > 0 && c < 17){                        //pppppppppppppppppppppppppppp
              image(imgCurrent, c * cellW, r * cellH, cellW, cellH);
            } else{
              image(imgDeepSeaPath, c * cellW, r * cellH, cellW, cellH);
            }
          } else if (sharedSignal.selectedStage === 5 && r > 0) {
            image(imgCanyonPath, c * cellW, r * cellH, cellW, cellH);
          } else if (sharedSignal.selectedStage === 6 && r > 0) {
            image(imgDessertPath, c * cellW, r * cellH, cellW, cellH);
          }
        }
      };

      if (cellType === 1) {
        let tileIndex = wallPatterns[r * COLS + c];

        if (sharedSignal.selectedMode === "MAZE" && sharedSignal.selectedStage === 1) {
          // 초원 스테이지
          if (tileIndex === 0) {
            image(imgGrass, c * cellW, r * cellH, cellW, cellH);
          } else {
            image(imgGrass2, c * cellW, r * cellH, cellW, cellH);
          }
        } else if (sharedSignal.selectedMode === "MAZE" && sharedSignal.selectedStage === 2) {
          // 숲 스테이지
          if (tileIndex === 0) {
            image(imgForest, c * cellW, r * cellH, cellW, cellH);
          } else {
            image(imgForest2, c * cellW, r * cellH, cellW, cellH);
          }
        } else if(sharedSignal.selectedMode === "MAZE" && sharedSignal.selectedStage === 3) {
          image(imgPond, c * cellW, r * cellH, cellW, cellH);
        } else if(sharedSignal.selectedMode === "MAZE" && sharedSignal.selectedStage === 4) {
          image(imgDeepSea, c * cellW, r * cellH, cellW, cellH);
        } else if(sharedSignal.selectedMode === "MAZE" && sharedSignal.selectedStage === 5) {
          if (tileIndex === 0) {
            image(imgCanyon1, c * cellW, r * cellH, cellW, cellH);
          } else {
            image(imgCanyon2, c * cellW, r * cellH, cellW, cellH);
          }
        } else if(sharedSignal.selectedMode === "MAZE" && sharedSignal.selectedStage === 6) {
          if (tileIndex === 0) {
            image(imgDessert1, c * cellW, r * cellH, cellW, cellH);
          } else {
            image(imgDessert2, c * cellW, r * cellH, cellW, cellH);
          }
        }
      } else if (cellType === 3) {
        drawPathImage();
        fill(255, 215, 0, 150);
        rect(c * cellW, r * cellH, cellW, cellH);
      } else if (cellType === 2) {
        drawPathImage();
        fill(150, 255, 150, 150);
        rect(c * cellW, r * cellH, cellW, cellH);
      } else if (cellType === 4) {
        drawPathImage();
        fill(255, 130, 0, 50);
        rect(c * cellW, r * cellH, cellW, cellH);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(cellH * 0.5);
        text("⚡", c * cellW + cellW/2, r * cellH + cellH/2);
      } else if (cellType === 5) {
        drawPathImage();
        fill(150, 90, 230, 50);
        rect(c * cellW, r * cellH, cellW, cellH);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(cellH * 0.5);
        text("🐢", c * cellW + cellW/2, r * cellH + cellH/2);
      } else if (cellType === 6) {
        drawPathImage();
        fill(100, 200, 255, 50);
        rect(c * cellW, r * cellH, cellW, cellH);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(cellH * 0.5);
        text("🔄", c * cellW + cellW/2, r * cellH + cellH/2);
      } else if (currentMap[r][c] === 0) {
        drawPathImage();
      }
    }
  }

  // 2. 이동 엔진 및 충돌/아이템 감지 (방장 전용)
  if (partyIsHost() && !sharedSignal.isDead && !sharedSignal.isSuccess && !sharedSignal.isPaused) { 
    let speedMode = sharedSignal.speedMode || "NORMAL";
    let currentSpeedX = MOVE_SPEED_X;
    let currentSpeedY = MOVE_SPEED_Y;

    if (sharedSignal.selectedStage === 4) {
      sharedSignal.breath -= 0.12; 
      if (sharedSignal.breath <= 0) {
        sharedSignal.breath = 0; sharedSignal.isDead = true; sharedSignal.currentDir = "NONE";
      }
    }

    // 6스테이지의 갈증/오아시스 기믹은 제거하고, 모래홀 탐험으로 대체합니다.

    if (speedMode === "FAST") {
      currentSpeedX = MOVE_SPEED_X * 2;
      currentSpeedY = MOVE_SPEED_Y * 2;
    } 
    else if (speedMode === "SLOW") {
      currentSpeedX = MOVE_SPEED_X * 0.6;
      currentSpeedY = MOVE_SPEED_Y * 0.6;
    }

    let nextDir = sharedSignal.currentDir;
    if (sharedSignal.selectedStage === 5 && sharedSignal.isReversed) {
      if (nextDir === "UP") nextDir = "DOWN"; else if (nextDir === "DOWN") nextDir = "UP";
      else if (nextDir === "LEFT") nextDir = "RIGHT"; else if (nextDir === "RIGHT") nextDir = "LEFT";
    }
    if (sharedSignal.stunTimer > 0) {
        sharedSignal.stunTimer -= 1;
        sharedSignal.currentDir = "NONE"; // 방향 입력 무시
      } else {
        // 기존 이동 로직 실행
        if (nextDir === "UP") sharedPos.py -= currentSpeedY;
        else if (nextDir === "DOWN") sharedPos.py += currentSpeedY;
        else if (nextDir === "LEFT") sharedPos.px -= currentSpeedX;
        else if (nextDir === "RIGHT") sharedPos.px += currentSpeedX;
      }

    let hitboxX = 8 / windowWidth; 
    let hitboxY = 8 / windowHeight;

    // 👉 충돌 판정 엔진: 악어가 뜯어낸 타일도 동적으로 벽(1)으로 인식하게 합니다.
    let checkCell = (px, py) => {
      let c = Math.floor(px * COLS);
      let r = Math.floor(py * ROWS);
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        if (sharedSignal.selectedStage === 3) {
          for (let m of sharedSignal.monsters) {
            if (m.type === "CROCODILE" && m.state === "BITE" && m.biteC === c && m.biteR === r) {
              return 1; // 뜯겨진 타일은 즉시 벽으로 돌변!
            }
          }
        }
        return currentMap[r][c];
      }
      return 1; 
    };

    let tl = checkCell(sharedPos.px - hitboxX, sharedPos.py - hitboxY);
    let tr = checkCell(sharedPos.px + hitboxX, sharedPos.py - hitboxY);
    let bl = checkCell(sharedPos.px - hitboxX, sharedPos.py + hitboxY);
    let br = checkCell(sharedPos.px + hitboxX, sharedPos.py + hitboxY);

    if (tl === 1 || tr === 1 || bl === 1 || br === 1) {
      sharedSignal.isDead = true;
      sharedSignal.currentDir = "NONE";
    }
    else if (tl === 3 || tr === 3 || bl === 3 || br === 3) {
      if (sharedSignal.selectedStage === 6 && isMap6HiddenActive()) {
        exitMap6Hidden();
      } else {
        sharedSignal.isSuccess = true;
        sharedSignal.currentDir = "NONE";

        // ✅ 골인하는 순간 그 즉시 다음 스테이지 영구 해금 처리!
        let maxStage = sharedSignal.maxUnlockedMazeStage || 1;
        if (sharedSignal.selectedMode === "MAZE" && maxStage <= sharedSignal.selectedStage) {
          sharedSignal.maxUnlockedMazeStage = sharedSignal.selectedStage + 1;
        }
      }
    }

    let centerC = Math.floor(sharedPos.px * COLS);
    let centerR = Math.floor(sharedPos.py * ROWS);
    if (centerR >= 0 && centerR < ROWS && centerC >= 0 && centerC < COLS) {
      let currentCell = currentMap[centerR][centerC];
      let prevSpeedMode = sharedSignal.speedMode;

      if (currentCell === 4) sharedSignal.speedMode = "FAST";
      else if (currentCell === 5) sharedSignal.speedMode = "SLOW";
      else if (currentCell === 6) sharedSignal.speedMode = "NORMAL";

      // 속도 변경 시 아이템 사운드 재생
      if (prevSpeedMode !== sharedSignal.speedMode) {
        if (typeof itemSound !== 'undefined' && itemSound.isLoaded()) {
          itemSound.play();
        }
      }

      if (sharedSignal.selectedStage === 6 && !isMap6HiddenActive()) {
        let sinkholeKey = getMap6SinkholeKey(centerR, centerC);
        if (sinkholeKey) enterMap6Hidden(sinkholeKey);
      }
    }

    let pGridX = sharedPos.px * COLS;
    let pGridY = sharedPos.py * ROWS;

    for (let i = sharedSignal.monsters.length - 1; i >= 0; i--) {
      let m = sharedSignal.monsters[i];
      let dToPlayer = dist(pGridX, pGridY, m.px, m.py);

      if (m.type === "BUBBLE") {
        if (dToPlayer < 0.6) { sharedSignal.breath += 1.5; if (sharedSignal.breath > 100) sharedSignal.breath = 100; }
      }
      if (m.type === "SLIME") {
        m.timer += 1;
        if (!m.isJumping && m.timer > random(40, 100)) {
          m.isJumping = true;
          m.timer = 0;
          let angle = random(TWO_PI);
          let distance = random(0.5, 1.5);
          m.targetX = m.baseX + cos(angle) * distance;
          m.targetY = m.baseY + sin(angle) * distance;
          m.vx = (m.targetX - m.px) / 30;
          m.vy = (m.targetY - m.py) / 30;
        }
        if (m.isJumping) {
          m.px += m.vx;
          m.py += m.vy;
          if (m.timer >= 30) {
            m.isJumping = false;
            m.timer = 0;
            m.px = m.targetX;
            m.py = m.targetY;
          }
        }
        if (dist(pGridX, pGridY, m.px, m.py) < 0.35) {
          sharedSignal.isDead = true;
          sharedSignal.currentDir = "NONE";
        }
      }
      if (m.type === "WOLF") {
        if (m.moveAxis === "X") {
          m.px += m.speed * 0.3 * m.dir;
          if (m.px >= m.maxBound || m.px <= m.minBound){
            m.dir *= -1;
            m.Xangle = !m.Xangle;
          }
        } else if (m.moveAxis === "Y") {
          m.py += m.speed * 0.7 * m.dir;
          if (m.py >= m.maxBound || m.py <= m.minBound) {
            m.dir *= -1;
            m.Yangle = !m.Yangle;
          }
        }
        if (dist(pGridX, pGridY, m.px, m.py) < 0.4) {
          sharedSignal.isDead = true;
          sharedSignal.currentDir = "NONE";
        }
      }

      // --- [3스테이지 연못 몬스터] ---
      if (m.type === "WATER_SPIRIT") {
        m.timer += 1;
        if (m.timer % 80 === 0) {
          let ang = atan2(pGridY - m.py, pGridX - m.px);
          sharedSignal.monsters.push({ type: "WATER_DROP", px: m.px, py: m.py, vx: cos(ang) * 0.06, vy: sin(ang) * 0.06 });
        }
      }
      if (m.type === "WATER_DROP") {
        m.px += m.vx; m.py += m.vy;
        let currentDist = dist(pGridX, pGridY, m.px, m.py);
        if (currentDist < 0.28) {
          sharedSignal.isDead = true;
          sharedSignal.currentDir = "NONE";
        }
        if (m.px < 0 || m.px > COLS || m.py < 0 || m.py > ROWS) {
          sharedSignal.monsters.splice(i, 1);
          continue;
        }
      }
      
      // 👉 악어 AI 로직 (숨어있다가 맵의 맨 윗줄 제외 0 부분에 랜덤 파괴)
      if (m.type === "CROCODILE") {
        m.timer += 1;
        // 1. 대기 상태 (1.5초)
        if (m.state === "IDLE" && m.timer > 90) {
          m.state = "WARN";
          
          // 맨 윗줄(r = 0)을 제외하고 전체 맵 데이터 중 0(길)에 해당하는 좌표를 모두 추출
          let validCells = [];
          for (let r = 1; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (currentMap[r][c] === 0) {
                validCells.push({ r: r, c: c });
              }
            }
          }
          
          // 추출된 유효 길 타일 중에서 무작위 타깃 1곳 선정
          if (validCells.length > 0) {
            let picked = random(validCells);
            m.biteR = picked.r;
            m.biteC = picked.c;
          }
        } 
        // 2. 경고 상태 (1초 동안 타일 위 붉은 점멸)
        else if (m.state === "WARN" && m.timer > 150) {
          m.state = "BITE";
        } 
        // 3. 파괴 상태 (2초 동안 벽으로 작동)
        else if (m.state === "BITE" && m.timer > 270) {
          m.state = "IDLE";
          m.timer = 0; // 길 복구 후 숨기
        }
        
        // 악어가 길을 부술 때(BITE) 그 위에 플레이어가 서 있었다면 즉시 잡아먹힘
        if (m.state === "BITE") {
          let pC = Math.floor(sharedPos.px * COLS);
          let pR = Math.floor(sharedPos.py * ROWS);
          if (pC === m.biteC && pR === m.biteR) {
            sharedSignal.isDead = true; 
            sharedSignal.currentDir = "NONE";
          }
        }
      }
      
      // 👉 세이렌 AI 로직 (범위 내 진입 후 일정 프레임 이상 유지될 때에만 흡입 기능 작동)
      if (m.type === "SIREN") {
        if (m.pullTimer === undefined) m.pullTimer = 0;

        if (dToPlayer < 3.5) { 
          m.pullTimer += 1;
          // 약 0.75초(45프레임) 이상 구역 내에 머무르고 있는 상태라면 끌어당김 작동
          if (m.pullTimer >= 125) {
            sharedPos.px += (m.px - pGridX) * 0.0018; 
            sharedPos.py += (m.py - pGridY) * 0.0018; 
          }
        } else {
          m.pullTimer = 0; // 범위를 탈출하면 인력 축적 대기 시간 초기화
        }
        
        if (dToPlayer < 0.35) {
          sharedSignal.isDead = true;
          sharedSignal.currentDir = "NONE";
        }
      }

      // --- [4, 5, 6 스테이지 몬스터 로직 유지] ---
      if (m.type === "MERMAID") {
        if (abs(pGridY - m.py) < 1) { 
          let pC = Math.floor(sharedPos.px * COLS);
          let pR = Math.floor(sharedPos.py * ROWS);

          // 1. 오른쪽 맨 끝 세 칸 (COLS - 3) 영역에 도달하면 더 이상 밀리지 않음
          if (pC < COLS - 3) {
            sharedPos.px += 0.0025;
          }
        }
      }
      if (m.type === "SHARK") {
        if (m.state === "HIDE") {
          if (dToPlayer < 2.5) {
            m.state = "ATTACK";
          }
        } else if (m.state === "ATTACK") {
          let ang = atan2(pGridY - m.py, pGridX - m.px);
          m.px += cos(ang) * 0.05;
          m.py += sin(ang) * 0.05;
          let currentDist = dist(pGridX, pGridY, m.px, m.py);
          if (currentDist < 0.4) {
            sharedSignal.isDead = true;
            sharedSignal.currentDir = "NONE";
          }
          if (currentDist > 10.0) {
            m.state = "HIDE";
          }
        }
      }
      if (m.type === "JELLYFISH") {
        m.px += m.vx;
        m.py += m.vy;
        if (m.px < 0.5 || m.px > COLS - 0.5) m.vx *= -1;
        if (m.py < 0.5 || m.py > ROWS - 0.5) m.vy *= -1;
        if (dist(pGridX, pGridY, m.px, m.py) < 0.4) {
          sharedSignal.isDead = true;
          sharedSignal.currentDir = "NONE";
        }
      }
      if (m.type === "OCTOPUS") {
        m.timer += 1;
        if (m.timer >= 180) { // 60프레임 * 3초 = 180
          m.timer = 0;
          m.inkZones = []; // 기존 먹물 초기화
          let centerR = Math.floor(m.py);
          let centerC = Math.floor(m.px);
          
          // 5x5 반경을 탐색하며 '길(0)'인 타일만 수집
          let walkableTiles = [];
          for (let r = centerR - 2; r <= centerR + 2; r++) {
            for (let c = centerC - 2; c <= centerC + 2; c++) {
              if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                if (currentMap[r][c] === 0) {
                  walkableTiles.push({r: r, c: c});
                }
              }
            }
          }
          
          // 수집된 길 중 무작위로 4군데에 먹물 생성 (길이 4개 미만이면 전부)
          let inkCount = Math.min(4, walkableTiles.length);
          for (let k = 0; k < inkCount; k++) {
            let idx = Math.floor(Math.random() * walkableTiles.length);
            let selected = walkableTiles.splice(idx, 1)[0];
            m.inkZones.push({ px: selected.c + 0.5, py: selected.r + 0.5, life: 150 }); // 먹물 유지 시간
          }
        }

        // 2. 먹물 수명 감소 및 플레이어 피격 판정
        for (let i = m.inkZones.length - 1; i >= 0; i--) {
          let ink = m.inkZones[i];
          ink.life -= 1;
          
          // 플레이어가 먹물 중앙과 가까이 닿았을 때 (먹물이 활성화된 상태일 때만)
          let distToInk = dist(pGridX, pGridY, ink.px, ink.py);
          if (distToInk < 0.4 && sharedSignal.stunTimer === 0) {
            sharedSignal.stunTimer = 120; // 2초간 기절
          }

          if (ink.life <= 0) {
            m.inkZones.splice(i, 1);
          }
        }
      }
      /*
      if (m.type === "CENTIPEDE") {
        m.timer += 1;

        // ⭐️ 수정: 매 프레임이 아니라 5프레임에 한 번씩만 꼬리 위치를 저장합니다. (마디 간격 벌림)
        if (!m.body) m.body = []; 
        if (m.timer % 5 === 0) {
          m.body.unshift({ px: m.px, py: m.py });
          
          // ⭐️ 마디 개수를 25개로 늘립니다. (간격 확대 + 마디 증가 = 엄청나게 길어짐!)
          if (m.body.length > 25) {
            m.body.pop(); 
          }
        }

        // 방향 전환 (60프레임마다)
        if (m.timer % 60 === 0) { 
          let rand = Math.floor(random(4));
          if (rand === 0) {
            m.dirX = 0.04;
            m.dirY = 0;
          } else if (rand === 1) {
            m.dirX = -0.04;
            m.dirY = 0;
          }
          else if (rand === 2) {
            m.dirX = 0; m.dirY = 0.04;
          } else if (rand === 3) {
            m.dirX = 0;
            m.dirY = -0.04;
          }
        }
        
        m.px += m.dirX;
        m.py += m.dirY; 
        m.px = constrain(m.px, 1, COLS-1); 
        m.py = constrain(m.py, 1, ROWS-1);
        
        // 머리 충돌 체크
        if (dToPlayer < 0.4) {
          sharedSignal.isDead = true;
          sharedSignal.currentDir = "NONE";
        }
        
        // 꼬리(몸통)들과의 충돌 체크
        for (let b of m.body) {
          if (dist(pGridX, pGridY, b.px, b.py) < 0.35) {
            sharedSignal.isDead = true;
            sharedSignal.currentDir = "NONE";
            break;
          }
        }
      }
      */
      if (m.type === "EAGLE") {
        m.px += 0.05 * m.dir;
        if (m.px >= COLS - 1 || m.px <= 1) m.dir *= -1;
        m.timer += 1;
        if (m.timer % 120 === 0) sharedSignal.monsters.push({ type: "ROCK", px: m.px, py: m.py });
      }
      if (m.type === "ROCK") {
        m.py += 0.12;
        let currentDist = dist(pGridX, pGridY, m.px, m.py);
        if (currentDist < 0.4) {
          sharedSignal.isDead = true;
          sharedSignal.currentDir = "NONE";
        }
        if (m.py > ROWS) {
          sharedSignal.monsters.splice(i, 1);
          continue;
        }
      }
      if (m.type === "BANSHEE") {
        m.timer += 1;
        
        if (m.state === 0) {
          // 정상 상태 (isReversed = false)
          sharedSignal.isReversed = false;
          
          if (m.timer >= m.duration) {
            m.state = 1;      // 반전 상태로 전환
            m.timer = 0;      // 타이머 리셋
            m.duration = random(240, 360); // 다음 상태 지속 시간을 2~5초 사이로 랜덤 설정
          }
        } else {
          // 반전 상태 (isReversed = true)
          sharedSignal.isReversed = true;
          
          if (m.timer >= m.duration) {
            m.state = 0;      // 정상 상태로 전환
            m.timer = 0;      // 타이머 리셋
            m.duration = random(180, 480); // 정상 상태 지속 시간을 3~7초 사이로 랜덤 설정
          }
        }
      }
      if (m.type === "SINKHOLE") {
        if (dToPlayer < 4.0) { sharedPos.px += (m.px - pGridX) * 0.0025;
          sharedPos.py += (m.py - pGridY) * 0.0025;
        }
        if (dToPlayer < 0.45) { sharedSignal.isDead = true;
          sharedSignal.currentDir = "NONE";
        }
      }
    }

    sharedPos.px = constrain(sharedPos.px, hitboxX, 1.0 - hitboxX);
    sharedPos.py = constrain(sharedPos.py, hitboxY, 1.0 - hitboxY);
  }

  if (sharedSignal.selectedStage === 6) {
    updateAndRenderMap6Hidden(cellW, cellH);
  }

  // 3. 모든 몬스터 실시간 그래픽 렌더링 루프
  for (let m of sharedSignal.monsters) {
    let mx = m.px * cellW;
    let my = m.py * cellH;

    if (m.type === "BUBBLE") {
      m.timer += 0.05;
      let floatY = sin(m.timer) * (cellH * 0.1);
      let bx = m.px * cellW;
      let by = m.py * cellH + floatY;
      for(let mI of imgMonsters){                                                   //ppppppppppppppp
        if(mI.type === m.type){
          image(mI.img, bx - cellW * 0.3, by - cellH * 0.3, cellW * 0.6, cellH * 0.6);
        }
      }
      /*
      fill(100, 200, 255, 150);
      stroke(255, 255, 255, 200);
      strokeWeight(2);
      ellipse(bx, by, cellW * 0.6, cellH * 0.6);
      fill(255, 255, 255, 200);
      noStroke();
      ellipse(bx - cellW * 0.15, by - cellH * 0.15, cellW * 0.15, cellH * 0.15);
      */
    }

    if (m.type === "SLIME") {
      let sx = m.px * cellW;
      let sy = m.py * cellH;
      let jumpY = 0;
      if (m.isJumping) {
        let progress = m.timer / 30;
        if (progress <= 1) {
          jumpY = sin(progress * PI) * (cellH * 0.8);
        }
      }
      for(let mI of imgMonsters){
        if(mI.type === m.type){
          if(m.isJumping){
            image(mI.img1, sx - cellW*0.35, sy - cellH*0.5 - jumpY, cellW*0.7, cellH*0.7);
          } else {
            image(mI.img2, sx - cellW*0.35, sy - cellH*0.5, cellW*0.7, cellH*0.7);
          }
        }
      }
    }
    if (m.type === "WOLF") {
      let wx = m.px * cellW;
      let wy = m.py * cellH;
      for(let mI of imgMonsters){
        if(mI.type === m.type && m.moveAxis === "X" && mI.moveAxis === "X"){
          if(m.Xangle === true){
            if (frameCount % 60 < 30) {
              image(mI.img1, wx - cellW*0.4, wy - cellH*0.4, cellW*0.8, cellH*0.8);
            } else{
              image(mI.img2, wx - cellW*0.4, wy - cellH*0.4, cellW*0.8, cellH*0.8);
            }
          } else{
            if (frameCount % 60 < 30) {
              image(mI.img3, wx - cellW*0.4, wy - cellH*0.4, cellW*0.8, cellH*0.8);
            } else{
              image(mI.img4, wx - cellW*0.4, wy - cellH*0.4, cellW*0.8, cellH*0.8);
            }
          }
        }
      }
      for(let mI of imgMonsters){
        if(mI.type === m.type && m.moveAxis === "Y" && mI.moveAxis === "Y"){
          if(m.Yangle === true){
            if (frameCount % 60 < 30) {
              image(mI.img1, wx - cellW*0.4, wy - cellH*0.4, cellW*0.8, cellH*0.8);
            } else{
              image(mI.img2, wx - cellW*0.4, wy - cellH*0.4, cellW*0.8, cellH*0.8);
            }
          } else{
            if (frameCount % 60 < 30) {
              image(mI.img3, wx - cellW*0.4, wy - cellH*0.4, cellW*0.8, cellH*0.8);
            } else{
              image(mI.img4, wx - cellW*0.4, wy - cellH*0.4, cellW*0.8, cellH*0.8);
            }
          }
        }
      }
    }
    if (m.type === "WATER_SPIRIT") {                                        //ppppppppppppppppppppppppppp
      for(let mI of imgMonsters){
        if(mI.type === m.type){
          image(mI.img, mx - cellW * 0.35, my - cellH * 0.35, cellW * 0.7, cellH * 0.7)
        }
      }
    }
    if (m.type === "WATER_DROP") {
      let mI = imgMonsters.find(img => img.type === "WATER_DROP");
      if (mI && mI.img) {
        image(mI.img, mx - cellW * 0.2, my - cellH * 0.2, cellW * 0.4, cellH * 0.4);
      } else {
        fill(64, 224, 208);
        noStroke();
        ellipse(mx, my, cellW * 0.3, cellH * 0.3);
      }
    }
    
    // 👉 악어 렌더링 (타일 파괴 시각 효과 반영)
    if (m.type === "CROCODILE") {
      let bx = m.biteC * cellW;
      let by = m.biteR * cellH;

      if (m.state === "WARN") {
        fill(255, 0, 0, (frameCount % 20 < 10) ? 120 : 40);
        stroke(255, 0, 0);
        strokeWeight(3);
        rect(bx, by, cellW, cellH);
        fill(255, 0, 0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(cellH * 0.5);
        text("⚠️", bx + cellW/2, by + cellH/2);
      } else if (m.state === "BITE") {                                                  //ppppppppppppppppppp
        for(let mI of imgMonsters){
          if(mI.type === m.type){
            image(mI.img, bx, by, cellW, cellH);
          }
        }
        /*
        // 부서져서 물로 바뀐 타일 배경 표현
        fill(40, 90, 150); noStroke(); 
        rect(bx, by, cellW, cellH);
        
        // 악어 머리 실루엣 그리기
        fill(46, 139, 87); stroke(0); strokeWeight(2);
        rect(bx + cellW*0.1, by + cellH*0.2, cellW*0.8, cellH*0.6, 5);
        fill(255); noStroke(); 
        triangle(bx + cellW*0.2, by + cellH*0.2, bx + cellW*0.4, by + cellH*0.2, bx + cellW*0.3, by + cellH*0.1);
        triangle(bx + cellW*0.6, by + cellH*0.2, bx + cellW*0.8, by + cellH*0.2, bx + cellW*0.7, by + cellH*0.1);
        triangle(bx + cellW*0.2, by + cellH*0.8, bx + cellW*0.4, by + cellH*0.8, bx + cellW*0.3, by + cellH*0.9);
        triangle(bx + cellW*0.6, by + cellH*0.8, bx + cellW*0.8, by + cellH*0.8, bx + cellW*0.7, by + cellH*0.9);
        fill(255, 255, 0); ellipse(bx + cellW*0.25, by + cellH*0.5, 6, 6); ellipse(bx + cellW*0.75, by + cellH*0.5, 6, 6);
        fill(0); ellipse(bx + cellW*0.25, by + cellH*0.5, 3, 3); ellipse(bx + cellW*0.75, by + cellH*0.5, 3, 3);
        */
      }
    }

    if (m.type === "SIREN") {
      for(let mI of imgMonsters){
        if(mI.type === m.type){
          image(mI.img1, mx - cellW * 0.5, my - cellH * 0.5, cellW * 1, cellH * 1);
        }
      }
    }
    if (m.type === "MERMAID") {
      for(let mI of imgMonsters){
        if(mI.type === m.type){
          image(mI.img, mx - cellW * 0.5, my - cellH * 0.5, cellW, cellH);
        }
      }
    }
    if (m.type === "SHARK") {
      if (m.state === "HIDE") {
        for(let mI of imgMonsters){
          if(mI.type === m.type){
            image(mI.img1, mx - cellW*0.5, my - cellH*0.5, cellW, cellH);
          }
        }
      } else {
        for(let mI of imgMonsters){
          if(mI.type === m.type){
            if(sharedPos.px * COLS > m.px){
              image(mI.img2, mx - cellW*0.4, my - cellH*0.5, cellW*0.8, cellH*0.8);
            } else{
              image(mI.img3, mx - cellW*0.4, my - cellH*0.5, cellW*0.8, cellH*0.8);
            }
          }
        }
      }
    }
    if (m.type === "JELLYFISH") {
      for(let mI of imgMonsters){
        if(mI.type === m.type){
          image(mI.img, mx - cellW*0.4, my - cellH*0.5, cellW*0.8, cellH*0.8);
        }
      }
    }
    if (m.type === "OCTOPUS") {
      if (m.inkZones) {
        for (let ink of m.inkZones) {
          // 수명에 따라 깜빡이거나 흐려지는 연출
          let alpha = map(ink.life, 0, 150, 0, 200);
          fill(20, 20, 20, alpha);
          noStroke();
          ellipse(ink.px * cellW, ink.py * cellH, cellW * 0.8, cellH * 0.8);
        }
      }
      
      for(let mI of imgMonsters){
        if(mI.type === m.type){
          image(mI.img, mx - cellW * 0.5, my - cellH * 0.5, cellW, cellH);
        }
      }
    }
    /*
    if (m.type === "CENTIPEDE") {                                                       //lllllpppppp
      // ⭐️ 추가: 몸통(꼬리) 그리기
      if (m.body) {
        for (let i = 0; i < m.body.length; i++) {
          let b = m.body[i];
          let bx = b.px * cellW;
          let by = b.py * cellH;
          // 꼬리로 갈수록 살짝 작아지는 효과
          let bSize = map(i, 0, m.body.length, cellW * 0.45, cellW * 0.2); 
          fill(180, 80, 20); // 머리보다 약간 어두운 색
          stroke(0); 
          ellipse(bx, by, bSize, bSize);
        }
      }

      // 머리 그리기
      
      fill(210, 105, 30);
      stroke(0);
      ellipse(mx, my, cellW * 0.5, cellH * 0.5);

      // 머리 장식 (눈 등) 추가 가능
      fill(0);
      noStroke();
      ellipse(mx - 3, my - 3, 3, 3);
      ellipse(mx + 3, my - 3, 3, 3);
      
      for(mI of imgMonsters){
        if(mI.type === m.type){
          image(mI.img1, mx - cellW * 0.35, my - cellH * 0.35, cellW * 0.7, cellH * 0.)
        }
      }
    }
    */
    if (m.type === "EAGLE") {       
                                                        //ppppppppppppppppppppp
      for(let mI of imgMonsters){
        if(mI.type === m.type){
          if (m.dir === 1) {
            if (frameCount % 60 < 30) {
              image(mI.img1, mx-12, my-6, cellW, cellH);
            } else{
              image(mI.img2, mx-12, my-6, cellW, cellH);
            }
          } else {
            if (frameCount % 60 < 30) {
              image(mI.img3, mx-12, my-6, cellW, cellH);
            } else{
              image(mI.img4, mx-12, my-6, cellW, cellH);
            }
          }
        }
      }
      /*
      fill(139, 69, 19);
      stroke(0);
      triangle(mx, my-6, mx-12, my+6, mx+12, my+6);
      */
    }
    if (m.type === "ROCK") {                                                          //llllpppp
      let mI = imgMonsters.find(img => img.type === "ROCK");
      if (mI && mI.img) {
        image(mI.img, mx - cellW * 0.3, my - cellH * 0.3, cellW * 0.6, cellH * 0.6);
      } else {
        fill(105);
        stroke(0);
        ellipse(mx, my, cellW * 0.45, cellH * 0.45);
      }
    }
    if (m.type === "SINKHOLE") {
      noStroke();
      rectMode(CENTER);
      fill(222, 184, 135, 120);
      rect(mx, my, cellW, cellH);
      rectMode(CORNER)
      fill(225, 150, 102, 100);
      ellipse(mx, my, cellW * 3.5, cellH * 3.5);
      fill(101, 67, 33);
      ellipse(mx, my, cellW * 0.6, cellH * 0.6);
    }
  }

  // 4. 캐릭터 그리기
  localPx = lerp(localPx, sharedPos.px, 0.2);
  localPy = lerp(localPy, sharedPos.py, 0.2);

  let drawX = localPx * windowWidth;
  let drawY = localPy * windowHeight;

  /*
  if (sharedSignal.isDead) fill(150); 
  else if (sharedSignal.selectedStage === 5 && sharedSignal.isReversed) fill(186, 85, 211); 
  else fill(255, 100, 100);
  
  stroke(0); strokeWeight(1.5);
  ellipse(drawX, drawY, 20, 20); 
  
  fill(0); noStroke();
  ellipse(drawX - 3, drawY - 3, 3, 3); ellipse(drawX + 3, drawY - 3, 3, 3);
  */
  
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

  if (sharedSignal.stunTimer > 0) {
    textSize(20);
    textAlign(CENTER, BOTTOM);
    text("💢 기절!", drawX, drawY - 15); 
  }

  textAlign(CENTER);
  textSize(10);
  fill(0);
  text(sharedSignal.isDead ? "사망" : "", drawX, drawY + 20);

  // 5. 상단 UI
  noStroke();
  fill(220);
  rect(0, 0, windowWidth, 60);
  textAlign(LEFT, CENTER);
  textSize(18);
  fill(0);
  text("스테이지 " + sharedSignal.selectedStage, 20, 30);
  
  let statusText = partyIsHost() ? "👑 방장(Host)" : "👤 게스트(Guest)";
  let speedText = "보통";
  if (sharedSignal.speedMode === "FAST") speedText = "⚡ 초고속 (제어 불가!!)";
  if (sharedSignal.speedMode === "SLOW") speedText = "🐢 초슬로우 (답답함!!)";
  
  let reverseStatus = sharedSignal.isReversed ? " | ⚠️ 방향 뒤틀림!" : "";
  text(statusText + " | 신호: " + sharedSignal.currentDir + " | 상태: " + speedText + reverseStatus, 180, 30);

  if (sharedSignal.selectedStage === 4) {
    fill(50, 50, 50, 200);
    rect(20, 65, 300, 18, 5); 
    if (sharedSignal.breath <= 30) fill(255, 50, 50); else fill(50, 150, 255);
    rect(20, 65, map(sharedSignal.breath, 0, 100, 0, 300), 18, 5);
    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("💧 남은 호흡", 170, 74);
  }

  if (sharedSignal.selectedStage === 6) {
    fill(50, 50, 50, 200);
    rect(20, 65, 300, 18, 5);
    let hiddenProgress = isMap6HiddenActive() ? 1 : 0;
    fill(218, 165, 32);
    rect(20, 65, map(hiddenProgress, 0, 1, 0, 300), 18, 5);
    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("🏜️ 모래홀 기믹 진행 중 : 불빛으로 몬스터를 밀어내세요", 170, 74);
  }

  // 6. 결과 및 일시정지 오버레이 화면
  if (sharedSignal.isDead) {
    fill(0, 0, 0, 180);
    rect(0, 0, windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    fill(255, 50, 50);
    textSize(50);
    text("💀 게임 오버! 💀", windowWidth/2, windowHeight/2 - 100);

    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(windowWidth/2 - 180, windowHeight/2, 160, 60, 10);
    fill(0);
    noStroke();
    textSize(20);
    text("🔄 다시 하기", windowWidth/2 - 100, windowHeight/2 + 30);

    fill(200);
    stroke(0);
    strokeWeight(2);
    rect(windowWidth/2 + 20, windowHeight/2, 160, 60, 10);
    fill(0);
    noStroke();
    textSize(18);
    text("🔙 스테이지 선택", windowWidth/2 + 100, windowHeight/2 + 30);
  }
  else if (sharedSignal.isSuccess) {
    fill(255, 255, 255, 200);
    rect(0, 0, windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    fill(50, 150, 255);
    textSize(50);
    text("🎉 스테이지 클리어! 🎉", windowWidth/2, windowHeight/2 - 100);

    if (sharedSignal.selectedStage < 6) {
      fill(150, 200, 255);
      stroke(0);
      strokeWeight(2);
      rect(windowWidth/2 - 180, windowHeight/2, 160, 60, 10);
      fill(0);
      noStroke();
      textSize(18);
      text("▶️ 다음 스테이지", windowWidth/2 - 100, windowHeight/2 + 30);

      fill(200, 255, 200);
      stroke(0);
      strokeWeight(2);
      rect(windowWidth/2 + 20, windowHeight/2, 160, 60, 10);
      fill(0);
      noStroke();
      textSize(18);
      text("🔙 스테이지 선택", windowWidth/2 + 100, windowHeight/2 + 30);
    } else {
      fill(200, 255, 200);
      stroke(0);
      strokeWeight(2);
      rect(windowWidth/2 - 100, windowHeight/2, 200, 60, 10);
      fill(0);
      noStroke();
      textSize(20);
      text("🔙 스테이지 선택", windowWidth/2, windowHeight/2 + 30);
    }
  }

  if (sharedSignal.isPaused && !sharedSignal.isDead && !sharedSignal.isSuccess) {
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
    text("⏭️ 스테이지 스킵", windowWidth/2, windowHeight/2 + 165);
  }
}

function mousePressedGame(mx, my) {
  if (sharedSignal.isPaused && !sharedSignal.isDead && !sharedSignal.isSuccess) {
    if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 - 40 && my < windowHeight/2 + 10) {
      partyEmit("togglePause");
    }
    else if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 + 20 && my < windowHeight/2 + 70) {
      partyEmit("requestRetry");
    }
    else if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 + 80 && my < windowHeight/2 + 130) {
      partyEmit("changeGameState", 4);
    }
    else if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 + 140 && my < windowHeight/2 + 190) {
      partyEmit("skipStage");
    }
    return; 
  }

  if (sharedSignal.isDead) {
    if (mx > windowWidth/2 - 180 && mx < windowWidth/2 - 20 && my > windowHeight/2 && my < windowHeight/2 + 60) {
      partyEmit("requestRetry");
    }
    if (mx > windowWidth/2 + 20 && mx < windowWidth/2 + 180 && my > windowHeight/2 && my < windowHeight/2 + 60) {
      partyEmit("changeGameState", 4);
    }
  }
  else if (sharedSignal.isSuccess) {
    if (sharedSignal.selectedStage < 6) {
      if (mx > windowWidth/2 - 180 && mx < windowWidth/2 - 20 && my > windowHeight/2 && my < windowHeight/2 + 60) {
        partyEmit("requestNextStage");
      }
      if (mx > windowWidth/2 + 20 && mx < windowWidth/2 + 180 && my > windowHeight/2 && my < windowHeight/2 + 60) {
        partyEmit("changeGameState", 4);
      }
    } else {
      if (mx > windowWidth/2 - 100 && mx < windowWidth/2 + 100 && my > windowHeight/2 && my < windowHeight/2 + 60) {
        partyEmit("requestModeSelect");
      }
    }
  }
}

function keyPressedGame() {
  if (keyCode === ESCAPE || key === 'Escape') {
    if (!sharedSignal.isDead && !sharedSignal.isSuccess) {
      partyEmit("togglePause");
    }
    return;
  }

  if (sharedSignal.isDead || sharedSignal.isSuccess || sharedSignal.isPaused) return;

  let inputKey = key.toLowerCase();

  if (sharedSignal.selectedStage === 6 && isMap6HiddenActive()) {
    if (keyCode === UP_ARROW) {
      partyEmit("playerInput", "FIRE_UP");
      return false;
    }
    if (keyCode === LEFT_ARROW) {
      partyEmit("playerInput", "FIRE_LEFT");
      return false;
    }
    if (keyCode === DOWN_ARROW) {
      partyEmit("playerInput", "FIRE_DOWN");
      return false;
    }
    if (keyCode === RIGHT_ARROW) {
      partyEmit("playerInput", "FIRE_RIGHT");
      return false;
    }
  }

  let newDir = null;
  if (me.role === 4) {
    if (inputKey === 'w' || key === 'ㅈ') newDir = "UP";
    if (inputKey === 'a' || key === 'ㅁ') newDir = "LEFT";
    if (inputKey === 's' || key === 'ㄴ') newDir = "DOWN";
    if (inputKey === 'd' || key === 'ㅇ') newDir = "RIGHT";
  } else {
    if (me.role === 0 && (inputKey === 'w' || key === 'ㅈ')) newDir = "UP";
    if (me.role === 1 && (inputKey === 'a' || key === 'ㅁ')) newDir = "LEFT";
    if (me.role === 2 && (inputKey === 's' || key === 'ㄴ')) newDir = "DOWN";
    if (me.role === 3 && (inputKey === 'd' || key === 'ㅇ')) newDir = "RIGHT";
  }

  if (newDir) {
    partyEmit("playerInput", newDir);
  }
}
// =========================================================================
// desert hidden gimmick helpers
// =========================================================================

let map6MainOverlayCache = null;

function buildMap6MainWithSinkholes() {
  if (map6MainOverlayCache) return map6MainOverlayCache;

  if (typeof MAZE_MAP_6 === "undefined") return null;

  map6MainOverlayCache = MAZE_MAP_6.map(row => row.slice());

  if (typeof MAZE_MAP_6_SINKHOLES !== "undefined") {
    for (let hole of MAZE_MAP_6_SINKHOLES) {
      if (
        map6MainOverlayCache[hole.r] &&
        typeof map6MainOverlayCache[hole.r][hole.c] !== "undefined"
      ) {
        map6MainOverlayCache[hole.r][hole.c] = 7;
      }
    }
  }

  return map6MainOverlayCache;
}

function isMap6HiddenActive() {
  return !!(sharedSignal && sharedSignal.map6HiddenActive);
}

function getMap6SinkholeKey(r, c) {
  if (typeof MAZE_MAP_6_SINKHOLES === "undefined") return null;
  for (let hole of MAZE_MAP_6_SINKHOLES) {
    if (hole.r === r && hole.c === c) return hole.key;
  }
  return null;
}

function getMap6HiddenRouteByKey(key) {
  if (typeof MAP_6_HIDDEN_ROUTES === "undefined") return null;
  return MAP_6_HIDDEN_ROUTES[key] || null;
}

function resetMap6HiddenState() {
  if (!sharedSignal) return;
  sharedSignal.map6HiddenActive = false;
  sharedSignal.map6HiddenKey = "";
  sharedSignal.map6HiddenMonsters = [];
  sharedSignal.map6HiddenFireDir = "NONE";
  sharedSignal.map6HiddenFireTimer = 0;
}

function enterMap6Hidden(key) {
  const route = getMap6HiddenRouteByKey(key);
  if (!route) return;

  sharedSignal.map6HiddenActive = true;
  sharedSignal.map6HiddenKey = key;
  sharedSignal.map6HiddenFireDir = "NONE";
  sharedSignal.map6HiddenFireTimer = 0;
  sharedSignal.map6HiddenMonsters = route.monsters.map(m => ({
    ...m,
    fleeTimer: 0,
    basePx: m.px,
    basePy: m.py
  }));

  sharedSignal.currentDir = "NONE";
  sharedSignal.speedMode = "NORMAL";

  sharedPos.px = (route.spawn.c + 0.5) / COLS;
  sharedPos.py = (route.spawn.r + 0.5) / ROWS;
  localPx = sharedPos.px;
  localPy = sharedPos.py;

  if (partyIsHost()) {
    sharedSignal.isPaused = false;
  }
}

function exitMap6Hidden() {
  const route = getMap6HiddenRouteByKey(sharedSignal.map6HiddenKey);
  if (!route) {
    resetMap6HiddenState();
    return;
  }

  sharedSignal.map6HiddenActive = false;
  sharedSignal.map6HiddenKey = "";
  sharedSignal.map6HiddenFireDir = "NONE";
  sharedSignal.map6HiddenFireTimer = 0;
  sharedSignal.map6HiddenMonsters = [];
  sharedSignal.currentDir = "NONE";

  sharedPos.px = (route.exit.c + 0.5) / COLS;
  sharedPos.py = (route.exit.r + 0.5) / ROWS;
  localPx = sharedPos.px;
  localPy = sharedPos.py;
}

function setMap6HiddenFireDir(dir) {
  if (!sharedSignal) return;
  sharedSignal.map6HiddenFireDir = dir;
}

function isFireMatchingMonster(m, fireDir, pGridX, pGridY) {
  if (!fireDir || fireDir === "NONE") return false;

  const dx = m.px - pGridX;
  const dy = m.py - pGridY;
  const distance = sqrt(dx * dx + dy * dy);

  if (distance > 5.0 || distance < 0.001) return false;

  let lightAngle = 0;
  if (fireDir === "UP") lightAngle = -HALF_PI;
  else if (fireDir === "RIGHT") lightAngle = 0;
  else if (fireDir === "DOWN") lightAngle = HALF_PI;
  else if (fireDir === "LEFT") lightAngle = PI;

  const angleToMonster = atan2(dy, dx);
  const diff = abs(
    atan2(
      sin(angleToMonster - lightAngle),
      cos(angleToMonster - lightAngle)
    )
  );

  // 빛 원뿔 안에 있을 때만 밀려남
  return diff < PI / 7;
}

function drawMap6HiddenLightCone(cellW, cellH, fireDir) {
  if (!fireDir || fireDir === "NONE") return;

  const px = sharedPos.px * windowWidth;
  const py = sharedPos.py * windowHeight;

  push();
  translate(px, py);

  let ang = 0;
  if (fireDir === "UP") ang = -HALF_PI;
  else if (fireDir === "RIGHT") ang = 0;
  else if (fireDir === "DOWN") ang = HALF_PI;
  else if (fireDir === "LEFT") ang = PI;

  rotate(ang);

  noStroke();
  blendMode(ADD);

  for (let i = 0; i < 7; i++) {
    const len = 90 + i * 46;
    const spread = 12 + i * 7;
    const alpha = 20 - i * 2;
    fill(255, 244, 200, alpha);
    beginShape();
    vertex(10, 0);
    bezierVertex(len * 0.35, -spread, len * 0.78, -spread * 0.75, len, 0);
    bezierVertex(len * 0.78, spread * 0.75, len * 0.35, spread, 10, 0);
    endShape(CLOSE);
  }

  fill(255, 250, 220, 60);
  ellipse(0, 0, 22, 22);

  pop();
}

function updateAndRenderMap6Hidden(cellW, cellH) {
  if (!isMap6HiddenActive()) return;

  const route = getMap6HiddenRouteByKey(sharedSignal.map6HiddenKey);
  if (!route) return;

  if (!sharedSignal.map6HiddenMonsters || sharedSignal.map6HiddenMonsters.length === 0) {
    sharedSignal.map6HiddenMonsters = route.monsters.map(m => ({
      ...m,
      fleeTimer: 0,
      basePx: m.px,
      basePy: m.py
    }));
  }

  const fireDir = sharedSignal.map6HiddenFireDir || "NONE";
  const pGridX = sharedPos.px * COLS;
  const pGridY = sharedPos.py * ROWS;

  background(237, 218, 164);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = route.map[r][c];
      if (t === 1) {
        fill(186, 150, 84);
        rect(c * cellW, r * cellH, cellW, cellH);
      } else if (t === 0 || t === 2) {
        fill(240, 214, 160);
        rect(c * cellW, r * cellH, cellW, cellH);
      } else if (t === 3) {
        fill(255, 224, 120, 180);
        rect(c * cellW, r * cellH, cellW, cellH);
        fill(255, 255, 255);
        textAlign(CENTER, CENTER);
        textSize(cellH * 0.45);
        text("🏁", c * cellW + cellW / 2, r * cellH + cellH / 2);
      }
    }
  }

  drawMap6HiddenLightCone(cellW, cellH, fireDir);

  for (let m of sharedSignal.map6HiddenMonsters) {
    if (!m.fleeTimer) m.fleeTimer = 0;

    if (!sharedSignal.isPaused) {
      if (fireDir !== "NONE" && isFireMatchingMonster(m, fireDir, pGridX, pGridY)) {
        m.fleeTimer = 50;
      }

      if (m.fleeTimer > 0) {
        const away = atan2(m.py - pGridY, m.px - pGridX);
        m.px += cos(away) * (m.fleeSpeed || 0.08);
        m.py += sin(away) * (m.fleeSpeed || 0.08);
        m.fleeTimer -= 1;
      } else {
        const toPlayer = atan2(pGridY - m.py, pGridX - m.px);
        m.px += cos(toPlayer) * (m.speed || 0.025);
        m.py += sin(toPlayer) * (m.speed || 0.025);
      }

      m.px = constrain(m.px, 0.4, COLS - 0.4);
      m.py = constrain(m.py, 0.4, ROWS - 0.4);
    }

    const dToPlayer = dist(pGridX, pGridY, m.px, m.py);

    if (!sharedSignal.isPaused) {
      if (dToPlayer < 0.42 && !sharedSignal.isDead && !sharedSignal.isSuccess) {
        sharedSignal.isDead = true;
        sharedSignal.currentDir = "NONE";
      }
    }

    const revealRadius = 2.0;
    if (dToPlayer > revealRadius) continue;

    const appear = constrain(map(dToPlayer, revealRadius, 0.0, 0.0, 1.0), 0, 1);
    const alpha = 18 + Math.pow(appear, 0.9) * 230;
    const glowAlpha = 10 + Math.pow(appear, 0.75) * 90;

    const mx = m.px * cellW;
    const my = m.py * cellH;

    noStroke();
    fill(186, 145, 72, glowAlpha);
    ellipse(mx, my, cellW * (0.55 + appear * 0.45), cellH * (0.55 + appear * 0.45));

    fill(120, 90, 40, alpha);
    stroke(65, 45, 20, alpha);
    strokeWeight(2);
    ellipse(mx, my, cellW * 0.8, cellH * 0.8);
    fill(255, 245, 200, alpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(cellH * 0.42);
    text("⛏️", mx, my);
  }

  noStroke();
  fill(255, 255, 255);
  textAlign(CENTER, CENTER);
  textSize(15);
  text("화살표 키로 불빛 방향을 고정해 모래 몬스터를 밀어내세요", windowWidth / 2, 95);
}

function getCurrentMap() {
  if (sharedSignal.selectedStage === 6) {
    if (isMap6HiddenActive()) {
      const route = getMap6HiddenRouteByKey(sharedSignal.map6HiddenKey);
      if (route) return route.map;
    }
    const main = buildMap6MainWithSinkholes();
    if (main) return main;
    return MAZE_MAP_6;
  }

  if (sharedSignal.selectedStage === 1) return MAZE_MAP_1;
  if (sharedSignal.selectedStage === 2) return MAZE_MAP_2;
  if (sharedSignal.selectedStage === 3) return MAZE_MAP_3;
  if (sharedSignal.selectedStage === 4) return MAZE_MAP_4;
  if (sharedSignal.selectedStage === 5) return MAZE_MAP_5;
  return MAZE_MAP_1;
}
