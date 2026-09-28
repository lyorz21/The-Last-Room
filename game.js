/* =========================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 6
   SAVE SYSTEM + MULTIPLE ENDINGS + SECRET ROOM
   + FINAL ENTITY EVENT + ACHIEVEMENTS
   ========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =========================
   SCREEN SYSTEM
========================= */

const screens = {
  cinematic: document.getElementById("cinematicScreen"),
  creator: document.getElementById("creatorScreen"),
  game: document.getElementById("gameScreen"),
  over: document.getElementById("gameOverScreen")
};

function showScreen(name) {
  Object.values(screens).forEach(screen => {
    if (screen) screen.classList.remove("active");
  });

  if (screens[name]) {
    screens[name].classList.add("active");
  }
}

/* =========================
   UI
========================= */

const ui = {
  chapter: document.getElementById("chapter"),
  battery: document.getElementById("battery"),
  objective: document.getElementById("objective"),
  storyMessage: document.getElementById("storyMessage"),

  inventoryList: document.getElementById("inventoryList"),
  diaryList: document.getElementById("diaryList"),

  inspectOverlay: document.getElementById("inspectOverlay"),
  inspectTitle: document.getElementById("inspectTitle"),
  inspectText: document.getElementById("inspectText"),
  closeInspect: document.getElementById("closeInspect"),

  flashlightBtn: document.getElementById("flashlightBtn"),
  interactBtn: document.getElementById("interactBtn"),

  upBtn: document.getElementById("upBtn"),
  downBtn: document.getElementById("downBtn"),
  leftBtn: document.getElementById("leftBtn"),
  rightBtn: document.getElementById("rightBtn"),

  playerName: document.getElementById("playerName"),
  skinColor: document.getElementById("skinColor"),
  hairColor: document.getElementById("hairColor"),
  outfitColor: document.getElementById("outfitColor"),

  startGame: document.getElementById("startGame"),

  chapterLabel: document.getElementById("chapterLabel"),
  cinematicText: document.getElementById("cinematicText"),
  skipCinematic: document.getElementById("skipCinematic")
};

/* =========================
   GAME STATE
========================= */

let playerName = "Unknown";

let currentRoom = "hallway";

let battery = 100;
let fear = 0;
let gameTime = 0;

let flashlight = false;

let inventory = [];
let diary = [];
let achievements = [];

let endingReached = false;

let player = {
  x: 450,
  y: 330,
  speed: 2.7,
  radius: 13
};

let colors = {
  skin: "#d59b72",
  hair: "#191919",
  outfit: "#3d3d45"
};

/* =========================
   STORY FLAGS
========================= */

let story = {
  photograph: false,
  clock: false,
  radio: false,
  code: false,
  bedroom: false,
  mirror: false,
  basement: false,
  letter: false,

  finalDoor: false,
  houseKey: false,

  entityAwake: false,

  secret: false,
  secretSolved: false,

  finalEvent: false,
  truthFound: false,

  escaped: false
};

/* =========================
   ENTITY
========================= */

let entity = {
  room: "hallway",
  x: 700,
  y: 250,

  visible: false,
  state: "hidden",

  timer: 0,
  aggression: 0
};

/* =========================
   INPUT
========================= */

const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.key.toLowerCase() === "e") {
    interact();
  }

  if (e.key.toLowerCase() === "f") {
    toggleFlashlight();
  }

  if (e.key.toLowerCase() === "escape") {
    togglePause();
  }
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

/* =========================
   MOBILE CONTROLS
========================= */

function holdButton(button, key) {
  if (!button) return;

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    keys[key] = true;
  });

  button.addEventListener("pointerup", e => {
    e.preventDefault();
    keys[key] = false;
  });

  button.addEventListener("pointerleave", () => {
    keys[key] = false;
  });
}

holdButton(ui.upBtn, "w");
holdButton(ui.downBtn, "s");
holdButton(ui.leftBtn, "a");
holdButton(ui.rightBtn, "d");

ui.interactBtn?.addEventListener("click", interact);
ui.flashlightBtn?.addEventListener("click", toggleFlashlight);

/* =========================
   RESIZE
========================= */

function resizeCanvas() {
  canvas.width = canvas.clientWidth || 900;
  canvas.height = canvas.clientHeight || 600;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =========================
   ROOMS
========================= */

const rooms = {

  hallway: {
    floor: "#171719",
    wall: "#29272b",
    light: 0.65,
    ambience: "hallway"
  },

  living: {
    floor: "#201d1c",
    wall: "#302b29",
    light: 0.55,
    ambience: "living"
  },

  bedroom: {
    floor: "#18191e",
    wall: "#272833",
    light: 0.38,
    ambience: "bedroom"
  },

  basement: {
    floor: "#101113",
    wall: "#1a1b1e",
    light: 0.18,
    ambience: "basement"
  },

  secret: {
    floor: "#111216",
    wall: "#202129",
    light: 0.12,
    ambience: "secret"
  }
};

/* =========================
   SAVE SYSTEM
========================= */

const SAVE_KEY = "TLR_FORGOTTEN_SAVE_V6";

function saveGame(showMessage = true) {

  const saveData = {
    version: 6,

    playerName,
    currentRoom,

    battery,
    fear,
    gameTime,

    flashlight,

    inventory,
    diary,
    achievements,

    player,
    colors,

    story,

    entity
  };

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(saveData)
  );

  if (showMessage) {
    message("PROGRESS DISIMPAN...");
  }
}

