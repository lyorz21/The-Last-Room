/* =====================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 2
===================================================== */


/* =====================================================
   SCREEN SYSTEM
===================================================== */

const screens = {

  cinematic:
    document.getElementById("cinematic"),

  creator:
    document.getElementById("creator"),

  game:
    document.getElementById("game"),

  gameOver:
    document.getElementById("gameOver")

};


function showScreen(screen) {

  document
    .querySelectorAll(".screen")
    .forEach(element => {

      element.classList.remove("active");

    });

  screen.classList.add("active");

}


/* =====================================================
   CINEMATIC
===================================================== */

const cinematicText =
  document.getElementById("cinematicText");

const skipCinematic =
  document.getElementById("skipCinematic");


const cinematicScenes = [

  "23:41 PM.",

  "Hujan turun sejak sore.",

  "Setelah bertahun-tahun...",

  "kamu akhirnya kembali ke rumah itu.",

  "Rumah yang seharusnya sudah kosong.",

  "Namun malam ini...",
  
  "lampunya masih menyala.",

  "Dan dari lantai atas...",
  
  "terdengar suara langkah kaki.",

  "Seolah seseorang sedang menunggumu.",

  "THE HOUSE REMEMBERS."

];


let cinematicIndex = 0;
let cinematicTimer;


function playCinematic() {

  if (
    cinematicIndex >=
    cinematicScenes.length
  ) {

    showScreen(
      screens.creator
    );

    return;

  }


  cinematicText.style.opacity = 0;


  setTimeout(() => {

    cinematicText.textContent =
      cinematicScenes[
        cinematicIndex
      ];

    cinematicText.style.opacity = 1;

    cinematicIndex++;

    cinematicTimer =
      setTimeout(
        playCinematic,
        2300
      );

  }, 350);

}


playCinematic();


skipCinematic.onclick = () => {

  clearTimeout(cinematicTimer);

  showScreen(
    screens.creator
  );

};


/* =====================================================
   CHARACTER
===================================================== */

const playerNameInput =
  document.getElementById(
    "playerName"
  );

const skinInput =
  document.getElementById(
    "skin"
  );

const hairInput =
  document.getElementById(
    "hair"
  );

const outfitInput =
  document.getElementById(
    "outfit"
  );

const character =
  document.getElementById(
    "character"
  );

const characterHead =
  character.querySelector(
    ".head"
  );

const characterHair =
  character.querySelector(
    ".hair"
  );

const characterBody =
  character.querySelector(
    ".body"
  );


function updateCharacter() {

  const skins = {

    light: "#e0ad8b",

    tan: "#c58e6c",

    brown: "#875a43"

  };


  const hairs = {

    dark: "#211914",

    brown: "#4a291b",

    black: "#050505"

  };


  const outfits = {

    hoodie: "#171717",

    shirt: "#d2d2d2",

    jacket: "#111"

  };


  characterHead.style.background =
    skins[
      skinInput.value
    ];

  characterHair.style.background =
    hairs[
      hairInput.value
    ];

  characterBody.style.background =
    outfits[
      outfitInput.value
    ];

}


skinInput.onchange =
  updateCharacter;

hairInput.onchange =
  updateCharacter;

outfitInput.onchange =
  updateCharacter;

updateCharacter();


/* =====================================================
   GAME STATE
===================================================== */

const state = {

  playerName: "PLAYER",

  room: "hallway",

  battery: 100,

  flashlight: true,

  inventory: [],

  diary: [],

  cluesFound: 0,

  storyStage: 0,

  photoTaken: false,

  bedroomUnlocked: false,

  basementUnlocked: false

};


/* =====================================================
   WORLD
===================================================== */

const rooms = {

  hallway: {

    name: "HALLWAY",

    description:
      "Lorong panjang yang terasa jauh lebih dingin daripada bagian rumah lainnya."

  },

  living: {

    name: "LIVING ROOM",

    description:
      "Ruang tamu lama. Debu menutupi sebagian besar perabotannya."

  },

  bedroom: {

    name: "BEDROOM",

    description:
      "Kamar lama yang seharusnya sudah tidak pernah digunakan."

  },

  basement: {

    name: "BASEMENT",

    description:
      "Udara di sini jauh lebih dingin. Bau tanah lembap memenuhi ruangan."

  }

};


