/* =====================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 1
===================================================== */


/* =====================================================
   SCREEN SYSTEM
===================================================== */

const cinematic = document.getElementById("cinematic");
const creator = document.getElementById("creator");
const gameScreen = document.getElementById("game");
const gameOver = document.getElementById("gameOver");

function showScreen(screen) {

  document
    .querySelectorAll(".screen")
    .forEach(s => s.classList.remove("active"));

  screen.classList.add("active");
}


/* =====================================================
   CINEMATIC
===================================================== */

const cinematicText =
  document.getElementById("cinematicText");

const skipCinematic =
  document.getElementById("skipCinematic");

const scenes = [

  "23:41 PM.",

  "Hujan turun sejak sore.",

  "Setelah bertahun-tahun...",
  
  "kamu akhirnya kembali ke rumah itu.",

  "Rumah yang seharusnya sudah kosong.",

  "Tapi malam ini...",
  
  "lampunya menyala.",

  "Dan ada sesuatu di lantai atas.",

  "...yang masih mengingatmu.",

  "THE LAST ROOM"
];

let sceneIndex = 0;
let cinematicTimer;

function playScene() {

  if (sceneIndex >= scenes.length) {

    showScreen(creator);

    return;
  }

  cinematicText.style.opacity = 0;

  setTimeout(() => {

    cinematicText.textContent =
      scenes[sceneIndex];

    cinematicText.style.opacity = 1;

    sceneIndex++;

    cinematicTimer =
      setTimeout(playScene, 2200);

  }, 300);

}

playScene();


skipCinematic.onclick = () => {

  clearTimeout(cinematicTimer);

  showScreen(creator);

};


/* =====================================================
   CHARACTER CREATOR
===================================================== */

const playerName =
  document.getElementById("playerName");

const skin =
  document.getElementById("skin");

const hair =
  document.getElementById("hair");

const outfit =
  document.getElementById("outfit");

const character =
  document.getElementById("character");

const head =
  character.querySelector(".head");

const hairPart =
  character.querySelector(".hair");

const body =
  character.querySelector(".body");


function updateCharacter() {

  const skinColors = {

    light: "#e0ad8b",

    tan: "#c58e6c",

    brown: "#875a43"

  };

  const hairColors = {

    dark: "#171717",

    brown: "#3a2419",

    black: "#050505"

  };

  const outfitColors = {

    hoodie: "#151515",

    shirt: "#d5d5d5",

    jacket: "#202020"

  };

  head.style.background =
    skinColors[skin.value];

  hairPart.style.background =
    hairColors[hair.value];

  body.style.background =
    outfitColors[outfit.value];

}

skin.onchange = updateCharacter;
hair.onchange = updateCharacter;
outfit.onchange = updateCharacter;

updateCharacter();


/* =====================================================
   START GAME
===================================================== */

document
  .getElementById("startGame")
  .onclick = () => {

    const name =
      playerName.value.trim() || "PLAYER";

    document
      .getElementById("displayName")
      .textContent =
      name.toUpperCase();

    startAudio();

    showScreen(gameScreen);

    initGame();

  };


/* =====================================================
   AUDIO ENGINE
===================================================== */

let audioContext;
let masterGain;

function startAudio() {

  if (audioContext) return;

  audioContext =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

  masterGain =
    audioContext.createGain();

  masterGain.gain.value = 0.12;

  masterGain.connect(
    audioContext.destination
  );

  startAmbient();
}


/* Ambient low-frequency horror */

function startAmbient() {

  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();

  oscillator.type = "sine";

  oscillator.frequency.value = 38;

  gain.gain.value = 0.06;

  oscillator.connect(gain);

  gain.connect(masterGain);

  oscillator.start();

}


/* Footstep */

function footstep() {

  if (!audioContext) return;

  const osc =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();

  osc.type = "triangle";

  osc.frequency.value =
    65 + Math.random() * 25;

  gain.gain.setValueAtTime(
    0.001,
    audioContext.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.08,
    audioContext.currentTime + 0.02
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.12
  );

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start();
  osc.stop(
    audioContext.currentTime + 0.15
  );

}