function loadGame() {

  const raw = localStorage.getItem(SAVE_KEY);

  if (!raw) {
    message("BELUM ADA SAVE.");
    return false;
  }

  try {

    const data = JSON.parse(raw);

    playerName = data.playerName ?? "Unknown";
    currentRoom = data.currentRoom ?? "hallway";

    battery = data.battery ?? 100;
    fear = data.fear ?? 0;
    gameTime = data.gameTime ?? 0;

    flashlight = data.flashlight ?? false;

    inventory = data.inventory ?? [];
    diary = data.diary ?? [];
    achievements = data.achievements ?? [];

    player = {
      ...player,
      ...(data.player || {})
    };

    colors = {
      ...colors,
      ...(data.colors || {})
    };

    story = {
      ...story,
      ...(data.story || {})
    };

    entity = {
      ...entity,
      ...(data.entity || {})
    };

    updateUI();

    showScreen("game");

    message("SAVE DITEMUKAN.");

    return true;

  } catch (error) {

    console.error(error);

    message("SAVE RUSAK.");

    return false;
  }
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

/* Autosave */

setInterval(() => {

  if (screens.game?.classList.contains("active")) {
    saveGame(false);
  }

}, 15000);

window.addEventListener("beforeunload", () => {
  saveGame(false);
});

/* =========================
   CINEMATIC
========================= */

const cinematicScenes = [
  {
    chapter: "CHAPTER I",
    text: "23:41 PM."
  },

  {
    chapter: "THE HOUSE",
    text: "Rumah itu seharusnya sudah lama kosong."
  },

  {
    chapter: "THE WARNING",
    text: "Tapi malam ini... pintunya terbuka."
  },

  {
    chapter: "THE LAST ROOM",
    text: "Dan seseorang masih menunggumu."
  }
];

let cinematicIndex = 0;

function playCinematic() {

  if (cinematicIndex >= cinematicScenes.length) {
    showScreen("creator");
    return;
  }

  const scene = cinematicScenes[cinematicIndex];

  if (ui.chapterLabel) {
    ui.chapterLabel.textContent = scene.chapter;
  }

  if (ui.cinematicText) {
    ui.cinematicText.textContent = scene.text;
  }

  cinematicIndex++;

  setTimeout(playCinematic, 2600);
}

ui.skipCinematic?.addEventListener("click", () => {
  cinematicIndex = cinematicScenes.length;
  showScreen("creator");
});

/* =========================
   CHARACTER CREATOR
========================= */

function updatePreview() {

  document.querySelectorAll(".preview-skin")
    .forEach(el => el.style.background = colors.skin);

  document.querySelectorAll(".preview-hair")
    .forEach(el => el.style.background = colors.hair);

  document.querySelectorAll(".preview-outfit")
    .forEach(el => el.style.background = colors.outfit);
}

ui.skinColor?.addEventListener("input", e => {
  colors.skin = e.target.value;
  updatePreview();
});

ui.hairColor?.addEventListener("input", e => {
  colors.hair = e.target.value;
  updatePreview();
});

ui.outfitColor?.addEventListener("input", e => {
  colors.outfit = e.target.value;
  updatePreview();
});

ui.startGame?.addEventListener("click", () => {

  playerName =
    ui.playerName?.value.trim() || "Unknown";

  deleteSave();

  currentRoom = "hallway";

  player.x = 450;
  player.y = 330;

  battery = 100;
  fear = 0;
  gameTime = 0;

  inventory = [];
  diary = [];
  achievements = [];

  story = {
    photograph: false,
    clock: false,
    radio: false,
    code: false,
    bedroom: false,
    mirror: false,
    basement: false,
    letter: false,
    finalDoor: false,
    houseKey: false,
    entityAwake: false,
    secret: false,
    secretSolved: false,
    finalEvent: false,
    truthFound: false,
    escaped: false
  };

  entity.visible = false;
  entity.state = "hidden";

  showScreen("game");

  cinematicIndex = 0;

  message(
    "Cari tahu kenapa rumah ini belum benar-benar kosong."
  );

  unlockAchievement("THE FIRST STEP");
});

/* =========================
   CONTINUE SAVE BUTTON
========================= */

function createContinueButton() {

  if (document.getElementById("continueSave")) {
    return;
  }

  const button = document.createElement("button");

  button.id = "continueSave";
  button.textContent = "CONTINUE";

  button.style.marginTop = "12px";

  button.onclick = () => {
    loadGame();
  };

  ui.startGame?.parentElement?.appendChild(button);
}

createContinueButton();

/* =========================
   MESSAGE
========================= */

let messageTimer = null;

function message(text) {

  if (!ui.storyMessage) return;

  ui.storyMessage.textContent = text;

  clearTimeout(messageTimer);

  messageTimer = setTimeout(() => {
    ui.storyMessage.textContent = "";
  }, 4000);
}

/* =========================
   INVENTORY
========================= */

function addItem(item) {

  if (!inventory.includes(item)) {
    inventory.push(item);

    message(`ITEM DITEMUKAN: ${item}`);

    updateUI();
    saveGame(false);
  }
}

function hasItem(item) {
  return inventory.includes(item);
}

/* =========================
   DIARY
========================= */

function addDiary(text) {

  if (!diary.includes(text)) {

    diary.push(text);

    message("CATATAN BARU MASUK KE DIARY.");

    updateUI();

    saveGame(false);
  }
}

/* =========================
   ACHIEVEMENTS
========================= */

function unlockAchievement(name) {

  if (achievements.includes(name)) return;

  achievements.push(name);

  message(`ACHIEVEMENT: ${name}`);

  saveGame(false);
}

/* =========================
   UI UPDATE
========================= */

function updateUI() {

  if (ui.battery) {
    ui.battery.textContent =
      `BATTERY ${Math.max(0, Math.floor(battery))}%`;
  }

  if (ui.chapter) {

    const titles = {
      hallway: "THE HALLWAY",
      living: "THE LIVING ROOM",
      bedroom: "THE BEDROOM",
      basement: "THE BASEMENT",
      secret: "THE FORGOTTEN ROOM"
    };

    ui.chapter.textContent =
      titles[currentRoom] || currentRoom;
  }

  if (ui.inventoryList) {

    ui.inventoryList.innerHTML =
      inventory.length
        ? inventory.map(i => `<li>${i}</li>`).join("")
        : "<li>Empty</li>";
  }

  if (ui.diaryList) {

    ui.diaryList.innerHTML =
      diary.length
        ? diary.map(i => `<li>${i}</li>`).join("")
        : "<li>No notes</li>";
  }

  updateObjective();
}

/* =========================
   OBJECTIVE
========================= */

function updateObjective() {

  let objective =
    "Explore the house.";

  if (!story.photograph) {
    objective = "Find something that explains the house.";
  }
  else if (!story.clock) {
    objective = "Inspect the old clock.";
  }
  else if (!story.radio) {
    objective = "Listen to the radio.";
  }
  else if (!story.code) {
    objective = "Find the room code.";
  }
  else if (!story.bedroom) {
    objective = "Open the bedroom.";
  }
  else if (!story.mirror) {
    objective = "Inspect the mirror.";
  }
  else if (!story.basement) {
    objective = "Find a way into the basement.";
  }
  else if (!story.letter) {
    objective = "Search the basement.";
  }
  else if (!story.secret) {
    objective = "There may be another room...";
  }
  else if (!story.secretSolved) {
    objective = "Solve the forgotten room.";
  }
  else if (!story.finalDoor) {
    objective = "Find the final door.";
  }
  else if (!story.finalEvent) {
    objective = "Something has awakened.";
  }

  if (ui.objective) {
    ui.objective.textContent = objective;
  }
}

/* =========================
   FLASHLIGHT
========================= */

function toggleFlashlight() {

  if (battery <= 0) {

    flashlight = false;

    message("FLASHLIGHT KEHABISAN BATERAI.");

    return;
  }

  flashlight = !flashlight;

  sound(
    flashlight ? 700 : 250,
    0.05,
    "square"
  );
}

/* =========================
   MOVEMENT
========================= */

function updatePlayer() {

  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["arrowup"]) dy--;
  if (keys["s"] || keys["arrowdown"]) dy++;
  if (keys["a"] || keys["arrowleft"]) dx--;
  if (keys["d"] || keys["arrowright"]) dx++;

  if (dx !== 0 || dy !== 0) {

    const length =
      Math.sqrt(dx * dx + dy * dy);

    dx /= length;
    dy /= length;

    player.x += dx * player.speed;
    player.y += dy * player.speed;

    if (Math.random() < 0.03) {
      footstep();
    }
  }

  player.x =
    Math.max(35, Math.min(canvas.width - 35, player.x));

  player.y =
    Math.max(35, Math.min(canvas.height - 35, player.y));
}

