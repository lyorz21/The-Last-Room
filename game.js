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
/* =========================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 7
   MAIN MENU + SAVE SLOTS + SETTINGS + PAUSE MENU
   + AUDIO CONTROL + GRAPHICS QUALITY + STATISTICS
   ========================================================= */

(() => {

  /* =========================
     PHASE 7 STATE
  ========================= */

  const P7 = {
    volume: Number(
      localStorage.getItem("TLR_VOLUME") ?? 0.65
    ),

    quality:
      localStorage.getItem("TLR_QUALITY") || "high",

    fullscreen:
      localStorage.getItem("TLR_FULLSCREEN") === "true",

    playTime: Number(
      localStorage.getItem("TLR_PLAYTIME") || 0
    ),

    deaths: Number(
      localStorage.getItem("TLR_DEATHS") || 0
    ),

    menuCreated: false,
    settingsOpen: false,
    statsOpen: false,
    pauseOpen: false
  };


  /* =========================
     SAVE SLOTS
  ========================= */

  const SLOT_KEYS = [
    "TLR_SLOT_1",
    "TLR_SLOT_2",
    "TLR_SLOT_3"
  ];


  function getSlot(slot) {

    try {

      const raw =
        localStorage.getItem(
          SLOT_KEYS[slot - 1]
        );

      if (!raw) return null;

      return JSON.parse(raw);

    } catch {

      return null;
    }
  }


  function saveToSlot(slot) {

    if (
      typeof player === "undefined"
    ) return;

    const data = {

      version: 7,

      playerName,
      currentRoom,

      battery,
      fear,
      gameTime,

      flashlight,

      inventory: [...inventory],
      diary: [...diary],
      achievements: [...achievements],

      player: {
        ...player
      },

      colors: {
        ...colors
      },

      story: {
        ...story
      },

      entity: {
        ...entity
      },

      savedAt: Date.now()
    };


    localStorage.setItem(
      SLOT_KEYS[slot - 1],
      JSON.stringify(data)
    );


    /* Keep Phase 6 save compatible */

    localStorage.setItem(
      "TLR_FORGOTTEN_SAVE_V6",
      JSON.stringify(data)
    );


    showToast(
      `SAVE SLOT ${slot} — SAVED`
    );


    refreshSlotUI();
  }


  function loadFromSlot(slot) {

    const data =
      getSlot(slot);

    if (!data) {

      showToast(
        `SAVE SLOT ${slot} KOSONG`
      );

      return;
    }


    playerName =
      data.playerName ?? "Unknown";

    currentRoom =
      data.currentRoom ?? "hallway";

    battery =
      data.battery ?? 100;

    fear =
      data.fear ?? 0;

    gameTime =
      data.gameTime ?? 0;

    flashlight =
      data.flashlight ?? false;


    inventory =
      data.inventory ?? [];

    diary =
      data.diary ?? [];

    achievements =
      data.achievements ?? [];


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


    endingReached = false;


    document
      .getElementById("tlrMainMenu")
      ?.remove();


    showScreen("game");

    updateUI();

    showToast(
      `SAVE SLOT ${slot} — LOADED`
    );
  }


  function deleteSlot(slot) {

    localStorage.removeItem(
      SLOT_KEYS[slot - 1]
    );

    showToast(
      `SAVE SLOT ${slot} DIHAPUS`
    );

    refreshSlotUI();
  }


  /* =========================
     TOAST
  ========================= */

  function showToast(text) {

    let toast =
      document.getElementById(
        "tlrToast"
      );


    if (!toast) {

      toast =
        document.createElement("div");

      toast.id =
        "tlrToast";


      Object.assign(
        toast.style,
        {

          position: "fixed",

          left: "50%",

          bottom: "30px",

          transform:
            "translateX(-50%)",

          padding:
            "11px 18px",

          background:
            "rgba(10,10,12,.92)",

          border:
            "1px solid rgba(255,255,255,.18)",

          color: "#fff",

          fontFamily:
            "Arial,sans-serif",

          fontSize: "12px",

          letterSpacing:
            "2px",

          zIndex: "100000",

          pointerEvents:
            "none",

          opacity: "0",

          transition:
            "opacity .25s"

        }
      );


      document.body.appendChild(
        toast
      );
    }


    toast.textContent =
      text.toUpperCase();

    toast.style.opacity = "1";


    clearTimeout(
      toast._timer
    );


    toast._timer =
      setTimeout(() => {

        toast.style.opacity =
          "0";

      }, 2200);
  }


  /* =========================
     PHASE 7 STYLE
  ========================= */

  function injectStyle() {

    if (
      document.getElementById(
        "tlrPhase7Style"
      )
    ) return;


    const style =
      document.createElement("style");

    style.id =
      "tlrPhase7Style";


    style.textContent = `

      #tlrMainMenu,
      #tlrPauseMenu,
      #tlrSettings,
      #tlrStats,
      #tlrSlots {

        position: fixed;
        inset: 0;

        z-index: 90000;

        background:
          radial-gradient(
            circle at center,
            rgba(38,38,44,.28),
            rgba(0,0,0,.97)
          );

        color: white;

        display: flex;

        align-items: center;
        justify-content: center;

        font-family:
          Arial, sans-serif;

      }


      .tlr-panel {

        width:
          min(760px, 92vw);

        max-height:
          88vh;

        overflow-y:
          auto;

        padding:
          clamp(22px,5vw,55px);

        border:
          1px solid
          rgba(255,255,255,.12);

        background:
          rgba(8,8,10,.88);

        box-shadow:
          0 0 80px
          rgba(0,0,0,.8);

        text-align:
          center;

        backdrop-filter:
          blur(12px);

      }


      .tlr-logo {

        font-family:
          Georgia, serif;

        font-size:
          clamp(30px,8vw,72px);

        letter-spacing:
          clamp(4px,1.2vw,12px);

        line-height:
          1;

        margin-bottom:
          12px;

      }


      .tlr-subtitle {

        font-size:
          10px;

        letter-spacing:
          5px;

        opacity:
          .45;

        margin-bottom:
          40px;

      }


      .tlr-button {

        display:
          block;

        width:
          min(330px, 82vw);

        margin:
          9px auto;

        padding:
          14px 18px;

        background:
          rgba(255,255,255,.025);

        border:
          1px solid
          rgba(255,255,255,.18);

        color:
          white;

        font-size:
          11px;

        letter-spacing:
          3px;

        cursor:
          pointer;

        transition:
          .2s;

      }


      .tlr-button:hover {

        background:
          rgba(255,255,255,.1);

        border-color:
          rgba(255,255,255,.45);

      }


      .tlr-danger {

        opacity:
          .55;

      }


      .tlr-grid {

        display:
          grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(180px,1fr)
          );

        gap:
          12px;

        margin:
          20px 0;

      }


      .tlr-slot {

        border:
          1px solid
          rgba(255,255,255,.12);

        padding:
          18px;

        min-height:
          140px;

        background:
          rgba(255,255,255,.025);

      }


      .tlr-slot-title {

        font-size:
          11px;

        letter-spacing:
          3px;

        margin-bottom:
          15px;

      }


      .tlr-slot-info {

        min-height:
          45px;

        font-size:
          10px;

        line-height:
          1.7;

        opacity:
          .55;

      }


      .tlr-small {

        font-size:
          9px;

        opacity:
          .35;

        letter-spacing:
          2px;

      }


      .tlr-setting {

        text-align:
          left;

        padding:
          16px 0;

        border-bottom:
          1px solid
          rgba(255,255,255,.08);

      }


      .tlr-setting label {

        display:
          flex;

        justify-content:
          space-between;

        align-items:
          center;

        gap:
          15px;

        font-size:
          11px;

        letter-spacing:
          2px;

      }


      .tlr-setting input[type="range"] {

        width:
          180px;

      }


      .tlr-select {

        background:
          #111;

        color:
          white;

        border:
          1px solid
          rgba(255,255,255,.2);

        padding:
          8px;

      }


      .tlr-stat-number {

        font-size:
          32px;

        margin:
          7px;

      }


      .tlr-stat-label {

        font-size:
          9px;

        letter-spacing:
          2px;

        opacity:
          .45;

      }


      @media(max-width:600px) {

        .tlr-panel {

          padding:
            25px 16px;

        }

        .tlr-button {

          width:
            100%;

        }

        .tlr-setting label {

          flex-direction:
            column;

          align-items:
            flex-start;

        }

      }

    `;


    document.head.appendChild(
      style
    );
  }


  /* =========================
     MAIN MENU
  ========================= */

  function createMainMenu() {

    if (
      document.getElementById(
        "tlrMainMenu"
      )
    ) return;


    const menu =
      document.createElement("div");

    menu.id =
      "tlrMainMenu";


    menu.innerHTML = `

      <div class="tlr-panel">

        <div class="tlr-logo">
          THE LAST ROOM
        </div>

        <div class="tlr-subtitle">
          FORGOTTEN
        </div>


        <button
          class="tlr-button"
          id="tlrNewGame"
        >
          NEW GAME
        </button>


        <button
          class="tlr-button"
          id="tlrContinue"
        >
          CONTINUE
        </button>


        <button
          class="tlr-button"
          id="tlrLoad"
        >
          SAVE SLOTS
        </button>


        <button
          class="tlr-button"
          id="tlrSettingsBtn"
        >
          SETTINGS
        </button>


        <button
          class="tlr-button"
          id="tlrStatsBtn"
        >
          ARCHIVE
        </button>


        <div class="tlr-small">
          VERSION 7.0
        </div>

      </div>

    `;


    document.body.appendChild(
      menu
    );


    document
      .getElementById("tlrNewGame")
      .onclick = () => {

        menu.remove();

        showScreen(
          "cinematic"
        );

        cinematicIndex = 0;

        setTimeout(
          playCinematic,
          300
        );
      };


    document
      .getElementById("tlrContinue")
      .onclick = () => {

        if (
          localStorage.getItem(
            "TLR_FORGOTTEN_SAVE_V6"
          )
        ) {

          loadGame();

          menu.remove();

        } else {

          showToast(
            "BELUM ADA PROGRESS"
          );
        }
      };


    document
      .getElementById("tlrLoad")
      .onclick =
      createSlotScreen;


    document
      .getElementById("tlrSettingsBtn")
      .onclick =
      createSettings;


    document
      .getElementById("tlrStatsBtn")
      .onclick =
      createStats;
  }


  /* =========================
     SAVE SLOT SCREEN
  ========================= */

  function createSlotScreen() {

    document
      .getElementById("tlrSlots")
      ?.remove();


    const overlay =
      document.createElement("div");

    overlay.id =
      "tlrSlots";


    overlay.innerHTML = `

      <div class="tlr-panel">

        <div class="tlr-logo"
          style="font-size:32px">
          SAVE SLOTS
        </div>

        <div
          class="tlr-subtitle"
          style="margin-bottom:20px"
        >
          YOUR MEMORIES
        </div>

        <div
          class="tlr-grid"
          id="tlrSlotGrid"
        ></div>


        <button
          class="tlr-button"
          id="tlrSlotBack"
        >
          BACK
        </button>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    document
      .getElementById("tlrSlotBack")
      .onclick = () => {

        overlay.remove();
      };


    refreshSlotUI();
  }


  function refreshSlotUI() {

    const grid =
      document.getElementById(
        "tlrSlotGrid"
      );

    if (!grid) return;


    grid.innerHTML = "";


    SLOT_KEYS.forEach(
      (_, index) => {

        const slotNumber =
          index + 1;

        const data =
          getSlot(slotNumber);


        const card =
          document.createElement(
            "div"
          );

        card.className =
          "tlr-slot";


        if (data) {

          const date =
            new Date(
              data.savedAt
            );


          card.innerHTML = `

            <div
              class="tlr-slot-title"
            >
              SLOT ${slotNumber}
            </div>

            <div
              class="tlr-slot-info"
            >

              ${escapeHTML(
                data.playerName ||
                "UNKNOWN"
              )}

              <br>

              ${String(
                data.currentRoom ||
                "UNKNOWN"
              ).toUpperCase()}

              <br>

              ${date.toLocaleDateString()}

            </div>

            <button
              class="tlr-button"
              data-load="${slotNumber}"
            >
              LOAD
            </button>

            <button
              class="tlr-button tlr-danger"
              data-delete="${slotNumber}"
            >
              DELETE
            </button>

          `;

        } else {

          card.innerHTML = `

            <div
              class="tlr-slot-title"
            >
              SLOT ${slotNumber}
            </div>

            <div
              class="tlr-slot-info"
            >
              EMPTY
            </div>

            <button
              class="tlr-button"
              data-save="${slotNumber}"
            >
              SAVE CURRENT
            </button>

          `;
        }


        grid.appendChild(
          card
        );
      }
    );


    grid
      .querySelectorAll(
        "[data-load]"
      )
      .forEach(button => {

        button.onclick = () => {

          loadFromSlot(
            Number(
              button.dataset.load
            )
          );
        };

      });


    grid
      .querySelectorAll(
        "[data-delete]"
      )
      .forEach(button => {

        button.onclick = () => {

          deleteSlot(
            Number(
              button.dataset.delete
            )
          );
        };

      });


    grid
      .querySelectorAll(
        "[data-save]"
      )
      .forEach(button => {

        button.onclick = () => {

          saveToSlot(
            Number(
              button.dataset.save
            )
          );
        };

      });
  }


  /* =========================
     SETTINGS
  ========================= */

  function createSettings() {

    document
      .getElementById(
        "tlrSettings"
      )
      ?.remove();


    const overlay =
      document.createElement("div");

    overlay.id =
      "tlrSettings";


    overlay.innerHTML = `

      <div class="tlr-panel">

        <div
          class="tlr-logo"
          style="font-size:32px"
        >
          SETTINGS
        </div>


        <div class="tlr-setting">

          <label>

            MASTER VOLUME

            <input
              id="tlrVolume"
              type="range"
              min="0"
              max="1"
              step=".01"
              value="${P7.volume}"
            >

          </label>

        </div>


        <div class="tlr-setting">

          <label>

            GRAPHICS

            <select
              id="tlrQuality"
              class="tlr-select"
            >

              <option
                value="low"
                ${P7.quality === "low"
                  ? "selected"
                  : ""}
              >
                LOW
              </option>

              <option
                value="medium"
                ${P7.quality === "medium"
                  ? "selected"
                  : ""}
              >
                MEDIUM
              </option>

              <option
                value="high"
                ${P7.quality === "high"
                  ? "selected"
                  : ""}
              >
                HIGH
              </option>

            </select>

          </label>

        </div>


        <div class="tlr-setting">

          <label>

            FULLSCREEN

            <input
              id="tlrFullscreen"
              type="checkbox"
              ${P7.fullscreen
                ? "checked"
                : ""}
            >

          </label>

        </div>


        <button
          class="tlr-button"
          id="tlrSettingsBack"
        >
          BACK
        </button>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    document
      .getElementById("tlrVolume")
      .oninput = e => {

        P7.volume =
          Number(
            e.target.value
          );

        localStorage.setItem(
          "TLR_VOLUME",
          P7.volume
        );

        applyVolume();
      };


    document
      .getElementById("tlrQuality")
      .onchange = e => {

        P7.quality =
          e.target.value;

        localStorage.setItem(
          "TLR_QUALITY",
          P7.quality
        );

        showToast(
          `GRAPHICS: ${P7.quality}`
        );
      };


    document
      .getElementById(
        "tlrFullscreen"
      )
      .onchange = async e => {

        P7.fullscreen =
          e.target.checked;

        localStorage.setItem(
          "TLR_FULLSCREEN",
          P7.fullscreen
        );


        if (
          P7.fullscreen &&
          document.documentElement
            .requestFullscreen
        ) {

          try {
            await document
              .documentElement
              .requestFullscreen();

          } catch {}

        }

        else if (
          !P7.fullscreen &&
          document.exitFullscreen
        ) {

          try {
            await document
              .exitFullscreen();

          } catch {}
        }
      };


    document
      .getElementById(
        "tlrSettingsBack"
      )
      .onclick = () => {

        overlay.remove();
      };
  }


  /* =========================
     VOLUME
  ========================= */

  function applyVolume() {

    if (
      typeof audioContext !==
      "undefined" &&
      audioContext
    ) {

      /* Existing Phase 6 sounds
         remain functional. */

      audioContext.destination
        .channelCountMode =
        "max";
    }
  }


  /* =========================
     ARCHIVE / STATISTICS
  ========================= */

  function createStats() {

    document
      .getElementById("tlrStats")
      ?.remove();


    const overlay =
      document.createElement("div");

    overlay.id =
      "tlrStats";


    const totalAchievements =
      achievements?.length || 0;


    const totalDiary =
      diary?.length || 0;


    const totalItems =
      inventory?.length || 0;


    overlay.innerHTML = `

      <div class="tlr-panel">

        <div
          class="tlr-logo"
          style="font-size:32px"
        >
          ARCHIVE
        </div>

        <div
          class="tlr-subtitle"
          style="margin-bottom:25px"
        >
          WHAT YOU REMEMBER
        </div>


        <div class="tlr-grid">

          <div class="tlr-slot">

            <div
              class="tlr-stat-number"
            >
              ${totalAchievements}
            </div>

            <div
              class="tlr-stat-label"
            >
              ACHIEVEMENTS
            </div>

          </div>


          <div class="tlr-slot">

            <div
              class="tlr-stat-number"
            >
              ${totalDiary}
            </div>

            <div
              class="tlr-stat-label"
            >
              DIARY NOTES
            </div>

          </div>


          <div class="tlr-slot">

            <div
              class="tlr-stat-number"
            >
              ${totalItems}
            </div>

            <div
              class="tlr-stat-label"
            >
              ITEMS
            </div>

          </div>


          <div class="tlr-slot">

            <div
              class="tlr-stat-number"
            >
              ${Math.floor(
                P7.playTime / 60
              )}
            </div>

            <div
              class="tlr-stat-label"
            >
              MINUTES PLAYED
            </div>

          </div>

        </div>


        <button
          class="tlr-button"
          id="tlrStatsBack"
        >
          BACK
        </button>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    document
      .getElementById(
        "tlrStatsBack"
      )
      .onclick = () => {

        overlay.remove();
      };
  }


  /* =========================
     PAUSE MENU
  ========================= */

  function createPauseMenu() {

    if (
      document.getElementById(
        "tlrPauseMenu"
      )
    ) return;


    const overlay =
      document.createElement("div");

    overlay.id =
      "tlrPauseMenu";


    overlay.innerHTML = `

      <div class="tlr-panel">

        <div
          class="tlr-logo"
          style="font-size:36px"
        >
          PAUSED
        </div>

        <div
          class="tlr-subtitle"
        >
          THE HOUSE IS STILL LISTENING
        </div>


        <button
          class="tlr-button"
          id="tlrResume"
        >
          RESUME
        </button>


        <button
          class="tlr-button"
          id="tlrQuickSave"
        >
          QUICK SAVE
        </button>


        <button
          class="tlr-button"
          id="tlrPauseSettings"
        >
          SETTINGS
        </button>


        <button
          class="tlr-button tlr-danger"
          id="tlrExit"
        >
          EXIT TO MENU
        </button>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    document
      .getElementById(
        "tlrResume"
      )
      .onclick = () => {

        closePause();
      };


    document
      .getElementById(
        "tlrQuickSave"
      )
      .onclick = () => {

        saveGame(false);

        showToast(
          "QUICK SAVE COMPLETE"
        );
      };


    document
      .getElementById(
        "tlrPauseSettings"
      )
      .onclick = () => {

        createSettings();
      };


    document
      .getElementById(
        "tlrExit"
      )
      .onclick = () => {

        saveGame(false);

        closePause();

        showScreen(
          "creator"
        );

        createMainMenu();
      };
  }


  function closePause() {

    document
      .getElementById(
        "tlrPauseMenu"
      )
      ?.remove();

    paused = false;
  }


  /* =========================
     OVERRIDE PAUSE
  ========================= */

  const originalTogglePause =
    window.togglePause;


  window.togglePause =
    function() {

      if (
        !screens.game?.classList
          .contains("active")
      ) {

        return;
      }


      if (!paused) {

        paused = true;

        createPauseMenu();

      } else {

        closePause();
      }
    };


  /* =========================
     ESC KEY
  ========================= */

  document.addEventListener(
    "keydown",
    e => {

      if (
        e.key === "Escape" &&
        screens.game?.classList
          .contains("active")
      ) {

        window.togglePause();
      }

    }
  );


  /* =========================
     PLAYTIME TRACKER
  ========================= */
   
  /* =========================
     SAFE HTML
  ========================= */

  function escapeHTML(text) {

    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  /* =========================
     BOOT
  ========================= */

  injectStyle();


  /*
    Jangan langsung menampilkan
    menu kalau player masih berada
    di creator/cinematic.

    Kita tambahkan tombol MENU
    setelah game aktif.
  */


  function addGameMenuButton() {

    if (
      document.getElementById(
        "tlrMenuButton"
      )
    ) return;


    const button =
      document.createElement("button");

    button.id =
      "tlrMenuButton";

    button.textContent =
      "☰";


    Object.assign(
      button.style,
      {

        position: "fixed",

        top: "12px",

        right: "12px",

        zIndex: "80000",

        width: "38px",

        height: "38px",

        background:
          "rgba(0,0,0,.55)",

        border:
          "1px solid rgba(255,255,255,.15)",

        color: "white",

        cursor: "pointer",

        fontSize: "18px"

      }
    );


    button.onclick =
      () => {

        if (
          screens.game?.classList
            .contains("active")
        ) {

          window.togglePause();
        }
      };


    document.body.appendChild(
      button
    );
  }


  addGameMenuButton();


  /*
    Main menu muncul ketika
    halaman pertama kali dibuka.
  */

  setTimeout(() => {

    if (
      !screens.game?.classList
        .contains("active")
    ) {

      createMainMenu();
    }

  }, 700);


  /* =========================
     PHASE 7 READY
  ========================= */

  console.log(
    "THE LAST ROOM — FORGOTTEN | PHASE 7 ONLINE"
  );

})();
/* =========================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 8
   THE HOUSE IS ALIVE
   ========================================================= */

(() => {

  const P8 = {

    started: false,

    houseAwake: false,

    clockEventTriggered: false,

    roomShiftCount: 0,

    paranormalCount: 0,

    photoChanged: false,

    entitySeenBackground: false,

    chapter2: false,

    fearPulse: 0,

    distortion: 0,

    lastEvent: 0,

    eventCooldown: 0,

    eventMessage: "",

    originalRoom: null

  };


  /* =====================================================
     PHASE 8 STYLE
  ===================================================== */

  function injectPhase8Style() {

    if (
      document.getElementById("tlrPhase8Style")
    ) return;


    const style =
      document.createElement("style");

    style.id =
      "tlrPhase8Style";


    style.textContent = `

      #tlrChapter2 {

        position:fixed;
        inset:0;

        z-index:100001;

        display:flex;
        align-items:center;
        justify-content:center;

        background:
          radial-gradient(
            circle,
            rgba(30,30,35,.18),
            #000 75%
          );

        color:#fff;

        text-align:center;

        pointer-events:auto;

      }


      .tlr-ch2-box {

        width:min(700px,88vw);

        padding:45px 25px;

        animation:
          tlrChapterFade 2s ease;

      }


      .tlr-ch2-small {

        font-size:10px;

        letter-spacing:7px;

        opacity:.45;

        margin-bottom:25px;

      }


      .tlr-ch2-title {

        font-family:
          Georgia,serif;

        font-size:
          clamp(38px,10vw,90px);

        letter-spacing:
          7px;

        margin:0 0 25px;

      }


      .tlr-ch2-text {

        font-size:13px;

        line-height:2;

        opacity:.65;

      }


      @keyframes tlrChapterFade {

        from {
          opacity:0;
          transform:scale(1.04);
        }

        to {
          opacity:1;
          transform:scale(1);
        }

      }


      .tlr-glitch {

        animation:
          tlrGlitch .12s infinite;

      }


      @keyframes tlrGlitch {

        0% {
          transform:translate(0);
        }

        25% {
          transform:translate(2px,-1px);
        }

        50% {
          transform:translate(-2px,1px);
        }

        75% {
          transform:translate(1px,2px);
        }

        100% {
          transform:translate(0);
        }

      }


      #tlrEventText {

        position:fixed;

        left:50%;

        bottom:18%;

        transform:
          translateX(-50%);

        z-index:90001;

        color:#fff;

        font-size:11px;

        letter-spacing:4px;

        text-align:center;

        opacity:0;

        pointer-events:none;

        transition:
          opacity .5s;

        text-shadow:
          0 0 15px #000;

      }


      #tlrClockOverlay {

        position:fixed;

        inset:0;

        z-index:100000;

        pointer-events:none;

        background:
          rgba(0,0,0,.0);

        transition:
          background .2s;

      }

    `;


    document.head.appendChild(style);
  }


  /* =====================================================
     EVENT MESSAGE
  ===================================================== */

  function eventText(text, duration = 3000) {

    let el =
      document.getElementById(
        "tlrEventText"
      );


    if (!el) {

      el =
        document.createElement("div");

      el.id =
        "tlrEventText";

      document.body.appendChild(el);
    }


    el.textContent =
      text;


    el.style.opacity = "1";


    clearTimeout(
      el._timer
    );


    el._timer =
      setTimeout(() => {

        el.style.opacity = "0";

      }, duration);
  }


  /* =====================================================
     HOUSE AWAKENS
  ===================================================== */

  function awakenHouse() {

    if (P8.houseAwake) return;


    P8.houseAwake = true;

    story.houseAwake = true;


    eventText(
      "THE HOUSE REMEMBERS YOU.",
      4500
    );


    addDiarySafe(
      "Setelah membuka ruangan terakhir, rumah mulai berubah."
    );


    P8.distortion = 1;

    setTimeout(() => {

      P8.distortion = 0;

    }, 2500);
  }


  /* =====================================================
     SAFE DIARY
  ===================================================== */

  function addDiarySafe(text) {

    if (
      typeof addDiary === "function"
    ) {

      addDiary(text);

    } else if (
      typeof diary !== "undefined"
    ) {

      if (!diary.includes(text)) {

        diary.push(text);
      }
    }
  }


  /* =====================================================
     03:17 EVENT
  ===================================================== */

  function clock0317Event() {

    if (
      P8.clockEventTriggered
    ) return;


    P8.clockEventTriggered = true;


    const overlay =
      document.createElement("div");

    overlay.id =
      "tlrClockOverlay";


    document.body.appendChild(
      overlay
    );


    let flashes = 0;


    const flashTimer =
      setInterval(() => {

        flashes++;


        overlay.style.background =
          flashes % 2
            ? "rgba(255,255,255,.08)"
            : "rgba(0,0,0,.15)";


        if (flashes >= 8) {

          clearInterval(
            flashTimer
          );

          overlay.remove();
        }

      }, 130);


    eventText(
      "03:17",
      3500
    );


    addDiarySafe(
      "Pada 03:17, seluruh rumah seperti berhenti bernapas."
    );


    P8.fearPulse = 25;

    P8.distortion = 1;


    setTimeout(() => {

      P8.distortion = 0;

    }, 1600);


    playLowTone();
  }


  /* =====================================================
     CHECK GAME TIME
  ===================================================== */

  function check0317() {

    if (!P8.houseAwake) return;


    /*
      GameTime berjalan cepat,
      jadi event dibuat berdasarkan
      interval internal.
    */

    const cycle =
      gameTime % 317;


    if (
      cycle >= 314 &&
      cycle <= 316
    ) {

      clock0317Event();
    }
  }


  /* =====================================================
     RANDOM PARANORMAL EVENTS
  ===================================================== */

  const paranormalEvents = [

    "KAMU MENDENGAR LANGKAH DI ATAS.",

    "ADA YANG BERDIRI DI UJUNG KORIDOR.",

    "PINTU ITU TADI TIDAK TERBUKA.",

    "JANGAN LIHAT KE BELAKANG.",

    "SUARA RADIO ITU KEMBALI.",

    "ADA YANG MEMANGGIL NAMAMU.",

    "RUMAH INI TIDAK SAMA SEPERTI TADI.",

    "SESEORANG BARU SAJA LEWAT.",

    "JANGAN TERLALU LAMA DIAM.",

    "KAMU BUKAN SENDIRIAN."

  ];


  function randomParanormalEvent() {

    if (!P8.houseAwake) return;


    if (
      gameTime -
      P8.lastEvent <
      400
    ) return;


    if (
      Math.random() > .004
    ) return;


    P8.lastEvent =
      gameTime;

    P8.paranormalCount++;


    const text =
      paranormalEvents[
        Math.floor(
          Math.random() *
          paranormalEvents.length
        )
      ];


    eventText(
      text,
      3200
    );


    P8.fearPulse +=
      4 + Math.random() * 8;


    playWhisperSound();


    /*
      Beberapa event menyebabkan
      perubahan kecil.
    */

    const roll =
      Math.random();


    if (roll < .25) {

      flickerScreen();

    }

    else if (roll < .5) {

      moveEntityBackground();

    }

    else if (roll < .75) {

      shiftHouse();

    }

    else {

      changePhoto();
    }
  }


  /* =====================================================
     SCREEN FLICKER
  ===================================================== */

  function flickerScreen() {

    const overlay =
      document.createElement("div");


    Object.assign(
      overlay.style,
      {

        position:"fixed",

        inset:"0",

        background:
          "rgba(255,255,255,.12)",

        zIndex:"89999",

        pointerEvents:"none"

      }
    );


    document.body.appendChild(
      overlay
    );


    setTimeout(() => {

      overlay.style.opacity =
        "0";

    }, 80);


    setTimeout(() => {

      overlay.remove();

    }, 300);
  }


  /* =====================================================
     ENTITY BACKGROUND APPEARANCE
  ===================================================== */

  function moveEntityBackground() {

    if (
      typeof entity === "undefined"
    ) return;


    entity.room =
      currentRoom;


    entity.x =
      Math.random() *
      canvas.width;


    entity.y =
      50 +
      Math.random() *
      (canvas.height - 100);


    entity.visible = true;

    entity.state =
      "watching";


    P8.entitySeenBackground =
      true;


    eventText(
      "JANGAN MENATAPNYA.",
      2200
    );


    setTimeout(() => {

      if (
        entity.state ===
        "watching"
      ) {

        entity.visible =
          false;
      }

    }, 1800);
  }


  /* =====================================================
     HOUSE SHIFT
  ===================================================== */

  function shiftHouse() {

    if (
      P8.roomShiftCount >= 5
    ) return;


    P8.roomShiftCount++;


    eventText(
      "ADA YANG BERUBAH.",
      2500
    );


    P8.distortion = 1;


    /*
      Perubahan visual ringan.
      Tidak memindahkan player secara
      tiba-tiba agar gameplay tidak rusak.
    */

    setTimeout(() => {

      P8.distortion = 0;

    }, 1200);


    addDiarySafe(
      `Perubahan rumah ke-${P8.roomShiftCount}.`
    );
  }


  /* =====================================================
     PHOTO CHANGES
  ===================================================== */

  function changePhoto() {

    if (
      P8.photoChanged
    ) return;


    if (
      !story.photograph
    ) return;


    P8.photoChanged =
      true;


    story.photoChanged =
      true;


    eventText(
      "FOTONYA BERUBAH.",
      3000
    );


    addDiarySafe(
      "Foto keluarga berubah ketika aku tidak melihatnya."
    );


    P8.fearPulse += 12;
  }


  /* =====================================================
     ENTITY REACTS TO PLAYER
  ===================================================== */

  function entityReaction() {

    if (
      typeof entity === "undefined"
    ) return;


    if (
      !P8.houseAwake
    ) return;


    if (
      entity.room !== currentRoom
    ) return;


    const d =
      Math.sqrt(
        (player.x - entity.x) ** 2 +
        (player.y - entity.y) ** 2
      );


    /*
      Player terlalu dekat:
      Entity menjadi lebih agresif.
    */

    if (
      d < 260
    ) {

      entity.aggression =
        Math.min(
          100,
          entity.aggression + .03
        );
    }


    /*
      Player menyalakan flashlight
      dekat Entity.
    */

    if (
      flashlight &&
      d < 180
    ) {

      entity.visible =
        true;

      entity.state =
        "watching";

      P8.fearPulse += .02;
    }
  }


  /* =====================================================
     FEAR SYSTEM
  ===================================================== */

  function updateFearPulse() {

    if (
      P8.fearPulse <= 0
    ) return;


    P8.fearPulse *= .96;


    if (
      typeof fear !==
      "undefined"
    ) {

      fear =
        Math.min(
          100,
          fear +
          P8.fearPulse * .005
        );
    }
  }


  /* =====================================================
     CHAPTER II
  ===================================================== */

  function startChapter2() {

    if (P8.chapter2) return;


    P8.chapter2 = true;


    const overlay =
      document.createElement("div");

    overlay.id =
      "tlrChapter2";


    overlay.innerHTML = `

      <div
        class="tlr-ch2-box"
      >

        <div
          class="tlr-ch2-small"
        >
          CHAPTER II
        </div>

        <h1
          class="tlr-ch2-title"
        >
          THE HOUSE
        </h1>

        <p
          class="tlr-ch2-text"
        >
          Kamu pikir semuanya berakhir<br>
          ketika pintu itu terbuka.
          <br><br>
          Ternyata rumahnya belum selesai
          mengingatmu.
        </p>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    setTimeout(() => {

      overlay.style.opacity =
        "0";

    }, 4500);


    setTimeout(() => {

      overlay.remove();

    }, 5600);


    story.chapter2 =
      true;


    addDiarySafe(
      "CHAPTER II — Rumah belum selesai mengingatku."
    );
  }


  /* =====================================================
     LOW AUDIO
  ===================================================== */

  function playLowTone() {

    try {

      if (
        typeof sound ===
        "function"
      ) {

        sound(
          42,
          .8,
          "sine"
        );

        setTimeout(() => {

          sound(
            58,
            .6,
            "triangle"
          );

        }, 250);
      }

    } catch {}
  }


  function playWhisperSound() {

    try {

      if (
        typeof whisper ===
        "function"
      ) {

        whisper();

      }

    } catch {}
  }


  /* =====================================================
     MONITOR STORY
  ===================================================== */

  function monitorStory() {

    if (
      typeof story ===
      "undefined"
    ) return;


    /*
      Rumah mulai hidup setelah
      player mendapatkan Old Letter.
    */

    if (
      story.letter &&
      !P8.houseAwake
    ) {

      awakenHouse();
    }


    /*
      Chapter II setelah secret
      + truth ditemukan.
    */

    if (
      story.secretSolved &&
      story.truthFound &&
      !P8.chapter2
    ) {

      startChapter2();
    }
  }


  /* =====================================================
     VISUAL DISTORTION
  ===================================================== */

  function drawPhase8Distortion() {

    if (
      !P8.distortion
    ) return;


    ctx.save();


    const intensity =
      P8.distortion *
      8;


    for (
      let i = 0;
      i < 5;
      i++
    ) {

      const y =
        Math.random() *
        canvas.height;


      ctx.fillStyle =
        `rgba(255,255,255,${
          .015 +
          Math.random() * .025
        })`;


      ctx.fillRect(
        Math.random() * -20,
        y,
        canvas.width + 40,
        1 + intensity / 4
      );
    }


    ctx.restore();
  }


  /* =====================================================
     RANDOM CAMERA SHAKE
  ===================================================== */

  function cameraShake() {

    if (
      P8.fearPulse < 10
    ) return;


    const game =
      document.getElementById(
        "gameScreen"
      );


    if (!game) return;


    game.classList.add(
      "tlr-glitch"
    );


    setTimeout(() => {

      game.classList.remove(
        "tlr-glitch"
      );

    }, 180);
  }


  /* =====================================================
     HOOK INTO GAME LOOP
  ===================================================== */

  const oldLoop =
    window.loop;


  /*
    Karena loop Phase 6 tidak
    tersedia sebagai window function
    di semua browser, kita gunakan
    interval aman.
  */

  setInterval(() => {

    if (
      typeof screens !==
      "undefined" &&
      screens.game &&
      screens.game.classList.contains(
        "active"
      )
    ) {

      monitorStory();

      check0317();

      randomParanormalEvent();

      entityReaction();

      updateFearPulse();

      if (
        P8.fearPulse > 12 &&
        Math.random() < .08
      ) {

        cameraShake();
      }

    }

  }, 100);


  /* =====================================================
     DRAW HOOK
  ===================================================== */

  const originalRender =
    window.render;


  /*
    Tambahkan overlay visual
    dengan interval sehingga tidak
    merusak render Phase 6.
  */

  setInterval(() => {

    if (
      typeof screens !==
      "undefined" &&
      screens.game &&
      screens.game.classList.contains(
        "active"
      )
    ) {

      drawPhase8Distortion();
    }

  }, 80);


  /* =====================================================
     SECRET ENDING CONDITION
  ===================================================== */

  function checkHiddenEnding() {

    if (
      typeof story ===
      "undefined"
    ) return;


    if (
      story.chapter2 &&
      story.entityAwake &&
      story.truthFound &&
      P8.entitySeenBackground &&
      P8.photoChanged
    ) {

      story.hiddenEndingReady =
        true;
    }
  }


  setInterval(
    checkHiddenEnding,
    1000
  );


  /* =====================================================
     NEW SECRET INTERACTION
  ===================================================== */

  function secretEndingHint() {

    if (
      !story.hiddenEndingReady
    ) return;


    eventText(
      "ADA SESUATU DI BALIK FOTO.",
      3000
    );


    addDiarySafe(
      "Ada satu hal lagi yang belum kulihat."
    );
  }


  /*
    Saat player membuka diary
    atau melakukan interaksi,
    sesekali munculkan hint.
  */

  document.addEventListener(
    "keydown",
    e => {

      if (
        e.key.toLowerCase() === "j"
      ) {

        secretEndingHint();
      }

    }
  );


  /* =====================================================
     PHASE 8 BOOT
  ===================================================== */

  injectPhase8Style();


  console.log(
    "THE LAST ROOM — FORGOTTEN | PHASE 8: THE HOUSE IS ALIVE"
  );

})();
/* =========================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 9 — MEMORY
   ========================================================= */

(() => {
  "use strict";

  const P9 = {
    initialized: false,

    memories: {
      inspectedPhoto: false,
      heardRadio: false,
      sawMirror: false,
      foundLetter: false,
      foundTruth: false,
      sawEntity: false,
      enteredSecret: false,
      openedFinalDoor: false
    },

    mirrorWorld: false,
    memoryLevel: 0,
    mirrorVisits: 0,
    chapter3: false,
    secretRoom2: false,
    memoryEndingReady: false,

    photoVersion: 0,
    houseShift: 0,
    lastMemoryEvent: 0,
    lastWhisper: 0
  };


  /* =========================================================
     MEMORY STORAGE
     ========================================================= */

  function saveMemory() {
    try {
      localStorage.setItem(
        "TLR_MEMORY",
        JSON.stringify(P9.memories)
      );
    } catch (e) {}
  }

  function loadMemory() {
    try {
      const data = JSON.parse(
        localStorage.getItem("TLR_MEMORY")
      );

      if (data) {
        Object.assign(P9.memories, data);
      }
    } catch (e) {}
  }

  function remember(key) {
    if (!P9.memories[key]) {
      P9.memories[key] = true;
      P9.memoryLevel++;
      saveMemory();

      memoryMessage(
        "RUMAH INI MENGINGAT."
      );
    }
  }


  /* =========================================================
     UI
     ========================================================= */

  const style = document.createElement("style");

  style.textContent = `
    #tlrMemoryText {
      position:fixed;
      left:50%;
      bottom:18%;
      transform:translateX(-50%);
      z-index:99999;
      color:#ddd;
      font-family:Georgia,serif;
      font-size:15px;
      letter-spacing:2px;
      text-align:center;
      opacity:0;
      pointer-events:none;
      transition:opacity .5s;
      text-shadow:0 0 12px #000;
      max-width:85%;
    }

    #tlrMemoryText.show {
      opacity:1;
    }

    #tlrMirrorOverlay {
      position:fixed;
      inset:0;
      z-index:99990;
      pointer-events:none;
      opacity:0;
      transition:opacity 1s;
      background:
        radial-gradient(
          ellipse at center,
          rgba(255,255,255,.04),
          rgba(0,0,0,.88)
        );
      mix-blend-mode:screen;
    }

    #tlrMirrorOverlay.active {
      opacity:1;
    }

    #tlrChapter3 {
      position:fixed;
      inset:0;
      z-index:100000;
      background:#050505;
      color:#eee;
      display:flex;
      align-items:center;
      justify-content:center;
      text-align:center;
      opacity:0;
      pointer-events:none;
      transition:opacity 1.2s;
    }

    #tlrChapter3.active {
      opacity:1;
      pointer-events:auto;
    }

    .tlr-ch3-title {
      font-family:Georgia,serif;
      font-size:clamp(32px,8vw,72px);
      letter-spacing:8px;
    }

    .tlr-ch3-sub {
      margin-top:20px;
      font-family:Arial,sans-serif;
      font-size:13px;
      letter-spacing:4px;
      opacity:.6;
    }

    #tlrMemoryPanel {
      position:fixed;
      top:20px;
      right:20px;
      z-index:9000;
      padding:10px 13px;
      background:rgba(0,0,0,.65);
      border:1px solid rgba(255,255,255,.12);
      color:#aaa;
      font:11px Arial,sans-serif;
      letter-spacing:2px;
      opacity:.65;
      pointer-events:none;
    }

    .tlr-memory-glitch {
      animation:tlrMemoryGlitch .12s infinite alternate;
    }

    @keyframes tlrMemoryGlitch {
      from {
        transform:translate(0);
        filter:contrast(1);
      }
      to {
        transform:translate(2px,-1px);
        filter:contrast(1.25);
      }
    }
  `;

  document.head.appendChild(style);


  /* =========================================================
     ELEMENTS
     ========================================================= */

  function makeUI() {

    if (!document.getElementById("tlrMemoryText")) {
      const el = document.createElement("div");
      el.id = "tlrMemoryText";
      document.body.appendChild(el);
    }

    if (!document.getElementById("tlrMirrorOverlay")) {
      const el = document.createElement("div");
      el.id = "tlrMirrorOverlay";
      document.body.appendChild(el);
    }

    if (!document.getElementById("tlrChapter3")) {
      const el = document.createElement("div");
      el.id = "tlrChapter3";

      el.innerHTML = `
        <div>
          <div class="tlr-ch3-title">
            CHAPTER III
          </div>

          <div class="tlr-ch3-sub">
            MEMORY DOES NOT FORGET
          </div>
        </div>
      `;

      document.body.appendChild(el);
    }

    if (!document.getElementById("tlrMemoryPanel")) {
      const el = document.createElement("div");
      el.id = "tlrMemoryPanel";
      document.body.appendChild(el);
    }
  }


  /* =========================================================
     MESSAGE
     ========================================================= */

  function memoryMessage(text, duration = 2200) {

    const el = document.getElementById(
      "tlrMemoryText"
    );

    if (!el) return;

    el.textContent = text;
    el.classList.add("show");

    clearTimeout(el._timer);

    el._timer = setTimeout(() => {
      el.classList.remove("show");
    }, duration);
  }


  /* =========================================================
     MEMORY PANEL
     ========================================================= */

  function updateMemoryPanel() {

    const el = document.getElementById(
      "tlrMemoryPanel"
    );

    if (!el) return;

    const remembered =
      Object.values(P9.memories)
        .filter(Boolean)
        .length;

    el.textContent =
      `MEMORY ${remembered}/${Object.keys(P9.memories).length}`;
  }


  /* =========================================================
     TRACK STORY ACTIONS
     ========================================================= */

  function trackMemories() {

    if (typeof story === "undefined") return;

    if (story.photograph)
      remember("inspectedPhoto");

    if (story.radio)
      remember("heardRadio");

    if (story.mirror)
      remember("sawMirror");

    if (story.letter)
      remember("foundLetter");

    if (story.truthFound)
      remember("foundTruth");

    if (story.entityAwake)
      remember("openedFinalDoor");

    if (story.secretSolved)
      remember("enteredSecret");

    if (
      typeof entity !== "undefined" &&
      entity.visible
    ) {
      if (!P9.memories.sawEntity) {
        remember("sawEntity");
      }
    }

    updateMemoryPanel();
  }


  /* =========================================================
     MIRROR WORLD
     ========================================================= */

  function enterMirrorWorld() {

    if (P9.mirrorWorld) return;

    P9.mirrorWorld = true;
    P9.mirrorVisits++;

    const overlay =
      document.getElementById(
        "tlrMirrorOverlay"
      );

    overlay.classList.add("active");

    memoryMessage(
      "PANTULANMU TIDAK BERGERAK.",
      3200
    );

    setTimeout(() => {

      if (
        typeof currentRoom !== "undefined"
      ) {

        memoryMessage(
          "KAMU MASUK KE SISI YANG LAIN.",
          3000
        );

        try {
          document.body.classList.add(
            "tlr-memory-glitch"
          );
        } catch (e) {}
      }

    }, 1200);

    setTimeout(() => {

      overlay.classList.remove("active");

      document.body.classList.remove(
        "tlr-memory-glitch"
      );

      P9.mirrorWorld = false;

    }, 5200);
  }


  /* =========================================================
     MIRROR TRIGGER
     ========================================================= */

  function checkMirror() {

    if (
      typeof story === "undefined" ||
      !story.mirror
    ) return;

    if (
      typeof currentRoom === "undefined" ||
      currentRoom !== "bedroom"
    ) return;

    if (P9.mirrorVisits >= 2) return;

    /*
      Tekan M ketika berada di bedroom
      untuk melihat sisi cermin.
    */
  }


  /* =========================================================
     MEMORY WHISPERS
     ========================================================= */

  function memoryWhisper() {

    if (
      typeof story === "undefined" ||
      !story.mirror
    ) return;

    const now = Date.now();

    if (now - P9.lastWhisper < 12000)
      return;

    if (Math.random() > 0.18)
      return;

    P9.lastWhisper = now;

    const whispers = [
      "KAMU PERNAH DI SINI.",
      "JANGAN ULANGI KESALAHANMU.",
      "KAMU SUDAH PERNAH MEMBUKA PINTU ITU.",
      "RUMAH INI MENGENALMU.",
      "AKU INGAT APA YANG KAMU LAKUKAN.",
      "FOTO ITU BELUM SELESAI.",
      "ADA SATU HAL YANG KAMU LUPAKAN."
    ];

    memoryMessage(
      whispers[
        Math.floor(
          Math.random() * whispers.length
        )
      ],
      2400
    );
  }


  /* =========================================================
     PHOTO MEMORY
     ========================================================= */

  function updatePhotoMemory() {

    if (
      typeof story === "undefined" ||
      !story.photograph
    ) return;

    if (P9.photoVersion >= 3)
      return;

    if (
      P9.memoryLevel >= 3 &&
      P9.photoVersion === 0
    ) {

      P9.photoVersion = 1;

      memoryMessage(
        "ADA SATU ORANG YANG SEHARUSNYA TIDAK ADA DI FOTO.",
        3200
      );
    }

    if (
      P9.memoryLevel >= 5 &&
      P9.photoVersion === 1
    ) {

      P9.photoVersion = 2;

      memoryMessage(
        "POSISINYA BERUBAH.",
        2600
      );
    }

    if (
      P9.memoryLevel >= 7 &&
      P9.photoVersion === 2
    ) {

      P9.photoVersion = 3;

      memoryMessage(
        "SEKARANG DIA MELIHAT KE ARAHMU.",
        3000
      );
    }
  }


  /* =========================================================
     HOUSE MEMORY
     ========================================================= */

  function updateHouseMemory() {

    if (
      typeof story === "undefined"
    ) return;

    if (
      P9.memoryLevel >= 4 &&
      P9.houseShift === 0
    ) {

      P9.houseShift = 1;

      memoryMessage(
        "RUMAHNYA TERASA BERBEDA.",
        2600
      );
    }

    if (
      P9.memoryLevel >= 6 &&
      P9.houseShift === 1
    ) {

      P9.houseShift = 2;

      memoryMessage(
        "ADA RUANGAN YANG TIDAK KAMU INGAT.",
        2800
      );
    }
  }


  /* =========================================================
     CHAPTER III
     ========================================================= */

  function startChapter3() {

    if (P9.chapter3) return;

    if (
      typeof story === "undefined"
    ) return;

    if (
      !story.truthFound ||
      !story.entityAwake ||
      P9.memoryLevel < 6
    ) return;

    P9.chapter3 = true;
    story.chapter3 = true;

    const screen =
      document.getElementById(
        "tlrChapter3"
      );

    screen.classList.add("active");

    memoryMessage(
      "SESUATU DALAM RUMAH ITU MENGINGATMU.",
      3500
    );

    setTimeout(() => {
      screen.classList.remove("active");
    }, 5000);
  }


  /* =========================================================
     SECRET ROOM II
     ========================================================= */

  function unlockSecretRoom2() {

    if (P9.secretRoom2) return;

    if (
      !P9.chapter3 ||
      P9.photoVersion < 3 ||
      P9.mirrorVisits < 2
    ) return;

    P9.secretRoom2 = true;

    story.secretRoom2 = true;

    memoryMessage(
      "KAMU MENEMUKAN RUANGAN YANG SEHARUSNYA TIDAK ADA.",
      4000
    );

    if (
      typeof diary !== "undefined" &&
      Array.isArray(diary)
    ) {
      diary.push(
        "Secret Room II — Ruangan yang muncul setelah rumah mengingat semuanya."
      );
    }
  }


  /* =========================================================
     MEMORY ENDING
     ========================================================= */

  function checkMemoryEnding() {

    if (
      typeof story === "undefined"
    ) return;

    if (
      P9.secretRoom2 &&
      P9.photoVersion >= 3 &&
      P9.mirrorVisits >= 2 &&
      story.truthFound
    ) {

      P9.memoryEndingReady = true;
      story.memoryEndingReady = true;
    }
  }


  function activateMemoryEnding() {

    if (!P9.memoryEndingReady)
      return;

    memoryMessage(
      "KALI INI, RUMAH TIDAK MEMBIARKANMU LUPA.",
      5000
    );

    setTimeout(() => {

      if (
        typeof showScreen === "function"
      ) {
        showScreen("ending");
      }

      const title =
        document.querySelector(
          "#endingScreen h1, #endingScreen .endingTitle"
        );

      if (title) {
        title.textContent =
          "MEMORY — TRUE ENDING";
      }

    }, 4500);
  }


  /* =========================================================
     KEYBOARD
     ========================================================= */

  document.addEventListener(
    "keydown",
    e => {

      const key =
        e.key.toLowerCase();

      /*
        M = mirror
      */

      if (key === "m") {

        if (
          typeof currentRoom !== "undefined" &&
          currentRoom === "bedroom" &&
          story.mirror
        ) {
          enterMirrorWorld();
        }
      }

      /*
        J = secret memory ending
      */

      if (key === "j") {

        if (P9.memoryEndingReady) {
          activateMemoryEnding();
        }
      }
    }
  );


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function initPhase9() {

    if (P9.initialized)
      return;

    P9.initialized = true;

    loadMemory();
    makeUI();
    updateMemoryPanel();

    console.log(
      "%cTHE LAST ROOM — PHASE 9: MEMORY",
      "color:#aaa;font-size:16px;font-weight:bold"
    );
  }


  /* =========================================================
     MAIN MEMORY UPDATE
     ========================================================= */

  setInterval(() => {

    if (
      typeof gameTime === "undefined"
    ) return;

    initPhase9();

    trackMemories();
    memoryWhisper();
    updatePhotoMemory();
    updateHouseMemory();
    startChapter3();
    unlockSecretRoom2();
    checkMemoryEnding();
    checkMirror();

  }, 1500);


})();
/* =========================================================
   PHASE 9 HOTFIX — OVERLAY / TOUCH FIX
   ========================================================= */

(() => {
  const fix = document.createElement("style");

  fix.textContent = `
    /* Phase 9 UI tidak boleh menghalangi tombol game */
    #tlrMemoryText,
    #tlrMirrorOverlay,
    #tlrMemoryPanel {
      pointer-events: none !important;
    }

    /* Chapter 3 hanya menerima input ketika benar-benar aktif */
    #tlrChapter3 {
      pointer-events: none !important;
    }

    #tlrChapter3.active {
      pointer-events: auto !important;
    }
  `;

  document.head.appendChild(fix);


  /* Pastikan semua overlay tersembunyi tidak menangkap sentuhan */
  function releaseInvisibleLayers() {

    const ids = [
      "tlrMemoryText",
      "tlrMirrorOverlay",
      "tlrChapter3",
      "tlrEventText",
      "tlrClockOverlay"
    ];

    ids.forEach(id => {

      const el = document.getElementById(id);

      if (!el) return;

      const style =
        window.getComputedStyle(el);

      const opacity =
        parseFloat(style.opacity);

      if (
        opacity === 0 &&
        !el.classList.contains("active")
      ) {
        el.style.pointerEvents = "none";
      }
    });
  }


  setInterval(
    releaseInvisibleLayers,
    500
  );

})();