/* =====================================================
   CANVAS
===================================================== */

const canvas =
  document.getElementById(
    "gameCanvas"
  );

const ctx =
  canvas.getContext("2d");


let width = 0;
let height = 0;


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
   PLAYER
===================================================== */

const player = {

  x: 0,

  y: 0,

  speed: 3,

  radius: 10

};


const keys = {};


/* =====================================================
   INPUT
===================================================== */

window.addEventListener(
  "keydown",
  event => {

    keys[event.key] = true;


    if (
      event.key === "f" ||
      event.key === "F"
    ) {

      toggleFlashlight();

    }


    if (
      event.key === "e" ||
      event.key === "E"
    ) {

      interact();

    }


    if (
      event.key === "i" ||
      event.key === "I"
    ) {

      togglePanel(
        "inventoryPanel"
      );

    }


    if (
      event.key === "j" ||
      event.key === "J"
    ) {

      togglePanel(
        "diaryPanel"
      );

    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    keys[event.key] = false;

  }
);


/* =====================================================
   MOBILE MOVEMENT
===================================================== */

document
  .querySelectorAll(
    "#mobileControls button"
  )
  .forEach(button => {

    const key =
      button.dataset.key;


    button.addEventListener(
      "touchstart",
      event => {

        event.preventDefault();

        keys[key] = true;

      },
      { passive: false }
    );


    button.addEventListener(
      "touchend",
      event => {

        event.preventDefault();

        keys[key] = false;

      },
      { passive: false }
    );

  });


document
  .getElementById(
    "flashlightButton"
  )
  .onclick =
  toggleFlashlight;


document
  .getElementById(
    "interactButton"
  )
  .onclick =
  interact;


/* =====================================================
   AUDIO
===================================================== */

let audioContext = null;

let masterGain = null;


function startAudio() {

  if (audioContext) return;


  audioContext =
    new (
      window.AudioContext ||
      window.webkitAudioContext
    )();


  masterGain =
    audioContext.createGain();


  masterGain.gain.value =
    0.13;


  masterGain.connect(
    audioContext.destination
  );


  ambientSound();

}


function createTone(
  frequency,
  duration,
  volume,
  type = "sine"
) {

  if (!audioContext) return;


  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();


  oscillator.type =
    type;

  oscillator.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    0.001,
    audioContext.currentTime
  );


  gain.gain.exponentialRampToValueAtTime(
    volume,
    audioContext.currentTime + .03
  );


  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );


  oscillator.connect(gain);

  gain.connect(masterGain);


  oscillator.start();

  oscillator.stop(
    audioContext.currentTime +
    duration +
    .05
  );

}


/* LOW HORROR DRONE */

function ambientSound() {

  if (!audioContext) return;


  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();


  oscillator.type =
    "sine";

  oscillator.frequency.value =
    38;

  gain.gain.value =
    .045;


  oscillator.connect(gain);

  gain.connect(masterGain);

  oscillator.start();

}


/* FOOTSTEP */

function footstep() {

  createTone(
    55 + Math.random() * 25,
    .11,
    .055,
    "triangle"
  );

}


/* DOOR */

function doorSound() {

  createTone(
    110,
    .35,
    .08,
    "sawtooth"
  );

}


/* ITEM */

function itemSound() {

  createTone(
    440,
    .18,
    .055,
    "sine"
  );

  setTimeout(
    () =>
      createTone(
        660,
        .15,
        .04,
        "sine"
      ),
    80
  );

}


/* =====================================================
   FLASHLIGHT
===================================================== */

function toggleFlashlight() {

  if (
    state.battery <= 0
  ) {

    state.flashlight =
      false;

    return;

  }


  state.flashlight =
    !state.flashlight;

}


/* =====================================================
   BATTERY
===================================================== */

function updateBattery() {

  if (
    !state.flashlight
  ) return;


  state.battery -=
    .012;


  state.battery =
    Math.max(
      0,
      state.battery
    );


  document
    .getElementById(
      "batteryValue"
    )
    .textContent =
    Math.floor(
      state.battery
    );


  if (
    state.battery <= 0
  ) {

    state.flashlight =
      false;

  }

}