/* =========================
   ROOM TRANSITIONS
========================= */

function checkRoomTransition() {

  if (currentRoom === "hallway") {

    if (player.x > canvas.width - 40) {

      if (story.radio) {

        currentRoom = "living";
        player.x = 60;

        doorSound();
        message("Ruang tengah...");
      }
      else {
        message("Pintu ini terasa terkunci.");
        player.x = canvas.width - 45;
      }
    }
  }

  else if (currentRoom === "living") {

    if (player.x < 40) {

      currentRoom = "hallway";
      player.x = canvas.width - 60;

      doorSound();
    }

    if (
      player.y < 45 &&
      story.code
    ) {

      currentRoom = "bedroom";
      player.y = canvas.height - 70;

      story.bedroom = true;

      unlockAchievement("THE BEDROOM");

      doorSound();
    }
  }

  else if (currentRoom === "bedroom") {

    if (player.y > canvas.height - 40) {

      currentRoom = "living";
      player.y = 70;

      doorSound();
    }

    if (
      player.x > canvas.width - 45 &&
      story.letter
    ) {

      currentRoom = "basement";

      player.x = 70;

      story.basement = true;

      unlockAchievement("BELOW");

      doorSound();
    }
  }

  else if (currentRoom === "basement") {

    if (player.x < 40) {

      currentRoom = "bedroom";

      player.x = canvas.width - 70;

      doorSound();
    }

    if (
      player.x > canvas.width - 60 &&
      story.secretSolved
    ) {

      currentRoom = "secret";

      player.x = 70;

      unlockAchievement("THE FORGOTTEN ROOM");

      doorSound();
    }
  }

  else if (currentRoom === "secret") {

    if (player.x < 40) {

      currentRoom = "basement";

      player.x = canvas.width - 70;

      doorSound();
    }
  }
}

