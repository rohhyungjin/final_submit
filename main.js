// =========================================================================
// main.js
// =========================================================================

let bgmMenu;
let bgmMaze;
let bgmBullet;
let currentBGM = null; // 현재 재생 중인 음악 추적용

let grassSound, forestSound, pondSound, canyonSound, desertSound, hiddenDesertSound, sharkSound, deathSound, successSound, itemSound;
let localIsDead = false;
let localIsSuccess = false;

let skinParticles = []; // 파티클 스킨용 배열

let sharedPos;    
let sharedSignal; 
let me;           
let participants; 

let myGameState = 1; 

const ROLES = ["W (위쪽 ⬆️)", "A (왼쪽 ⬅️)", "S (아래쪽 ⬇️)", "D (오른쪽 ➡️)"];
let MOVE_SPEED_X; 
let MOVE_SPEED_Y; 

const MAX_STAGES = 6;

let imgTitle;
let imgBackground;

let imgMainCharacter = [];
let imgMonsters = [];

let imgGrass;
let imgGrass2;
let imgGrassPath;

let imgForest;
let imgForest2;
let imgForestPath;

let imgPond;
let imgPondPath;

let imgDeepSea;
let imgDeepSeaPath;
let imgCurrent;
let imgBubble;

let imgCanyon1;
let imgCanyon2;
let imgCanyonPath;

let imgDessert1;
let imgDessert2;
let imgDessertPath;

let imgBalrog;
let imgCrown;

let wallPatterns = [];