/* =====================================================
   PLAYER MOVEMENT
===================================================== */

let footstepTimer = 0;


function updatePlayer() {

  let moving = false;


  if (
    keys["ArrowUp"] ||
    keys["w"] ||
    keys["W"]
  ) {

    player.y -=
      player.speed;

    moving = true;

  }


  if (
    keys["ArrowDown"] ||
    keys["s"] ||
    keys["S"]
  ) {

    player.y +=
      player.speed;

    moving = true;

  }


  if (
    keys["ArrowLeft"] ||
    keys["a"] ||
    keys["A"]
  ) {

    player.x -=
      player.speed;

    moving = true;

  }


  if (
    keys["ArrowRight"] ||
    keys["d"] ||
    keys["D"]
  ) {

    player.x +=
      player.speed;

    moving = true;

  }


  /* WORLD BOUNDS */

  player.x =
    Math.max(
      55,
      Math.min(
        width - 55,
        player.x
      )
    );


  player.y =
    Math.max(
      55,
      Math.min(
        height - 55,
        player.y
      )
    );


  /* FOOTSTEPS */

  if (moving) {

    footstepTimer++;


    if (
      footstepTimer > 20
    ) {

      footstep();

      footstepTimer = 0;

    }

  }

}


/* =====================================================
   WORLD DRAWING
===================================================== */