/* =========================
   INTERACTION
========================= */

function interact() {

  const objects = getNearbyObject();

  if (!objects) return;

  objects.action();
}

/* =========================
   OBJECT DETECTION
========================= */

function distance(a, b) {

  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2
  );
}

function getNearbyObject() {

  const x = player.x;
  const y = player.y;

  /* HALLWAY */

  if (currentRoom === "hallway") {

    if (
      Math.abs(x - 180) < 70 &&
      Math.abs(y - 210) < 70
    ) {

      return {
        action: inspectPhoto
      };
    }

    if (
      Math.abs(x - 450) < 70 &&
      Math.abs(y - 150) < 70
    ) {

      return {
        action: inspectClock
      };
    }
  }

  /* LIVING */

  if (currentRoom === "living") {

    if (
      Math.abs(x - 250) < 80 &&
      Math.abs(y - 250) < 80
    ) {

      return {
        action: inspectRadio
      };
    }

    if (
      Math.abs(x - 550) < 80 &&
      Math.abs(y - 180) < 80
    ) {

      return {
        action: inspectPainting
      };
    }
  }

  /* BEDROOM */

  if (currentRoom === "bedroom") {

    if (
      Math.abs(x - 280) < 80 &&
      Math.abs(y - 230) < 80
    ) {

      return {
        action: inspectMirror
      };
    }

    if (
      Math.abs(x - 620) < 90 &&
      Math.abs(y - 250) < 90
    ) {

      return {
        action: inspectWardrobe
      };
    }
  }

  /* BASEMENT */

  if (currentRoom === "basement") {

    if (
      Math.abs(x - 300) < 100 &&
      Math.abs(y - 300) < 100
    ) {

      return {
        action: inspectBox
      };
    }

    if (
      Math.abs(x - 720) < 100 &&
      Math.abs(y - 300) < 100
    ) {

      return {
        action: finalDoor
      };
    }

    /* SECRET DOOR */

    if (
      Math.abs(x - 520) < 90 &&
      Math.abs(y - 120) < 90
    ) {

      return {
        action: secretDoor
      };
    }
  }

  /* SECRET ROOM */

  if (currentRoom === "secret") {

    if (
      Math.abs(x - 450) < 110 &&
      Math.abs(y - 230) < 110
    ) {

      return {
        action: solveSecretRoom
      };
    }
  }

  return null;
}

/* =========================
   INSPECT PANEL
========================= */

function inspect(title, text) {

  if (!ui.inspectOverlay) return;

  ui.inspectTitle.textContent = title;
  ui.inspectText.textContent = text;

  ui.inspectOverlay.classList.add("active");
}

ui.closeInspect?.addEventListener("click", () => {

  ui.inspectOverlay?.classList.remove("active");

});

/* =========================
   HALLWAY OBJECTS
========================= */

function inspectPhoto() {

  if (!story.photograph) {

    story.photograph = true;

    addItem("Old Family Photograph");

    addDiary(
      "Ada seseorang berdiri di belakang keluarga itu."
    );

    unlockAchievement("THE CURIOUS");

    inspect(
      "OLD PHOTOGRAPH",
      "Empat orang berdiri di depan rumah. Tapi ada bayangan kelima di belakang mereka."
    );

  } else {

    inspect(
      "OLD PHOTOGRAPH",
      "Semakin lama kamu melihatnya, semakin terasa seperti sosok itu sedang melihat balik."
    );
  }
}

function inspectClock() {

  if (!story.clock) {

    story.clock = true;

    addItem("Clock Note");

    addDiary(
      "Jam berhenti tepat pada 03:17."
    );

    unlockAchievement("03:17");

    inspect(
      "OLD CLOCK",
      "Jarumnya berhenti di 03:17."
    );

  } else {

    inspect(
      "03:17",
      "Jarum jam tidak bergerak."
    );
  }
}

/* =========================
   LIVING ROOM
========================= */