/* Horror sting */

function horrorSting() {

  if (!audioContext) return;

  const osc =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();

  osc.type = "sawtooth";

  osc.frequency.setValueAtTime(
    120,
    audioContext.currentTime
  );

  osc.frequency.exponentialRampToValueAtTime(
    35,
    audioContext.currentTime + 1.2
  );

  gain.gain.setValueAtTime(
    0.001,
    audioContext.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.3,
    audioContext.currentTime + 0.05
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 1.2
  );

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start();

  osc.stop(
    audioContext.currentTime + 1.3
  );

}


/* =====================================================
   GAME VARIABLES
===================================================== */

const canvas =
  document.getElementById("gameCanvas");

const ctx =
  canvas.getContext("2d");

let width;
let height;

const player = {

  x: 300,

  y: 300,

  speed: 3,

  radius: 12

};

const keys = {};

let battery = 100;

let flashlight = true;

let footstepsTimer = 0;


/* =====================================================
   RESIZE
===================================================== */

function resizeCanvas() {

  width =
    canvas.width =
      window.innerWidth;

  height =
    canvas.height =
      window.innerHeight;

}

window.addEventListener(
  "resize",
  resizeCanvas
);


/* =====================================================
   INPUT
===================================================== */

window.addEventListener(
  "keydown",
  e => {

    keys[e.key] = true;

    if (
      e.key === "f" ||
      e.key === "F"
    ) {

      toggleFlashlight();

    }

  }
);

window.addEventListener(
  "keyup",
  e => {

    keys[e.key] = false;

  }
);


/* MOBILE BUTTONS */

document
  .querySelectorAll("#mobileControls button")
  .forEach(button => {

    const key =
      button.dataset.key;

    button.addEventListener(
      "touchstart",
      e => {

        e.preventDefault();

        keys[key] = true;

      }
    );

    button.addEventListener(
      "touchend",
      e => {

        e.preventDefault();

        keys[key] = false;

      }
    );

  });


document
  .getElementById("flashlightButton")
  .onclick =
    toggleFlashlight;


/* =====================================================
   FLASHLIGHT
===================================================== */

function toggleFlashlight() {

  if (battery <= 0) {

    flashlight = false;

    return;

  }

  flashlight =
    !flashlight;

}


/* =====================================================
   PLAYER MOVEMENT
===================================================== */

function updatePlayer() {

  let moving = false;

  if (
    keys["ArrowUp"] ||
    keys["w"] ||
    keys["W"]
  ) {

    player.y -= player.speed;

    moving = true;

  }

  if (
    keys["ArrowDown"] ||
    keys["s"] ||
    keys["S"]
  ) {

    player.y += player.speed;

    moving = true;

  }

  if (
    keys["ArrowLeft"] ||
    keys["a"] ||
    keys["A"]
  ) {

    player.x -= player.speed;

    moving = true;

  }

  if (
    keys["ArrowRight"] ||
    keys["d"] ||
    keys["D"]
  ) {

    player.x += player.speed;

    moving = true;

  }

  /* boundaries */

  player.x =
    Math.max(
      40,
      Math.min(
        width - 40,
        player.x
      )
    );

  player.y =
    Math.max(
      40,
      Math.min(
        height - 40,
        player.y
      )
    );


  /* footsteps */

  if (moving) {

    footstepsTimer++;

    if (footstepsTimer > 18) {

      footstep();

      footstepsTimer = 0;

    }

  } else {

    footstepsTimer = 18;

  }

}


/* =====================================================
   BATTERY
===================================================== */

function updateBattery() {

  if (!flashlight) return;

  battery -= 0.015;

  battery =
    Math.max(
      0,
      battery
    );

  document
    .getElementById("batteryValue")
    .textContent =
    Math.floor(battery);

  if (battery <= 0) {

    flashlight = false;

  }

}


/* =====================================================
   WORLD
===================================================== */