function drawWorld() {

  /* FLOOR */

  ctx.fillStyle =
    "#171717";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* FLOOR BOARDS */

  ctx.strokeStyle =
    "rgba(255,255,255,.025)";

  ctx.lineWidth = 1;


  for (
    let x = 0;
    x < width;
    x += 55
  ) {

    ctx.beginPath();

    ctx.moveTo(x, 0);

    ctx.lineTo(x, height);

    ctx.stroke();

  }


  for (
    let y = 0;
    y < height;
    y += 55
  ) {

    ctx.beginPath();

    ctx.moveTo(0, y);

    ctx.lineTo(width, y);

    ctx.stroke();

  }


  /* OUTER WALLS */

  ctx.fillStyle =
    "#080808";


  ctx.fillRect(
    25,
    25,
    width - 50,
    20
  );


  ctx.fillRect(
    25,
    height - 45,
    width - 50,
    20
  );


  ctx.fillRect(
    25,
    25,
    20,
    height - 50
  );


  ctx.fillRect(
    width - 45,
    25,
    20,
    height - 50
  );


  /* CENTRAL HALL */

  ctx.fillStyle =
    "#101010";


  ctx.fillRect(
    width * .42,
    45,
    width * .16,
    height - 90
  );


  /* ROOMS */

  drawRoom(
    65,
    70,
    width * .30,
    height * .30,
    "LIVING ROOM"
  );


  drawRoom(
    65,
    height * .57,
    width * .30,
    height * .28,
    "BEDROOM"
  );


  drawRoom(
    width * .62,
    70,
    width * .30,
    height * .30,
    "BASEMENT"
  );


  drawRoom(
    width * .62,
    height * .57,
    width * .30,
    height * .28,
    "DINING ROOM"
  );


  /* DOORS */

  drawDoor(
    width * .42,
    height * .22,
    "LIVING"
  );


  drawDoor(
    width * .42,
    height * .68,
    "BEDROOM"
  );


  drawDoor(
    width * .58,
    height * .22,
    "BASEMENT"
  );


  /* TABLE */

  ctx.fillStyle =
    "#282828";

  ctx.fillRect(
    width * .70,
    height * .68,
    100,
    55
  );


  /* PHOTO */

  if (
    !state.photoTaken
  ) {

    ctx.fillStyle =
      "#555";

    ctx.fillRect(
      width * .78,
      height * .71,
      30,
      38
    );

  }


  /* OLD CLOCK */

  ctx.beginPath();

  ctx.arc(
    width * .50,
    height * .18,
    28,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#222";

  ctx.fill();

  ctx.strokeStyle =
    "#555";

  ctx.stroke();


  /* 03:17 */

  ctx.fillStyle =
    "#aaa";

  ctx.font =
    "11px Cinzel";

  ctx.textAlign =
    "center";

  ctx.fillText(
    "03:17",
    width * .50,
    height * .185
  );

}


function drawRoom(
  x,
  y,
  w,
  h,
  name
) {

  ctx.strokeStyle =
    "#292929";

  ctx.lineWidth = 5;

  ctx.strokeRect(
    x,
    y,
    w,
    h
  );


  ctx.fillStyle =
    "rgba(255,255,255,.04)";

  ctx.font =
    "10px Cinzel";

  ctx.textAlign =
    "center";

  ctx.fillText(
    name,
    x + w / 2,
    y + 25
  );

}


function drawDoor(
  x,
  y,
  name
) {

  ctx.fillStyle =
    "#3a302a";

  ctx.fillRect(
    x - 8,
    y - 35,
    16,
    70
  );

}


/* =====================================================
   PLAYER DRAWING
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
    "#ddd";

  ctx.fill();

}


/* =====================================================
   FLASHLIGHT / DARKNESS
===================================================== */

function drawDarkness() {

  if (
    !state.flashlight
  ) {

    ctx.fillStyle =
      "rgba(0,0,0,.92)";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    return;

  }


  const radius =
    Math.min(
      width,
      height
    ) * .52;


  const darkness =
    ctx.createRadialGradient(
      player.x,
      player.y,
      35,
      player.x,
      player.y,
      radius
    );


  darkness.addColorStop(
    0,
    "rgba(0,0,0,0)"
  );


  darkness.addColorStop(
    .45,
    "rgba(0,0,0,.10)"
  );


  darkness.addColorStop(
    .75,
    "rgba(0,0,0,.50)"
  );


  darkness.addColorStop(
    1,
    "rgba(0,0,0,.94)"
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
   INTERACTION OBJECTS
===================================================== */

const interactionObjects = [

  {

    id: "family-photo",

    x: .795,

    y: .73,

    radius: 55,

    title:
      "FAMILY PHOTOGRAPH",

    icon:
      "▣",

    description:
      "Sebuah foto keluarga lama. Ada empat orang di dalamnya. Namun seseorang berdiri terlalu jauh di belakang mereka. Wajahnya sengaja dicoret.",

    item:
      "Old Family Photograph"

  },

  {

    id: "clock",

    x: .50,

    y: .18,

    radius: 60,

    title:
      "THE CLOCK",

    icon:
      "◷",

    description:
      "Jarumnya berhenti tepat pada pukul 03:17. Saat kamu menyentuhnya, suara detik kecil terdengar dari dalam.",

    item:
      null

  },

  {

    id: "bedroom-door",

    x: .42,

    y: .68,

    radius: 65,

    title:
      "OLD BEDROOM",

    icon:
      "▯",

    description:
      "Pintunya terkunci. Dari balik pintu terdengar suara benda kecil jatuh... lalu sunyi.",

    item:
      null

  },

  {

    id: "basement-door",

    x: .58,

    y: .22,

    radius: 65,

    title:
      "BASEMENT",

    icon:
      "▯",

    description:
      "Pintunya terkunci. Bau tanah lembap keluar dari celah bawah pintu.",

    item:
      null

  }

];


let currentInteraction =
  null;


/* =====================================================
   FIND INTERACTION
===================================================== */

function findInteraction() {

  currentInteraction = null;


  for (
    const object
    of interactionObjects
  ) {

    const ox =
      width * object.x;

    const oy =
      height * object.y;


    const distance =
      Math.hypot(
        player.x - ox,
        player.y - oy
      );


    if (
      distance <
      object.radius
    ) {

      currentInteraction =
        object;

      break;

    }

  }


  updateInteractionUI();

}


/* =====================================================
   INTERACTION UI
===================================================== */

function updateInteractionUI() {

  const interaction =
    document.getElementById(
      "interaction"
    );

  const interactionText =
    document.getElementById(
      "interactionText"
    );

  const mobileButton =
    document.getElementById(
      "interactButton"
    );


  if (
    currentInteraction
  ) {

    interaction.classList.add(
      "show"
    );

    interactionText.textContent =
      `E / TAP — ${currentInteraction.title}`;

    mobileButton.classList.add(
      "show"
    );

  } else {

    interaction.classList.remove(
      "show"
    );

    mobileButton.classList.remove(
      "show"
    );

  }

}


/* =====================================================
   INTERACT
===================================================== */

function interact() {

  if (
    !currentInteraction
  ) return;


  const object =
    currentInteraction;


  /* PHOTO */

  if (
    object.id ===
    "family-photo"
  ) {

    openInspect(object);

    return;

  }


  /* CLOCK */

  if (
    object.id ===
    "clock"
  ) {

    openInspect(object);

    if (
      !state.diary.includes(
        "03:17"
      )
    ) {

      addDiary(
        "03:17",
        "Jam rumah ini berhenti tepat pukul 03:17. Aku tidak tahu kenapa, tapi rasanya waktu itu penting."
      );

      updateObjective(
        "Cari tahu apa yang terjadi pukul 03:17."
      );

    }

    return;

  }


  /* BEDROOM */

  if (
    object.id ===
    "bedroom-door"
  ) {

    if (
      !state.bedroomUnlocked
    ) {

      showStory(
        "PINTU TERKUNCI",
        "Ada sesuatu di balik pintu. Bukan suara manusia."
      );

      doorSound();

      return;

    }

  }


  /* BASEMENT */

  if (
    object.id ===
    "basement-door"
  ) {

    if (
      !state.basementUnlocked
    ) {

      showStory(
        "BASEMENT",
        "Kuncinya tidak ada di sini. Mungkin ada di ruangan lain."
      );

      return;

    }

  }

}


/* =====================================================
   INSPECT PANEL
===================================================== */

const inspectPanel =
  document.getElementById(
    "inspectPanel"
  );

const inspectTitle =
  document.getElementById(
    "inspectTitle"
  );

const inspectText =
  document.getElementById(
    "inspectText"
  );

const inspectIcon =
  document.getElementById(
    "inspectIcon"
  );

const collectButton =
  document.getElementById(
    "collectButton"
  );


function openInspect(object) {

  inspectTitle.textContent =
    object.title;

  inspectText.textContent =
    object.description;

  inspectIcon.textContent =
    object.icon;


  if (
    object.item &&
    !state.inventory.includes(
      object.item
    )
  ) {

    collectButton.style.display =
      "inline-block";

    collectButton.textContent =
      "TAKE";

    collectButton.onclick =
      () => {

        addInventory(
          object.item
        );

        closePanel(
          "inspectPanel"
        );

        if (
          object.id ===
          "family-photo"
        ) {

          state.photoTaken =
            true;

          state.cluesFound++;

          addDiary(
            "THE PHOTOGRAPH",
            "Ada seseorang di foto keluarga. Wajahnya dicoret, tetapi aku merasa pernah mengenalnya."
          );

          updateObjective(
            "Cari tahu siapa orang di dalam foto."
          );

          showStory(
            "SOMETHING IS WRONG",
            "Aku yakin foto ini berbeda dari yang seharusnya."
          );

        }

      };

  } else {

    collectButton.style.display =
      "none";

  }


  inspectPanel.classList.add(
    "active"
  );

}


/* =====================================================
   INVENTORY
===================================================== */

function addInventory(item) {

  if (
    state.inventory.includes(
      item
    )
  ) return;


  state.inventory.push(
    item
  );


  itemSound();

  renderInventory();

}


/* =====================================================
   INVENTORY RENDER
===================================================== */

function renderInventory() {

  const container =
    document.getElementById(
      "inventoryItems"
    );


  container.innerHTML = "";


  if (
    state.inventory.length === 0
  ) {

    container.innerHTML = `
      <div class="inventory-item">
        <div class="inventory-item-icon">—</div>
        <div class="inventory-item-name">
          EMPTY
        </div>
      </div>
    `;

    return;

  }


  state.inventory.forEach(
    item => {

      const element =
        document.createElement(
          "div"
        );

      element.className =
        "inventory-item";

      element.innerHTML = `
        <div class="inventory-item-icon">
          ◈
        </div>

        <div class="inventory-item-name">
          ${item}
        </div>
      `;

      container.appendChild(
        element
      );

    }
  );

}


/* =====================================================
   DIARY
===================================================== */

function addDiary(
  date,
  text
) {

  if (
    state.diary.some(
      entry =>
        entry.date === date
    )
  ) return;


  state.diary.push({

    date,
    text

  });


  renderDiary();

}


function renderDiary() {

  const container =
    document.getElementById(
      "diaryEntries"
    );


  container.innerHTML = "";


  if (
    state.diary.length === 0
  ) {

    container.innerHTML = `
      <div class="diary-entry">
        Belum ada catatan.
      </div>
    `;

    return;

  }


  state.diary.forEach(
    entry => {

      const element =
        document.createElement(
          "div"
        );

      element.className =
        "diary-entry";

      element.innerHTML = `
        <div class="diary-date">
          ${entry.date}
        </div>

        <div>
          ${entry.text}
        </div>
      `;

      container.appendChild(
        element
      );

    }
  );

}


/* =====================================================
   OBJECTIVE
===================================================== */

function updateObjective(
  text
) {

  document
    .getElementById(
      "objectiveText"
    )
    .textContent =
    text;

}


/* =====================================================
   STORY MESSAGE
===================================================== */

let storyTimer;


function showStory(
  title,
  text
) {

  const message =
    document.getElementById(
      "storyMessage"
    );

  const messageTitle =
    document.getElementById(
      "storyMessageTitle"
    );

  const messageText =
    document.getElementById(
      "storyMessageText"
    );


  messageTitle.textContent =
    title;

  messageText.textContent =
    text;


  message.classList.add(
    "show"
  );


  clearTimeout(
    storyTimer
  );


  storyTimer =
    setTimeout(
      () => {

        message.classList.remove(
          "show"
        );

      },
      4500
    );

}


/* =====================================================
   PANELS
===================================================== */

function togglePanel(
  id
) {

  const panel =
    document.getElementById(
      id
    );

  panel.classList.toggle(
    "active"
  );

}


function closePanel(
  id
) {

  document
    .getElementById(id)
    .classList.remove(
      "active"
    );

}


document
  .querySelectorAll(
    ".close-panel"
  )
  .forEach(button => {

    button.onclick =
      () => {

        closePanel(
          button.dataset.close
        );

      };

  });


document
  .getElementById(
    "inventoryButton"
  )
  .onclick =
  () => {

    renderInventory();

    togglePanel(
      "inventoryPanel"
    );

  };


document
  .getElementById(
    "diaryButton"
  )
  .onclick =
  () => {

    renderDiary();

    togglePanel(
      "diaryPanel"
    );

  };


/* =====================================================
   START GAME
===================================================== */

document
  .getElementById(
    "startGame"
  )
  .onclick =
  () => {

    state.playerName =
      playerNameInput.value
        .trim() ||
      "PLAYER";


    document
      .getElementById(
        "displayName"
      )
      .textContent =
      state.playerName
        .toUpperCase();


    startAudio();


    showScreen(
      screens.game
    );


    initGame();

  };


/* =====================================================
   INIT
===================================================== */

function initGame() {

  resizeCanvas();


  player.x =
    width / 2;

  player.y =
    height / 2;


  state.battery =
    100;

  state.flashlight =
    true;

  state.inventory =
    [];

  state.diary =
    [];

  state.cluesFound =
    0;


  updateObjective(
    "Cari tahu kenapa rumah ini masih memiliki listrik."
  );


  addDiary(
    "FIRST NIGHT",
    "Aku akhirnya kembali ke rumah lama keluarga. Aku tidak tahu kenapa, tapi rasanya rumah ini masih menungguku."
  );


  renderInventory();

  renderDiary();

}


/* =====================================================
   MAIN LOOP
===================================================== */

function gameLoop() {

  if (
    screens.game.classList.contains(
      "active"
    )
  ) {

    updatePlayer();

    updateBattery();

    findInteraction();

    drawWorld();

    drawPlayer();

    drawDarkness();

  }


  requestAnimationFrame(
    gameLoop
  );

}


gameLoop();