function inspectRadio() {

  if (!story.radio) {

    story.radio = true;

    addItem("Radio Recording");

    addDiary(
      "Radio: 0... 3... 1... 7..."
    );

    unlockAchievement("LISTEN");

    inspect(
      "OLD RADIO",
      "Suara statis berubah menjadi bisikan: 0... 3... 1... 7..."
    );

  } else {

    inspect(
      "RADIO",
      "Sekarang radio hanya mengeluarkan suara statis."
    );
  }
}

function inspectPainting() {

  if (
    story.radio &&
    story.clock
  ) {

    story.code = true;

    addItem("Room Code: 0317");

    addDiary(
      "Kode yang ditemukan: 0317."
    );

    inspect(
      "PAINTING",
      "Di balik lukisan tertulis angka: 0317."
    );

  } else {

    inspect(
      "PAINTING",
      "Lukisan rumah tua. Ada sesuatu yang terasa familiar."
    );
  }
}

/* =========================
   BEDROOM
========================= */

function inspectMirror() {

  if (!story.mirror) {

    story.mirror = true;

    addDiary(
      "Cermin tidak memantulkan ruangan dengan benar."
    );

    unlockAchievement("REFLECTION");

    inspect(
      "MIRROR",
      "Untuk sesaat, pantulanmu terlambat bergerak."
    );

  } else {

    inspect(
      "MIRROR",
      "Pantulan itu sekarang bergerak sedikit berbeda."
    );
  }
}

function inspectWardrobe() {

  if (!hasItem("Basement Key")) {

    addItem("Basement Key");

    inspect(
      "WARDROBE",
      "Sebuah kunci tua tersembunyi di balik pakaian."
    );

  } else {

    inspect(
      "WARDROBE",
      "Kosong."
    );
  }
}

/* =========================
   BASEMENT
========================= */

function inspectBox() {

  if (!story.letter) {

    story.letter = true;

    addItem("Old Letter");

    addDiary(
      "Surat itu menyebut sebuah ruangan yang tidak pernah ada di denah rumah."
    );

    inspect(
      "OLD BOX",
      "Di dalamnya ada surat lama. Kalimat terakhirnya: 'Jangan pernah membuka ruangan yang dilupakan.'"
    );

  } else {

    inspect(
      "OLD BOX",
      "Tidak ada apa-apa lagi."
    );
  }
}

/* =========================
   SECRET ROOM
========================= */

function secretDoor() {

  if (
    story.letter &&
    story.mirror &&
    story.radio
  ) {

    inspect(
      "HIDDEN DOOR",
      "Pintunya tidak terlihat seperti pintu biasa. Ada simbol 03:17."
    );

    if (!story.secret) {

      story.secret = true;

      addDiary(
        "Aku menemukan pintu yang tidak ada di denah."
      );

      message(
        "PINTU TERSEMBUNYI TERBUKA."
      );
    }

  } else {

    message(
      "Ada sesuatu yang belum kamu pahami."
    );
  }
}

/* =========================
   SECRET ROOM PUZZLE
========================= */

function solveSecretRoom() {

  if (story.secretSolved) {

    inspect(
      "THE FORGOTTEN ROOM",
      "Dinding penuh foto. Semua foto memiliki wajah yang sama."
    );

    return;
  }

  const required = [
    story.photograph,
    story.clock,
    story.radio,
    story.mirror,
    story.letter
  ];

  if (required.every(Boolean)) {

    story.secretSolved = true;
    story.truthFound = true;

    addItem("Truth Fragment");

    addDiary(
      "Rumah ini bukan tempat Entity tinggal. Rumah ini adalah tempat ia mengingat."
    );

    unlockAchievement("THE TRUTH");

    inspect(
      "THE FORGOTTEN ROOM",
      "Kamu menemukan dinding penuh foto. Di tengahnya ada satu foto kosong dengan namamu."
    );

    saveGame(false);

  } else {

    inspect(
      "THE FORGOTTEN ROOM",
      "Ruangan ini terasa belum lengkap. Masih ada sesuatu yang belum kamu temukan."
    );
  }
}

/* =========================
   FINAL DOOR
========================= */

function finalDoor() {

  if (!story.finalDoor) {

    if (!hasItem("House Key")) {

      story.finalDoor = true;

      addItem("House Key");

      story.entityAwake = true;

      entity.visible = true;
      entity.state = "watching";

      unlockAchievement("THE LAST ROOM");

      message(
        "Kamu menemukan kunci rumah. Sesuatu terbangun."
      );

      triggerFinalEvent();

    }

    return;
  }

  if (story.finalEvent) {

    chooseEnding();

  } else {

    triggerFinalEvent();
  }
}

/* =========================
   FINAL ENTITY EVENT
========================= */

let finalEventTimer = null;