function preload() {
  imgMainCharacter[0] = loadImage("주인공_오_1.png");
  imgMainCharacter[1] = loadImage("주인공_오_2.png");
  imgMainCharacter[2] = loadImage("주인공_왼_1.png");
  imgMainCharacter[3] = loadImage("주인공_왼_2.png");
  for (let i = 0; i < 4; i++) {
    imgMainCharacter[i].resize(30, 30);
  }
  imgMonsters.push({type: "SLIME", img1: loadImage("슬라임_1.png"), img2: loadImage("슬라임_2.png")});
  imgMonsters.push({type: "WOLF", moveAxis: "X", img1: loadImage("늑대_X_1.png"), img2: loadImage("늑대_X_2.png"), img3: loadImage("늑대_X_3.png"), img4: loadImage("늑대_X_4.png") });
  imgMonsters.push({type: "WOLF", moveAxis: "Y", img1: loadImage("늑대_Y_1.png"), img2: loadImage("늑대_Y_2.png"), img3: loadImage("늑대_Y_3.png"), img4: loadImage("늑대_Y_4.png") });
  imgMonsters.push({type: "JELLYFISH", img: loadImage("해파리.png")});
  imgMonsters.push({type: "SHARK", img1: loadImage("상어_1.jpg"), img2: loadImage("상어_2.png"), img3: loadImage("상어_3.png")});
  imgMonsters.push({type: "SIREN", img1: loadImage("세이렌_1.png")});
  imgMonsters.push({type: "MERMAID", img: loadImage("인어.png")});
  imgMonsters.push({type: "OCTOPUS", img: loadImage("문어.png")});
  imgMonsters.push({type: "BUBBLE", img: loadImage("공기_방울.png")});
  imgMonsters.push({type: "WATER_SPIRIT", img: loadImage("물_정령.png")});
  imgMonsters.push({type: "CROCODILE", img: loadImage("악어.jpg")});
  imgMonsters.push({type: "EAGLE", img1: loadImage("독수리_1.png"), img2: loadImage("독수리_2.png"), img3: loadImage("독수리_3.png"), img4: loadImage("독수리_4.png")});
  imgMonsters.push({type: "WATER_DROP", img: loadImage("물.png")});
  imgMonsters.push({type: "ROCK", img: loadImage("돌.png")});
  //imgMonsters.push({type: "CENTIPEDE", img1: loadImage("뱀_머리.png")});

  imgTitle = loadImage("타이틀_화면.jpg");
  imgBackground = loadImage("로비_화면.jpg");

  imgGrass = loadImage("초원_1.jpg");
  imgGrass2 = loadImage("초원_2.png");
  imgGrassPath = loadImage("초원_길.png");

  imgForest = loadImage("숲_1.jpg");
  imgForest2 = loadImage("숲_2.jpg");
  imgForestPath = loadImage("숲_길.png");

  imgPond = loadImage("연못_1.png");
  imgPondPath = loadImage("연못_길.jpg");

  imgDeepSea = loadImage("심해_1.jpg");
  imgDeepSeaPath = loadImage("심해_길.jpg");
  imgCurrent = loadImage("해류.jpg");

  imgCanyon1 = loadImage("협곡_1.jpg");
  imgCanyon2 = loadImage("협곡_2.jpg");
  imgCanyonPath = loadImage("협곡_길.jpg");

  imgDessert1 = loadImage("사막_1.jpg");
  imgDessert2 = loadImage("사막_2.jpg");
  imgDessertPath = loadImage("사막_길.jpg");

  imgBalrog = loadImage("balrog_boss.png");
  imgCrown = loadImage("왕관.png");

  soundFormats('mp3', 'ogg');
  bgmMenu = loadSound('bgm_menu.mp3');
  bgmMaze = loadSound('bgm_maze.mp3');
  bgmBullet = loadSound('bgm_bullet.mp3');
  grassSound = loadSound('grass_sound.mp3');
  forestSound = loadSound('forest_sound.mp3');
  pondSound = loadSound('pond_sound.mp3');
  canyonSound = loadSound('canyon_sound.mp3');
  desertSound = loadSound('desert_sound.mp3');
  hiddenDesertSound = loadSound('hidden_desert_sound.mp3');
  sharkSound = loadSound('shark_sound.mp3');
  deathSound = loadSound('death_sound.mp3');
  successSound = loadSound('success_sound.mp3');
  itemSound = loadSound('item_sound.mp3');

  partyConnect("wss://demoserver.p5party.org", "don'tBlameOthers", "main_room_v2");
  
  sharedPos = partyLoadShared("position"); // 초기값 제거
  sharedSignal = partyLoadShared("signal"); // 초기값 제거

  sharedPos = partyLoadShared("position", { px: 0.125, py: 0.15625 });
  
  sharedSignal = partyLoadShared("signal", { 
    currentDir: "NONE",
    currentGameState: 1,
    selectedMode: "MAZE",
    selectedStage: 0,
    isDead: false,
    isSuccess: false,
    speedMode: "NORMAL",
    isPaused: false,
    breath: 100,
    isReversed: false,
    stunTimer: 0,
    monsters: [],
    maxUnlockedMazeStage: 1, // 미로 모드 최대 해금 스테이지 (초기값 1)
    isMazeCleared: false,    // 미로 모드 올클리어 여부
    isBulletCleared: false,  // 탄막 모드 올클리어 여부 (추후 구현용)
    selectedSkin: 0          // 0: 기본, 1: 파티클, 2: 왕관
  });
  
  me = partyLoadMyShared({ role: -1 });
  participants = partyLoadParticipantShareds();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  MOVE_SPEED_X = 0.003;
  MOVE_SPEED_Y = 0.003;

  // 전체 사운드 볼륨 동일하게 맞추기 (0.3 ~ 0.5 정도의 일정한 값)
  let baseVolume = 0.4;
  let allSounds = [
    bgmMenu, bgmMaze, bgmBullet, grassSound, forestSound, pondSound, 
    canyonSound, desertSound, hiddenDesertSound, sharkSound, 
    deathSound, successSound, itemSound
  ];
  for (let s of allSounds) {
    if (s) s.setVolume(baseVolume);
  }

  for(let i = 0; i < ROWS * COLS; i++) {
    wallPatterns.push(Math.floor(Math.random() * 2));
  }

  if (typeof imgBalrog !== 'undefined' && imgBalrog) {
    imgBalrog.loadPixels();
    let w = imgBalrog.width;
    let h = imgBalrog.height;
    
    let visited = new Uint8Array(w * h);
    let queue = [];
    
    let startPoints = [0, w - 1, (h - 1) * w, h * w - 1];
    for (let sp of startPoints) {
      if (!visited[sp]) {
        visited[sp] = 1;
        queue.push(sp);
      }
    }
    
    let head = 0;
    while(head < queue.length) {
      let idx = queue[head++];
      let x = idx % w;
      let y = Math.floor(idx / w);
      
      let pIdx = idx * 4;
      let r = imgBalrog.pixels[pIdx];
      let g = imgBalrog.pixels[pIdx+1];
      let b = imgBalrog.pixels[pIdx+2];
      
      if (r > 200 && g > 200 && b > 200) {
        imgBalrog.pixels[pIdx+3] = 0; 
        if (x > 0 && !visited[idx - 1]) { visited[idx - 1] = 1; queue.push(idx - 1); }
        if (x < w - 1 && !visited[idx + 1]) { visited[idx + 1] = 1; queue.push(idx + 1); }
        if (y > 0 && !visited[idx - w]) { visited[idx - w] = 1; queue.push(idx - w); }
        if (y < h - 1 && !visited[idx + w]) { visited[idx + w] = 1; queue.push(idx + w); }
      }
    }
    imgBalrog.updatePixels();
  }

  if (partyIsHost()) {
    if (sharedPos.px === undefined) {
      sharedPos.px = 0.125;
      sharedPos.py = 0.15625;
    }
    
    if (sharedSignal.currentGameState === undefined) {
      sharedSignal.currentDir = "NONE";
      sharedSignal.currentGameState = 1;
      sharedSignal.selectedMode = "MAZE";
      sharedSignal.selectedStage = 0;
      sharedSignal.isDead = false;
      sharedSignal.isSuccess = false;
      sharedSignal.speedMode = "NORMAL";
      sharedSignal.isPaused = false;
      sharedSignal.breath = 100;
      sharedSignal.isReversed = false;
      sharedSignal.stunTimer = 0;
      sharedSignal.monsters = [];
      sharedSignal.maxUnlockedMazeStage = 1; 
      sharedSignal.isMazeCleared = false;    
      sharedSignal.isBulletCleared = false;  
      sharedSignal.selectedSkin = 0;         
    } else {
        // 호스트가 늦게 들어오더라도 타이틀로 강제 초기화
        sharedSignal.currentGameState = 1;
        sharedSignal.isPaused = false;
    }
  }

  // --- 멀티플레이 동기화: 이벤트 수신 ---
  // 일반 플레이어가 키보드나 버튼을 누르면 이벤트를 발생시키고, 방장(Host)만 이를 처리하여 상태를 바꿈
  partySubscribe("playerInput", (dir) => {
    if (partyIsHost()) {
      if (dir === "FIRE_UP") sharedSignal.map6HiddenFireDir = "UP";
      else if (dir === "FIRE_LEFT") sharedSignal.map6HiddenFireDir = "LEFT";
      else if (dir === "FIRE_DOWN") sharedSignal.map6HiddenFireDir = "DOWN";
      else if (dir === "FIRE_RIGHT") sharedSignal.map6HiddenFireDir = "RIGHT";
      else sharedSignal.currentDir = dir;
    }
  });

  partySubscribe("togglePause", () => {
    if (partyIsHost()) {
      sharedSignal.isPaused = !sharedSignal.isPaused;
    }
  });

  partySubscribe("requestRetry", () => {
    if (partyIsHost()) {
      sharedPos.px = 0.125;
      sharedPos.py = 0.15625;
      sharedSignal.isDead = false;
      sharedSignal.currentDir = "NONE";
      if (typeof initMonsters === "function") {
        initMonsters(sharedSignal.selectedStage);
      }
    }
  });

  partySubscribe("requestNextStage", () => {
    if (partyIsHost()) {
      sharedSignal.selectedStage++;
      sharedPos.px = 0.125;
      sharedPos.py = 0.15625;
      sharedSignal.isSuccess = false;
      sharedSignal.currentDir = "NONE";
      if (typeof initMonsters === "function") {
        initMonsters(sharedSignal.selectedStage);
      }
    }
  });

  partySubscribe("requestLobby", () => {
    if (partyIsHost()) {
      sharedSignal.currentGameState = 2;
      sharedSignal.isDead = false;
      sharedSignal.isSuccess = false;
      sharedSignal.currentDir = "NONE";
      if (bgmMaze && bgmMaze.isPlaying()) bgmMaze.stop();
    }
  });

  partySubscribe("enterStage", (stage) => {
    if (partyIsHost()) {
      if (typeof enterStage === "function") {
        enterStage(stage);
      }
    }
  });

  partySubscribe("changeGameState", (state) => {
    if (partyIsHost()) {
      sharedSignal.currentGameState = state;
    }
  });

  partySubscribe("changeMode", (mode) => {
    if (partyIsHost()) {
      sharedSignal.selectedMode = mode;
    }
  });

  partySubscribe("skipStage", () => {
    if (partyIsHost()) {
      sharedSignal.isPaused = false;
      sharedSignal.isSuccess = true;
      sharedSignal.currentDir = "NONE";
      let maxStage = sharedSignal.maxUnlockedMazeStage || 1;
      if (sharedSignal.selectedMode === "MAZE" && maxStage <= sharedSignal.selectedStage) {
        sharedSignal.maxUnlockedMazeStage = sharedSignal.selectedStage + 1;
      }
    }
  });

  partySubscribe("requestModeSelect", () => {
    if (partyIsHost()) {
      if (sharedSignal.selectedMode === "MAZE") {
        sharedSignal.isMazeCleared = true; 
      } else if (sharedSignal.selectedMode === "BULLET") {
        sharedSignal.isBulletCleared = true;
      }
      sharedSignal.currentGameState = 3;
    }
  });

  partySubscribe("changeSkin", (skinId) => {
    if (partyIsHost()) {
      sharedSignal.selectedSkin = skinId;
    }
  });

  partySubscribe("bullet4Retry", () => {
    if (partyIsHost()) {
      sharedSignal.isDead = false;
      sharedSignal.isSuccess = false;
      sharedSignal.isPaused = false;
    }
    if (typeof b4Initialized !== "undefined") {
      b4Initialized = false;
    }
    if (typeof initBullet4Mode === "function") {
      initBullet4Mode();
    }
  });

  partySubscribe("bullet4SkipStage", () => {
    if (partyIsHost()) {
      sharedSignal.isPaused = false;
      sharedSignal.isSuccess = true;
      sharedSignal.currentDir = "NONE";
      sharedSignal.isBulletCleared = true;
      sharedSignal.bossHp = 0;
    }
  });

  partySubscribe("bullet4BossInput", (arrowDir) => {
    if (partyIsHost()) {
      if (!sharedSignal.bossPattern || sharedSignal.bossPattern.length === 0) return;
      let step = sharedSignal.bossInputStep || 0;
      if (step >= sharedSignal.bossPattern.length) return;

      if (arrowDir === sharedSignal.bossPattern[step]) {
        sharedSignal.bossInputStep = step + 1;
        if (sharedSignal.bossInputStep >= sharedSignal.bossPattern.length) {
          sharedSignal.bossHp = Math.max(0, (sharedSignal.bossHp || 0) - 1);
          sharedSignal.bossPattern = []; 
          sharedSignal.bossPatternCooldown = 60;
        }
      }
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  if (myGameState !== sharedSignal.currentGameState) {
    let prevGameState = myGameState;
    myGameState = sharedSignal.currentGameState;
    manageBGM(prevGameState, myGameState);
  }

  // 동적 BGM 및 상태 효과음 처리
  if (myGameState === 5) {
    // 1. 사망/클리어 효과음
    if (sharedSignal.isDead && !localIsDead) {
       localIsDead = true;
       if (currentBGM) {
         currentBGM.stop();
         currentBGM = null;
       }
       if (deathSound && deathSound.isLoaded()) deathSound.play();
    } else if (!sharedSignal.isDead && localIsDead) {
       localIsDead = false;
    }
    
    if (sharedSignal.isSuccess && !localIsSuccess) {
       localIsSuccess = true;
       if (currentBGM) {
         currentBGM.stop();
         currentBGM = null;
       }
       if (successSound && successSound.isLoaded()) successSound.play();
    } else if (!sharedSignal.isSuccess && localIsSuccess) {
       localIsSuccess = false;
    }

    // 2. 스테이지별 BGM 동적 전환 (죽거나 클리어하지 않았을 때만)
    if (!sharedSignal.isDead && !sharedSignal.isSuccess) {
      let targetBGM = bgmBullet; // 기본은 탄막 모드
      if (sharedSignal.selectedMode === "MAZE") {
        let st = sharedSignal.selectedStage;
        if (st === 1) targetBGM = grassSound;
        else if (st === 2) targetBGM = forestSound;
        else if (st === 3) targetBGM = pondSound;
        else if (st === 4) {
          targetBGM = bgmMaze;
          // 상어 공격 상태 확인 (shark_sound)
          if (sharedSignal.monsters) {
            for (let m of sharedSignal.monsters) {
              if (m.type === "SHARK" && m.state === "ATTACK") {
                targetBGM = sharkSound;
                break;
              }
            }
          }
        }
        else if (st === 5) targetBGM = canyonSound;
        else if (st === 6) {
          // 숨겨진 맵 여부 확인
          if (typeof isMap6HiddenActive === "function" && isMap6HiddenActive()) {
            targetBGM = hiddenDesertSound;
          } else {
            targetBGM = desertSound;
          }
        }
      }
      
      // BGM이 로드되었고 현재 BGM과 다르다면 변경
      if (targetBGM && targetBGM.isLoaded() && currentBGM !== targetBGM) {
        if (currentBGM) currentBGM.stop();
        currentBGM = targetBGM;
        currentBGM.loop();
      }
    }
  } else {
    // 게임 상태가 아닐 때 초기화
    localIsDead = false;
    localIsSuccess = false;
  }

  if (myGameState === 1) drawTitleScreen();
  else if (myGameState === 2) drawLobbyScreen();
  else if (myGameState === 3) drawModeSelectScreen(); 
  else if (myGameState === 4) drawStageSelectScreen();
  else if (myGameState === 5) {
    if (sharedSignal.selectedMode === "BULLET") {
      drawBullet4ModeScreen();
    } else {
      drawGameScreen();
    }
  }
  else if (myGameState === 6) drawEndingScreen();
}

function mousePressed() {
  if (myGameState === 1) {
    if (!bgmMenu.isPlaying()) {
      currentBGM = bgmMenu;
      currentBGM.loop();
    }
    mousePressedTitle(mouseX, mouseY);
  }
  else if (myGameState === 1) mousePressedTitle(mouseX, mouseY);
  else if (myGameState === 2) mousePressedLobby(mouseX, mouseY);
  else if (myGameState === 3) mousePressedMode(mouseX, mouseY); 
  else if (myGameState === 4) mousePressedStage(mouseX, mouseY);
  else if (myGameState === 5) {
    if (sharedSignal.selectedMode === "BULLET") {
      mousePressedBullet4Mode(mouseX, mouseY);
    } else {
      mousePressedGame(mouseX, mouseY);
    }
  }
  else if (myGameState === 6) mousePressedEnding(mouseX, mouseY);
}

function keyPressed() {
  if (myGameState === 5) {
    if (sharedSignal.selectedMode === "BULLET") {
      return keyPressedBullet4Mode();
    }
    keyPressedGame();
  }
}

function manageBGM(oldState, newState) {
  // Title(1), Lobby(2), Mode(3), Stage(4), Ending(6) 화면일 경우
  if ((newState >= 1 && newState <= 4) || newState === 6) {
    if (currentBGM !== bgmMenu) {
      if (currentBGM) currentBGM.stop();
      currentBGM = bgmMenu;
      if (newState !== 1) currentBGM.loop(); // 타이틀 화면에서는 브라우저 정책상 클릭 후 재생되도록 유도
    }
  } 
  // Game(5) 화면 진입 시 BGM은 draw() 루프에서 동적으로 처리합니다.
}