function drawWorld() {

  /* floor */

  ctx.fillStyle =
    "#181818";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* floor lines */

  ctx.strokeStyle =
    "rgba(255,255,255,.025)";

  ctx.lineWidth = 1;

  const grid = 60;

  for (
    let x = 0;
    x < width;
    x += grid
  ) {

    ctx.beginPath();

    ctx.moveTo(x, 0);

    ctx.lineTo(x, height);

    ctx.stroke();

  }

  for (
    let y = 0;
    y < height;
    y += grid
  ) {

    ctx.beginPath();

    ctx.moveTo(0, y);

    ctx.lineTo(width, y);

    ctx.stroke();

  }


  /* house walls */

  ctx.fillStyle =
    "#090909";

  ctx.fillRect(
    30,
    30,
    width - 60,
    20
  );

  ctx.fillRect(
    30,
    height - 50,
    width - 60,
    20
  );

  ctx.fillRect(
    30,
    30,
    20,
    height - 60
  );

  ctx.fillRect(
    width - 50,
    30,
    20,
    height - 60
  );


  /* central hallway */

  ctx.fillStyle =
    "#101010";

  ctx.fillRect(
    width * .42,
    50,
    width * .16,
    height - 100
  );


  /* rooms */

  ctx.strokeStyle =
    "#292929";

  ctx.lineWidth = 5;

  ctx.strokeRect(
    70,
    80,
    width * .28,
    height * .3
  );

  ctx.strokeRect(
    70,
    height * .55,
    width * .28,
    height * .3
  );

  ctx.strokeRect(
    width * .62,
    80,
    width * .28,
    height * .3
  );

  ctx.strokeRect(
    width * .62,
    height * .55,
    width * .28,
    height * .3
  );


  /* mysterious red mark */

  ctx.fillStyle =
    "rgba(100,0,0,.18)";

  ctx.beginPath();

  ctx.arc(
    width * .76,
    height * .23,
    45,
    0,
    Math.PI * 2
  );

  ctx.fill();

}


/* =====================================================
   PLAYER
===================================================== */

function drawPlayer() {

  ctx.beginPath();

  ctx.arc(
    player.x,
    player.y,
    player.radius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#d0d0d0";

  ctx.fill();

}


/* =====================================================
   FLASHLIGHT EFFECT
===================================================== */

function drawDarkness() {

  if (!flashlight) {

    ctx.fillStyle =
      "rgba(0,0,0,.88)";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    return;

  }


  const darkness =
    ctx.createRadialGradient(
      player.x,
      player.y,
      40,
      player.x,
      player.y,
      Math.min(
        width,
        height
      ) * .55
    );

  darkness.addColorStop(
    0,
    "rgba(0,0,0,0)"
  );

  darkness.addColorStop(
    .45,
    "rgba(0,0,0,.15)"
  );

  darkness.addColorStop(
    1,
    "rgba(0,0,0,.92)"
  );

  ctx.fillStyle =
    darkness;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

}


/* =====================================================
   ENTITY TEASER
===================================================== */

let entityTimer = 0;

function drawEntityTeaser() {

  entityTimer++;

  if (
    entityTimer > 600 &&
    entityTimer < 660
  ) {

    const ex =
      width * .5;

    const ey =
      height * .18;

    ctx.save();

    ctx.globalAlpha =
      Math.sin(
        entityTimer * .2
      ) * .3 + .3;

    ctx.fillStyle =
      "#050505";

    ctx.beginPath();

    ctx.ellipse(
      ex,
      ey,
      18,
      55,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

  }

}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

  if (
    !gameScreen.classList.contains(
      "active"
    )
  ) {

    requestAnimationFrame(
      gameLoop
    );

    return;

  }


  updatePlayer();

  updateBattery();

  drawWorld();

  drawEntityTeaser();

  drawPlayer();

  drawDarkness();

  requestAnimationFrame(
    gameLoop
  );

}


/* =====================================================
   INIT
===================================================== */

function initGame() {

  resizeCanvas();

  player.x =
    width / 2;

  player.y =
    height / 2;

  battery = 100;

  flashlight = true;

  entityTimer = 0;

  document
    .getElementById("objectiveText")
    .textContent =
      "Explore the house. Find a way inside.";

  horrorSting();

}

gameLoop();