function triggerFinalEvent() {

  if (story.finalEvent) return;

  story.finalEvent = true;

  entity.visible = true;
  entity.state = "near";
  entity.aggression = 100;

  message(
    "JANGAN BERHENTI BERJALAN."
  );

  addDiary(
    "Entity akhirnya memperlihatkan dirinya."
  );

  unlockAchievement("I SAW YOU");

  let countdown = 15;

  clearInterval(finalEventTimer);

  finalEventTimer = setInterval(() => {

    countdown--;

    if (countdown <= 0) {

      clearInterval(finalEventTimer);

      if (
        currentRoom === "basement" &&
        distance(player, entity) < 220
      ) {

        ending("FORGOTTEN");

      } else {

        message(
          "Pintu terakhir terbuka. SEKARANG!"
        );
      }

      return;
    }

    if (Math.random() < 0.5) {
      footstep();
    }

  }, 1000);
}

/* =========================
   ENDINGS
========================= */

function chooseEnding() {

  if (endingReached) return;

  if (
    story.secretSolved &&
    story.truthFound
  ) {

    ending("TRUE");

    return;
  }

  if (
    story.truthFound
  ) {

    ending("TRUTH");

    return;
  }

  ending("ESCAPE");
}

function ending(type) {

  if (endingReached) return;

  endingReached = true;

  story.escaped = true;

  let title = "";
  let text = "";

  if (type === "ESCAPE") {

    title = "ENDING — ESCAPE";

    text =
      "Kamu berhasil keluar dari rumah itu. Tapi ketika menoleh, jendelanya masih menyala.";

    unlockAchievement("ESCAPED");
  }

  else if (type === "TRUTH") {

    title = "ENDING — THE TRUTH";

    text =
      "Kamu mengetahui sebagian kebenaran. Rumah itu menyimpan ingatan yang seharusnya sudah hilang.";

    unlockAchievement("THE TRUTH");
  }

  else if (type === "TRUE") {

    title = "TRUE ENDING — FORGOTTEN";

    text =
      "Kamu tidak hanya keluar. Kamu memahami kenapa rumah itu mengingat namamu.";

    unlockAchievement("TRUE ENDING");
  }

  else {

    title = "ENDING — FORGOTTEN";

    text =
      "Lampu rumah kembali menyala. Pintu tertutup. Tidak ada yang tahu kamu pernah berada di sana.";

    unlockAchievement("FORGOTTEN");
  }

  showEndingOverlay(title, text);

  saveGame(false);
}

/* =========================
   ENDING OVERLAY
========================= */

function showEndingOverlay(title, text) {

  let overlay =
    document.getElementById("endingOverlay");

  if (!overlay) {

    overlay = document.createElement("div");

    overlay.id = "endingOverlay";

    Object.assign(
      overlay.style,
      {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,.94)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "30px",
        textAlign: "center",
        zIndex: "99999",
        color: "white",
        fontFamily: "sans-serif"
      }
    );

    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div style="
      font-size:12px;
      letter-spacing:5px;
      opacity:.55;
      margin-bottom:20px;
    ">
      THE LAST ROOM
    </div>

    <h1 style="
      font-size:clamp(28px,7vw,60px);
      margin:0 0 20px;
      letter-spacing:3px;
    ">
      ${title}
    </h1>

    <p style="
      max-width:600px;
      line-height:1.8;
      opacity:.8;
    ">
      ${text}
    </p>

    <button
      id="endingRestart"
      style="
        margin-top:30px;
        padding:14px 25px;
        background:transparent;
        color:white;
        border:1px solid rgba(255,255,255,.4);
        cursor:pointer;
      "
    >
      RETURN TO MENU
    </button>
  `;

  overlay.style.display = "flex";

  document
    .getElementById("endingRestart")
    ?.addEventListener("click", () => {

      overlay.remove();

      endingReached = false;

      showScreen("creator");
    });
}

/* =========================
   ENTITY AI
========================= */

function updateEntity() {

  if (!story.entityAwake) return;

  entity.timer++;

  if (
    !entity.visible &&
    gameTime > 1000
  ) {

    entity.visible = true;
    entity.state = "watching";

    entity.room = currentRoom;

    entity.x =
      Math.random() * canvas.width;

    entity.y =
      Math.random() * canvas.height;
  }

  if (
    entity.visible &&
    entity.room === currentRoom
  ) {

    const d =
      distance(player, entity);

    if (d < 300) {

      entity.state = "near";

      fear += 0.04;

      if (Math.random() < 0.02) {
        whisper();
      }

    } else {

      entity.state = "watching";
    }

    if (
      entity.state === "near" &&
      d > 90
    ) {

      const angle =
        Math.atan2(
          player.y - entity.y,
          player.x - entity.x
        );

      entity.x +=
        Math.cos(angle) * 0.55;

      entity.y +=
        Math.sin(angle) * 0.55;
    }

    if (
      d < 85 &&
      !story.finalEvent
    ) {

      jumpscare();
    }
  }
}

/* =========================
   JUMPSCARE
========================= */

function jumpscare() {

  entity.visible = false;

  fear += 18;

  const flash =
    document.createElement("div");

  Object.assign(
    flash.style,
    {
      position: "fixed",
      inset: "0",
      background: "white",
      zIndex: "99998",
      opacity: "1",
      transition: "opacity .7s"
    }
  );

  document.body.appendChild(flash);

  sound(80, .5, "sawtooth");

  setTimeout(() => {
    flash.style.opacity = "0";
  }, 100);

  setTimeout(() => {
    flash.remove();
  }, 800);

  message(
    "JANGAN MENATAPNYA."
  );
}

/* =========================
   GAME LOOP
========================= */

let paused = false;

function loop() {

  if (!paused) {

    updatePlayer();
    checkRoomTransition();

    gameTime++;

    if (flashlight) {

      battery -=
        currentRoom === "basement"
          ? 0.018
          : 0.009;

      if (battery <= 0) {

        battery = 0;
        flashlight = false;

        message(
          "FLASHLIGHT MATI."
        );
      }
    }

    updateEntity();

    fear = Math.max(
      0,
      fear - 0.006
    );

    updateUI();

    render();
  }

  requestAnimationFrame(loop);
}

/* =========================
   PAUSE
========================= */

function togglePause() {

  if (!screens.game?.classList.contains("active")) {
    return;
  }

  paused = !paused;

  if (paused) {

    message("GAME PAUSED");

    saveGame(false);

  } else {

    message("GAME RESUMED");
  }
}

/* =========================
   RENDER
========================= */

function render() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawRoom();
  drawObjects();
  drawEntity();
  drawPlayer();
  drawLighting();
}

/* =========================
   ROOM
========================= */

function drawRoom() {

  const room =
    rooms[currentRoom];

  ctx.fillStyle = room.floor;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /* floor lines */

  ctx.strokeStyle =
    "rgba(255,255,255,.025)";

  ctx.lineWidth = 1;

  for (
    let x = 0;
    x < canvas.width;
    x += 45
  ) {

    ctx.beginPath();

    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);

    ctx.stroke();
  }

  for (
    let y = 0;
    y < canvas.height;
    y += 45
  ) {

    ctx.beginPath();

    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);

    ctx.stroke();
  }

  /* walls */

  ctx.fillStyle = room.wall;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    35
  );

  ctx.fillRect(
    0,
    canvas.height - 35,
    canvas.width,
    35
  );

  ctx.fillRect(
    0,
    0,
    35,
    canvas.height
  );

  ctx.fillRect(
    canvas.width - 35,
    0,
    35,
    canvas.height
  );
}

/* =========================
   OBJECTS
========================= */

function drawObjects() {

  ctx.save();

  if (currentRoom === "hallway") {

    furniture(180, 210, 90, 60);
    clock(450, 150);

  }

  if (currentRoom === "living") {

    furniture(250, 250, 120, 70);
    radio(250, 250);

    painting(550, 180);

  }

  if (currentRoom === "bedroom") {

    furniture(280, 230, 130, 80);
    mirror(280, 230);

    wardrobe(620, 250);

  }

  if (currentRoom === "basement") {

    box(300, 300);

    finalDoorDraw(
      canvas.width - 70,
      300
    );

    if (
      story.letter &&
      story.mirror &&
      story.radio
    ) {

      hiddenDoor(
        520,
        120
      );
    }
  }

  if (currentRoom === "secret") {

    ritualCircle(
      canvas.width / 2,
      230
    );

    for (
      let i = 0;
      i < 6;
      i++
    ) {

      pictureFrame(
        120 + i * 130,
        100
      );
    }
  }

  ctx.restore();
}

/* =========================
   SIMPLE OBJECT DRAWING
========================= */

function furniture(x, y, w, h) {

  ctx.fillStyle = "#373235";

  ctx.fillRect(
    x - w / 2,
    y - h / 2,
    w,
    h
  );

  ctx.strokeStyle =
    "rgba(255,255,255,.1)";

  ctx.strokeRect(
    x - w / 2,
    y - h / 2,
    w,
    h
  );
}

function clock(x, y) {

  ctx.strokeStyle = "#aaa";

  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    35,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo(x, y);
  ctx.lineTo(x - 5, y - 15);

  ctx.moveTo(x, y);
  ctx.lineTo(x + 14, y);

  ctx.stroke();
}

function radio(x, y) {

  ctx.fillStyle = "#151515";

  ctx.fillRect(
    x - 45,
    y - 25,
    90,
    50
  );

  ctx.fillStyle = "#777";

  ctx.fillRect(
    x - 25,
    y - 12,
    50,
    20
  );
}

function painting(x, y) {

  ctx.strokeStyle = "#8a7058";

  ctx.lineWidth = 10;

  ctx.strokeRect(
    x - 45,
    y - 35,
    90,
    70
  );

  ctx.fillStyle = "#151515";

  ctx.fillRect(
    x - 40,
    y - 30,
    80,
    60
  );
}

function mirror(x, y) {

  ctx.fillStyle = "#252a31";

  ctx.fillRect(
    x - 45,
    y - 70,
    90,
    140
  );

  ctx.strokeStyle = "#aaa";

  ctx.strokeRect(
    x - 45,
    y - 70,
    90,
    140
  );
}

function wardrobe(x, y) {

  ctx.fillStyle = "#30261f";

  ctx.fillRect(
    x - 55,
    y - 75,
    110,
    150
  );

  ctx.strokeStyle =
    "rgba(255,255,255,.12)";

  ctx.strokeRect(
    x - 55,
    y - 75,
    110,
    150
  );
}

function box(x, y) {

  ctx.fillStyle = "#514031";

  ctx.fillRect(
    x - 45,
    y - 35,
    90,
    70
  );
}

function finalDoorDraw(x, y) {

  ctx.fillStyle = "#08090a";

  ctx.fillRect(
    x - 35,
    y - 70,
    70,
    140
  );

  ctx.strokeStyle =
    story.finalDoor
      ? "#8e7777"
      : "#454545";

  ctx.strokeRect(
    x - 35,
    y - 70,
    70,
    140
  );
}

function hiddenDoor(x, y) {

  ctx.strokeStyle =
    "rgba(160,150,180,.35)";

  ctx.strokeRect(
    x - 40,
    y - 60,
    80,
    120
  );

  ctx.font = "14px serif";

  ctx.fillStyle =
    "rgba(220,210,230,.5)";

  ctx.textAlign = "center";

  ctx.fillText(
    "03:17",
    x,
    y + 5
  );
}

function ritualCircle(x, y) {

  ctx.strokeStyle =
    "rgba(170,170,190,.25)";

  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    70,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    35,
    0,
    Math.PI * 2
  );

  ctx.stroke();
}

function pictureFrame(x, y) {

  ctx.fillStyle = "#332a25";

  ctx.fillRect(
    x - 35,
    y - 45,
    70,
    90
  );

  ctx.fillStyle = "#171717";

  ctx.fillRect(
    x - 27,
    y - 37,
    54,
    74
  );
}

/* =========================
   ENTITY DRAW
========================= */

function drawEntity() {

  if (
    !entity.visible ||
    entity.room !== currentRoom
  ) {
    return;
  }

  ctx.save();

  ctx.globalAlpha =
    entity.state === "watching"
      ? 0.35
      : 0.75;

  ctx.fillStyle = "#050505";

  ctx.beginPath();

  ctx.ellipse(
    entity.x,
    entity.y,
    25,
    70,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "rgba(255,255,255,.75)";

  ctx.beginPath();

  ctx.arc(
    entity.x - 8,
    entity.y - 20,
    3,
    0,
    Math.PI * 2
  );

  ctx.arc(
    entity.x + 8,
    entity.y - 20,
    3,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}

/* =========================
   PLAYER
========================= */

function drawPlayer() {

  ctx.save();

  ctx.fillStyle = colors.outfit;

  ctx.beginPath();

  ctx.arc(
    player.x,
    player.y + 8,
    12,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle = colors.skin;

  ctx.beginPath();

  ctx.arc(
    player.x,
    player.y - 8,
    8,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle = colors.hair;

  ctx.beginPath();

  ctx.arc(
    player.x,
    player.y - 11,
    8,
    Math.PI,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}

/* =========================
   LIGHTING
========================= */

function drawLighting() {

  const room =
    rooms[currentRoom];

  const darkness =
    1 - room.light;

  const gradient =
    ctx.createRadialGradient(
      player.x,
      player.y,
      flashlight ? 40 : 10,
      player.x,
      player.y,
      flashlight ? 280 : 130
    );

  gradient.addColorStop(
    0,
    "rgba(0,0,0,0)"
  );

  gradient.addColorStop(
    1,
    `rgba(0,0,0,${Math.min(
      .95,
      darkness + fear / 220
    )})`
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /* fear vignette */

  if (fear > 10) {

    const vignette =
      ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        80,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(
          canvas.width,
          canvas.height
        ) / 1.2
      );

    vignette.addColorStop(
      0,
      "rgba(0,0,0,0)"
    );

    vignette.addColorStop(
      1,
      `rgba(20,0,0,${Math.min(
        .55,
        fear / 180
      )})`
    );

    ctx.fillStyle = vignette;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
}

/* =========================
   AUDIO
========================= */

let audioContext = null;

function getAudio() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
  }

  if (
    audioContext.state === "suspended"
  ) {
    audioContext.resume();
  }

  return audioContext;
}

function sound(
  frequency,
  duration,
  type = "sine"
) {

  try {

    const audio = getAudio();

    const osc =
      audio.createOscillator();

    const gain =
      audio.createGain();

    osc.type = type;

    osc.frequency.value =
      frequency;

    gain.gain.setValueAtTime(
      0.001,
      audio.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.08,
      audio.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(audio.destination);

    osc.start();

    osc.stop(
      audio.currentTime + duration
    );

  } catch {}
}

function footstep() {

  sound(
    65 + Math.random() * 25,
    .07,
    "triangle"
  );
}

function whisper() {

  sound(
    180 + Math.random() * 60,
    .18,
    "sine"
  );
}

function doorSound() {

  sound(
    120,
    .3,
    "sawtooth"
  );
}

/* =========================
   START
========================= */

updatePreview();

showScreen("cinematic");

setTimeout(() => {
  playCinematic();
}, 500);

loop();
