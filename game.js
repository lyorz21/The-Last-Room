/* =========================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 3 — THE ENTITY
   Replace your Phase 2 game.js with this file.
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
    gameover: document.getElementById("gameOverScreen")
};

function showScreen(name) {
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove("active");
    });

    if (screens[name]) {
        screens[name].classList.add("active");
    }
}

/* =========================
   GAME STATE
========================= */

let playerName = "Unknown";
let room = "hallway";

let battery = 100;
let flashlight = true;

let inventory = [];
let diary = [];

let cluesFound = 0;
let storyStage = 0;

let photoTaken = false;
let bedroomUnlocked = false;
let basementUnlocked = false;

let gameStarted = false;
let gameOver = false;

const player = {
    x: 420,
    y: 300,
    speed: 2.4,
    size: 15
};

/* =========================
   ENTITY SYSTEM
========================= */

const ENTITY_STATES = {
    HIDDEN: "hidden",
    WATCHING: "watching",
    NEAR: "near",
    ATTACK: "attack"
};

let entity = {
    x: 760,
    y: 130,

    state: ENTITY_STATES.HIDDEN,

    visible: false,
    timer: 0,

    appearTimer: 0,
    disappearTimer: 0,

    distance: 999,

    aggression: 0,

    lastEvent: 0
};

/* =========================
   FEAR SYSTEM
========================= */

let fear = 0;
let maxFear = 100;

function addFear(amount) {
    fear += amount;
    fear = Math.max(0, Math.min(maxFear, fear));

    updateFearVisuals();
}

function reduceFear(amount) {
    fear -= amount;
    fear = Math.max(0, fear);

    updateFearVisuals();
}

function updateFearVisuals() {

    const intensity = fear / maxFear;

    canvas.style.filter =
        `brightness(${1 - intensity * 0.22})
         contrast(${1 + intensity * 0.15})
         saturate(${1 - intensity * 0.25})`;

    if (intensity > 0.55) {
        document.body.classList.add("fear-mode");
    } else {
        document.body.classList.remove("fear-mode");
    }
}

/* =========================
   AUDIO ENGINE
========================= */

let audioCtx = null;
let masterGain = null;
let ambientGain = null;

function initAudio() {

    if (audioCtx) return;

    audioCtx = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.25;

    masterGain.connect(audioCtx.destination);

    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0.06;

    ambientGain.connect(masterGain);

    createAmbientDrone();
}

function tone(
    frequency = 300,
    duration = 0.15,
    volume = 0.1,
    type = "sine"
) {

    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(
        volume,
        audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

/* =========================
   AMBIENT DRONE
========================= */

function createAmbientDrone() {

    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();

    osc.type = "sine";
    osc.frequency.value = 39;

    osc.connect(ambientGain);

    osc.start();

    setInterval(() => {

        if (!audioCtx) return;

        osc.frequency.setTargetAtTime(
            35 + Math.random() * 10,
            audioCtx.currentTime,
            2
        );

    }, 4000);
}

/* =========================
   FOOTSTEPS
========================= */

let lastStep = 0;

function footstep() {

    const now = performance.now();

    if (now - lastStep < 280) return;

    lastStep = now;

    const frequencies = [
        90,
        100,
        75,
        110
    ];

    tone(
        frequencies[
            Math.floor(Math.random() * frequencies.length)
        ],
        0.07,
        0.035,
        "triangle"
    );
}

/* =========================
   ENTITY SOUND
========================= */

function entityWhisper() {

    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";

    osc.frequency.setValueAtTime(
        180,
        audioCtx.currentTime
    );

    osc.frequency.exponentialRampToValueAtTime(
        70,
        audioCtx.currentTime + 0.8
    );

    gain.gain.setValueAtTime(
        0.0001,
        audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.08,
        audioCtx.currentTime + 0.2
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 1
    );

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 1);
}

function entityBreathing() {

    tone(58, 0.5, 0.05, "sawtooth");

    setTimeout(() => {
        tone(48, 0.6, 0.04, "sawtooth");
    }, 600);
}

/* =========================
   DOOR SOUND
========================= */

function doorSound() {

    tone(70, 0.3, 0.08, "sawtooth");

    setTimeout(() => {
        tone(42, 0.5, 0.05, "triangle");
    }, 120);
}

/* =========================
   JUMPSCARE SOUND
========================= */

function jumpscareSound() {

    if (!audioCtx) return;

    tone(80, 0.7, 0.15, "sawtooth");

    setTimeout(() => {
        tone(220, 0.3, 0.12, "square");
    }, 90);

    setTimeout(() => {
        tone(45, 1, 0.18, "sawtooth");
    }, 160);
}

/* =========================
   DYNAMIC ENTITY UI
========================= */

function createEntityOverlay() {

    if (document.getElementById("entityOverlay")) return;

    const overlay = document.createElement("div");

    overlay.id = "entityOverlay";

    overlay.innerHTML = `
        <div id="entitySilhouette"></div>
        <div id="entityEyes"></div>
    `;

    Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        zIndex: "9999",
        opacity: "0",
        transition: "opacity .2s"
    });

    document.body.appendChild(overlay);

    const style = document.createElement("style");

    style.innerHTML = `
        #entitySilhouette {
            position:absolute;
            left:50%;
            top:48%;
            transform:translate(-50%,-50%);
            width:90px;
            height:230px;
            background:
                radial-gradient(
                    ellipse at center,
                    rgba(0,0,0,.95) 0%,
                    rgba(0,0,0,.75) 45%,
                    transparent 72%
                );
            filter:blur(5px);
            opacity:.9;
        }

        #entityEyes {
            position:absolute;
            left:50%;
            top:39%;
            transform:translateX(-50%);
            width:30px;
            height:6px;
            background:rgba(230,230,230,.75);
            border-radius:50%;
            box-shadow:
                -35px 0 8px rgba(255,255,255,.05),
                 35px 0 8px rgba(255,255,255,.05);
            opacity:.7;
        }

        .entity-visible #entityOverlay {
            opacity:1;
        }

        .jumpscare {
            animation:
                screenShake .08s infinite,
                flashScreen .35s;
        }

        @keyframes screenShake {
            0% { transform:translate(0,0); }
            25% { transform:translate(-5px,3px); }
            50% { transform:translate(5px,-3px); }
            75% { transform:translate(-3px,-4px); }
            100% { transform:translate(0,0); }
        }

        @keyframes flashScreen {
            0% { filter:brightness(1); }
            20% { filter:brightness(3); }
            100% { filter:brightness(.5); }
        }

        .fear-mode {
            animation: fearPulse 1.5s infinite;
        }

        @keyframes fearPulse {
            0%,100% { transform:scale(1); }
            50% { transform:scale(1.002); }
        }
    `;

    document.head.appendChild(style);
}

createEntityOverlay();

/* =========================
   CINEMATIC
========================= */

const cinematicText =
    document.getElementById("cinematicText");

const chapterLabel =
    document.getElementById("chapterLabel");

const skipButton =
    document.getElementById("skipCinematic");

const cinematicScenes = [
    {
        chapter: "CHAPTER I",
        text: "23:41 PM."
    },
    {
        chapter: "THE RETURN",
        text: "Hujan turun ketika aku kembali ke rumah lama keluargaku."
    },
    {
        chapter: "THE HOUSE",
        text: "Tidak ada yang tinggal di sini sejak malam itu."
    },
    {
        chapter: "THE WARNING",
        text: "Jangan masuk ke kamar paling ujung."
    },
    {
        chapter: "THE HOUSE REMEMBERS",
        text: "Lalu aku mendengar langkah kaki dari lantai atas."
    }
];

let cinematicIndex = 0;

function playCinematic() {

    if (!cinematicText || !chapterLabel) {
        startGame();
        return;
    }

    showScreen("cinematic");

    cinematicIndex = 0;

    showCinematicScene();
}

function showCinematicScene() {

    if (cinematicIndex >= cinematicScenes.length) {
        startCreator();
        return;
    }

    const scene =
        cinematicScenes[cinematicIndex];

    chapterLabel.textContent =
        scene.chapter;

    cinematicText.textContent =
        scene.text;

    cinematicText.style.opacity = "0";

    setTimeout(() => {
        cinematicText.style.opacity = "1";
    }, 100);

    tone(60, 0.5, 0.03);

    cinematicIndex++;

    setTimeout(
        showCinematicScene,
        2600
    );
}

if (skipButton) {
    skipButton.onclick = () => {
        startCreator();
    };
}

/* =========================
   CHARACTER CREATOR
========================= */

function startCreator() {

    showScreen("creator");

}

const startGameButton =
    document.getElementById("startGame");

if (startGameButton) {

    startGameButton.onclick = () => {

        const nameInput =
            document.getElementById("playerName");

        playerName =
            nameInput?.value.trim() ||
            "Unknown";

        initAudio();

        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        startGame();
    };
}

/* =========================
   CHARACTER VISUAL
========================= */

function updateCharacterPreview() {

    const skin =
        document.getElementById("skinColor")?.value ||
        "#c98b68";

    const hair =
        document.getElementById("hairColor")?.value ||
        "#171717";

    const outfit =
        document.getElementById("outfitColor")?.value ||
        "#202020";

    const skinPart =
        document.querySelector(".preview-skin");

    const hairPart =
        document.querySelector(".preview-hair");

    const outfitPart =
        document.querySelector(".preview-outfit");

    if (skinPart) {
        skinPart.style.background = skin;
    }

    if (hairPart) {
        hairPart.style.background = hair;
    }

    if (outfitPart) {
        outfitPart.style.background = outfit;
    }
}

[
    "skinColor",
    "hairColor",
    "outfitColor"
].forEach(id => {

    const el =
        document.getElementById(id);

    if (el) {
        el.addEventListener(
            "input",
            updateCharacterPreview
        );
    }

});

updateCharacterPreview();

/* =========================
   GAME START
========================= */

function startGame() {

    showScreen("game");

    gameStarted = true;
    gameOver = false;

    player.x = 420;
    player.y = 300;

    room = "hallway";

    battery = 100;

    flashlight = true;

    fear = 0;

    entity.state =
        ENTITY_STATES.HIDDEN;

    entity.visible = false;

    entity.aggression = 0;

    updateObjective(
        "Cari tahu apa yang terjadi di rumah ini."
    );

    addDiary(
        "FIRST NIGHT",
        "Aku akhirnya kembali ke rumah lama keluarga. Aku tidak tahu kenapa, tapi rasanya rumah ini masih menungguku."
    );

    storyMessage(
        `Selamat datang kembali, ${playerName}.`
    );

    setTimeout(() => {
        storyMessage(
            "Ada sesuatu yang terasa salah."
        );
    }, 3000);
}

/* =========================
   CANVAS
========================= */

function resizeCanvas() {

    canvas.width =
        canvas.clientWidth || 900;

    canvas.height =
        canvas.clientHeight || 600;
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();

/* =========================
   INPUT
========================= */

const keys = {};

window.addEventListener(
    "keydown",
    e => {

        keys[e.key.toLowerCase()] = true;

        if (
            e.key.toLowerCase() === "e"
        ) {
            interact();
        }

        if (
            e.key.toLowerCase() === "f"
        ) {
            toggleFlashlight();
        }

    }
);

window.addEventListener(
    "keyup",
    e => {

        keys[e.key.toLowerCase()] = false;

    }
);

/* =========================
   MOBILE CONTROLS
========================= */

function holdButton(
    id,
    key
) {

    const button =
        document.getElementById(id);

    if (!button) return;

    button.addEventListener(
        "touchstart",
        e => {
            e.preventDefault();
            keys[key] = true;
        },
        { passive:false }
    );

    button.addEventListener(
        "touchend",
        e => {
            e.preventDefault();
            keys[key] = false;
        },
        { passive:false }
    );

    button.addEventListener(
        "touchcancel",
        () => {
            keys[key] = false;
        }
    );
}

holdButton("upBtn", "arrowup");
holdButton("downBtn", "arrowdown");
holdButton("leftBtn", "arrowleft");
holdButton("rightBtn", "arrowright");

const flashlightBtn =
    document.getElementById("flashlightBtn");

if (flashlightBtn) {

    flashlightBtn.onclick =
        toggleFlashlight;
}

const interactBtn =
    document.getElementById("interactBtn");

if (interactBtn) {

    interactBtn.onclick =
        interact;
}

/* =========================
   MOVEMENT
========================= */

function updatePlayer() {

    if (!gameStarted || gameOver) return;

    let dx = 0;
    let dy = 0;

    if (
        keys["w"] ||
        keys["arrowup"]
    ) dy -= 1;

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) dy += 1;

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) dx -= 1;

    if (
        keys["d"] ||
        keys["arrowright"]
    ) dx += 1;

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        dx /= length;
        dy /= length;

        player.x +=
            dx * player.speed;

        player.y +=
            dy * player.speed;

        footstep();

        addFear(0.01);
    }

    player.x =
        Math.max(
            20,
            Math.min(
                canvas.width - 20,
                player.x
            )
        );

    player.y =
        Math.max(
            20,
            Math.min(
                canvas.height - 20,
                player.y
            )
        );
}

/* =========================
   FLASHLIGHT
========================= */

function toggleFlashlight() {

    if (battery <= 0) {

        flashlight = false;

        storyMessage(
            "Senterku kehabisan baterai."
        );

        tone(
            45,
            0.25,
            0.05
        );

        return;
    }

    flashlight =
        !flashlight;

    tone(
        flashlight ? 180 : 90,
        0.12,
        0.04
    );
}

/* =========================
   BATTERY
========================= */

function updateBattery() {

    if (
        !flashlight ||
        !gameStarted ||
        gameOver
    ) return;

    battery -= 0.008;

    if (battery <= 0) {

        battery = 0;

        flashlight = false;

        storyMessage(
            "Senterku mati..."
        );

        addFear(15);
    }

    const batteryText =
        document.getElementById("battery");

    if (batteryText) {

        batteryText.textContent =
            Math.floor(battery) + "%";
    }
}

/* =========================
   ENTITY AI
========================= */

function distanceToPlayer() {

    const dx =
        entity.x -
        player.x;

    const dy =
        entity.y -
        player.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}

function updateEntity() {

    if (
        !gameStarted ||
        gameOver
    ) return;

    entity.distance =
        distanceToPlayer();

    entity.timer += 1;

    /* -------------------------
       HIDDEN
    ------------------------- */

    if (
        entity.state ===
        ENTITY_STATES.HIDDEN
    ) {

        if (
            entity.timer >
            700 + Math.random() * 700
        ) {

            entity.timer = 0;

            entity.state =
                ENTITY_STATES.WATCHING;

            spawnEntityFarAway();
        }

    }

    /* -------------------------
       WATCHING
    ------------------------- */

    else if (
        entity.state ===
        ENTITY_STATES.WATCHING
    ) {

        entity.visible = true;

        addFear(0.015);

        if (
            entity.timer % 180 === 0
        ) {

            entityWhisper();
        }

        if (
            entity.timer >
            350 + Math.random() * 300
        ) {

            entity.timer = 0;

            entity.state =
                ENTITY_STATES.NEAR;

            moveEntityCloser();

            entityWhisper();
        }

    }

    /* -------------------------
       NEAR
    ------------------------- */

    else if (
        entity.state ===
        ENTITY_STATES.NEAR
    ) {

        entity.visible = true;

        addFear(0.04);

        entity.aggression += 0.02;

        moveEntityCloser();

        if (
            entity.timer % 140 === 0
        ) {

            entityBreathing();
        }

        if (
            entity.distance < 150
        ) {

            entity.state =
                ENTITY_STATES.ATTACK;

        }

    }

    /* -------------------------
       ATTACK
    ------------------------- */

    else if (
        entity.state ===
        ENTITY_STATES.ATTACK
    ) {

        triggerJumpscare();

    }

}

/* =========================
   ENTITY POSITIONING
========================= */

function spawnEntityFarAway() {

    const positions = [

        {
            x: 80,
            y: 80
        },

        {
            x: canvas.width - 80,
            y: 80
        },

        {
            x: 80,
            y: canvas.height - 100
        },

        {
            x: canvas.width - 80,
            y: canvas.height - 100
        }

    ];

    let pos =
        positions[
            Math.floor(
                Math.random() *
                positions.length
            )
        ];

    entity.x = pos.x;
    entity.y = pos.y;

    entity.visible = true;

    storyMessage(
        "Aku merasa sedang diawasi..."
    );
}

function moveEntityCloser() {

    const dx =
        player.x -
        entity.x;

    const dy =
        player.y -
        entity.y;

    const dist =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (dist <= 0) return;

    const speed =
        0.18 +
        entity.aggression * 0.015;

    entity.x +=
        (dx / dist) *
        speed;

    entity.y +=
        (dy / dist) *
        speed;
}

/* =========================
   ENTITY RENDER
========================= */

function drawEntity() {

    if (!entity.visible) return;

    const alpha =
        entity.state ===
        ENTITY_STATES.WATCHING
            ? 0.28
            : 0.55;

    ctx.save();

    ctx.globalAlpha =
        alpha;

    const gradient =
        ctx.createRadialGradient(
            entity.x,
            entity.y - 35,
            10,
            entity.x,
            entity.y,
            100
        );

    gradient.addColorStop(
        0,
        "rgba(0,0,0,.9)"
    );

    gradient.addColorStop(
        0.5,
        "rgba(0,0,0,.55)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle =
        gradient;

    ctx.beginPath();

    ctx.ellipse(
        entity.x,
        entity.y,
        50,
        110,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* HEAD */

    ctx.fillStyle =
        "rgba(5,5,5,.95)";

    ctx.beginPath();

    ctx.arc(
        entity.x,
        entity.y - 75,
        27,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* EYES */

    ctx.fillStyle =
        "rgba(220,220,220,.65)";

    ctx.fillRect(
        entity.x - 14,
        entity.y - 80,
        7,
        3
    );

    ctx.fillRect(
        entity.x + 7,
        entity.y - 80,
        7,
        3
    );

    ctx.restore();
}

/* =========================
   ENTITY VISUAL EFFECT
========================= */

function updateEntityOverlay() {

    const overlay =
        document.getElementById(
            "entityOverlay"
        );

    if (!overlay) return;

    if (entity.visible) {

        overlay.style.opacity =
            entity.state ===
            ENTITY_STATES.NEAR
                ? "0.25"
                : "0.1";

    } else {

        overlay.style.opacity = "0";
    }
}

/* =========================
   JUMPSCARE
========================= */

let jumpscareTriggered = false;

function triggerJumpscare() {

    if (jumpscareTriggered) return;

    jumpscareTriggered = true;

    entity.visible = true;

    jumpscareSound();

    document.body.classList.add(
        "jumpscare"
    );

    const overlay =
        document.getElementById(
            "entityOverlay"
        );

    if (overlay) {

        overlay.style.opacity = "1";

        const silhouette =
            document.getElementById(
                "entitySilhouette"
            );

        if (silhouette) {

            silhouette.style.transform =
                "translate(-50%,-50%) scale(1.8)";

        }
    }

    addFear(40);

    storyMessage(
        "JANGAN MENATAPNYA."
    );

    setTimeout(() => {

        document.body.classList.remove(
            "jumpscare"
        );

        if (overlay) {
            overlay.style.opacity = "0";
        }

        entity.visible = false;

        entity.state =
            ENTITY_STATES.HIDDEN;

        entity.timer = 0;

        entity.aggression = 0;

        jumpscareTriggered = false;

        reduceFear(25);

        storyMessage(
            "Ia menghilang."
        );

    }, 1100);
}

/* =========================
   RANDOM HORROR EVENTS
========================= */

let horrorCooldown = 0;

function randomHorrorEvents() {

    if (
        !gameStarted ||
        gameOver
    ) return;

    if (horrorCooldown > 0) {

        horrorCooldown--;

        return;
    }

    const chance =
        Math.random();

    if (chance < 0.0025) {

        horrorCooldown =
            700;

        eventDoorSlams();

    }

    else if (chance < 0.004) {

        horrorCooldown =
            900;

        eventWhisper();

    }

    else if (chance < 0.005) {

        horrorCooldown =
            1100;

        eventFlashlight();

    }

}

/* =========================
   HORROR EVENTS
========================= */

function eventDoorSlams() {

    doorSound();

    addFear(8);

    storyMessage(
        "BRAK!"
    );

    setTimeout(() => {

        storyMessage(
            "Suara pintu dibanting dari lantai atas."
        );

    }, 500);
}

function eventWhisper() {

    entityWhisper();

    addFear(6);

    storyMessage(
        "Seseorang berbisik tepat di belakangku..."
    );
}

function eventFlashlight() {

    if (!flashlight) return;

    flashlight = false;

    setTimeout(() => {

        flashlight = true;

    }, 250);

    addFear(10);

    storyMessage(
        "Senterku berkedip."
    );
}

/* =========================
   WORLD
========================= */

function drawWorld() {

    ctx.fillStyle =
        "#080808";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /* FLOOR */

    ctx.fillStyle =
        room === "basement"
            ? "#141414"
            : "#252525";

    ctx.fillRect(
        30,
        30,
        canvas.width - 60,
        canvas.height - 60
    );

    /* FLOOR LINES */

    ctx.strokeStyle =
        "rgba(255,255,255,.025)";

    for (
        let x = 30;
        x < canvas.width;
        x += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            30
        );

        ctx.lineTo(
            x,
            canvas.height - 30
        );

        ctx.stroke();
    }

    for (
        let y = 30;
        y < canvas.height;
        y += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(
            30,
            y
        );

        ctx.lineTo(
            canvas.width - 30,
            y
        );

        ctx.stroke();
    }

    drawRoomObjects();

    drawEntity();

    drawPlayer();

    drawLighting();

}

/* =========================
   ROOM OBJECTS
========================= */

function drawRoomObjects() {

    /* TABLE */

    ctx.fillStyle =
        "#30251f";

    ctx.fillRect(
        110,
        130,
        120,
        65
    );

    /* FAMILY PHOTO */

    ctx.fillStyle =
        "#bba47a";

    ctx.fillRect(
        145,
        145,
        50,
        35
    );

    /* CLOCK */

    ctx.strokeStyle =
        "#b8b8b8";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        700,
        120,
        32,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.fillStyle =
        "#aaa";

    ctx.font =
        "12px serif";

    ctx.fillText(
        "03:17",
        684,
        124
    );

    /* BEDROOM DOOR */

    ctx.fillStyle =
        bedroomUnlocked
            ? "#4a3026"
            : "#241a17";

    ctx.fillRect(
        350,
        30,
        95,
        20
    );

    /* BASEMENT DOOR */

    ctx.fillStyle =
        basementUnlocked
            ? "#45392f"
            : "#191919";

    ctx.fillRect(
        560,
        canvas.height - 50,
        120,
        20
    );

}

/* =========================
   PLAYER
========================= */

function drawPlayer() {

    ctx.save();

    /* shadow */

    ctx.fillStyle =
        "rgba(0,0,0,.45)";

    ctx.beginPath();

    ctx.ellipse(
        player.x,
        player.y + 12,
        15,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* body */

    ctx.fillStyle =
        "#d8d8d8";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.size,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}

/* =========================
   FLASHLIGHT EFFECT
========================= */

function drawLighting() {

    if (!flashlight) {

        ctx.fillStyle =
            "rgba(0,0,0,.93)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return;
    }

    const gradient =
        ctx.createRadialGradient(
            player.x,
            player.y,
            20,
            player.x,
            player.y,
            240
        );

    gradient.addColorStop(
        0,
        "rgba(255,245,210,.38)"
    );

    gradient.addColorStop(
        0.25,
        "rgba(255,245,210,.16)"
    );

    gradient.addColorStop(
        0.65,
        "rgba(0,0,0,.55)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,.95)"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

/* =========================
   INTERACTION
========================= */

function interact() {

    if (!gameStarted || gameOver) return;

    const px =
        player.x;

    const py =
        player.y;

    /* PHOTO */

    if (
        distance(
            px,
            py,
            170,
            160
        ) < 70
    ) {

        if (!photoTaken) {

            photoTaken = true;

            addInventory(
                "Old Family Photograph"
            );

            addDiary(
                "THE PHOTOGRAPH",
                "Ada empat orang di dalam foto. Tapi ada seseorang berdiri di belakang mereka. Wajahnya dicoret."
            );

            cluesFound++;

            updateObjective(
                "Periksa jam tua yang berhenti pada pukul 03:17."
            );

            inspect(
                "FOTO KELUARGA",
                "Di balik foto tertulis: 'Jangan biarkan dia masuk lagi.'"
            );

            addFear(4);

            return;
        }
    }

    /* CLOCK */

    if (
        distance(
            px,
            py,
            700,
            120
        ) < 80
    ) {

        addDiary(
            "03:17",
            "Jam tua itu berhenti tepat pada pukul 03:17."
        );

        updateObjective(
            "Cari kamar yang tidak pernah dibuka lagi."
        );

        inspect(
            "JAM TUA",
            "Jarumnya berhenti di 03:17. Ada goresan kecil di bawah angka tersebut."
        );

        addFear(6);

        return;
    }

    /* BEDROOM */

    if (
        px > 330 &&
        px < 470 &&
        py < 80
    ) {

        if (!bedroomUnlocked) {

            doorSound();

            storyMessage(
                "Pintunya terkunci."
            );

            setTimeout(() => {

                storyMessage(
                    "Sesuatu bergerak di baliknya."
                );

            }, 800);

            addFear(10);

            return;

        }

    }

    /* BASEMENT */

    if (
        px > 540 &&
        px < 700 &&
        py > canvas.height - 90
    ) {

        if (!basementUnlocked) {

            doorSound();

            storyMessage(
                "Pintu basement tidak bisa dibuka."
            );

            setTimeout(() => {

                storyMessage(
                    "Dari balik pintu terdengar suara sesuatu jatuh."
                );

            }, 700);

            addFear(12);

            return;
        }
    }

}

/* =========================
   DISTANCE
========================= */

function distance(
    x1,
    y1,
    x2,
    y2
) {

    const dx =
        x1 - x2;

    const dy =
        y1 - y2;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}

/* =========================
   INVENTORY
========================= */

function addInventory(item) {

    if (
        inventory.includes(item)
    ) return;

    inventory.push(item);

    renderInventory();

    tone(
        440,
        0.12,
        0.04
    );
}

function renderInventory() {

    const list =
        document.getElementById(
            "inventoryList"
        );

    if (!list) return;

    list.innerHTML = "";

    inventory.forEach(item => {

        const div =
            document.createElement("div");

        div.textContent =
            "◆ " + item;

        list.appendChild(div);

    });
}

/* =========================
   DIARY
========================= */

function addDiary(
    title,
    text
) {

    diary.push({
        title,
        text
    });

    renderDiary();
}

function renderDiary() {

    const list =
        document.getElementById(
            "diaryList"
        );

    if (!list) return;

    list.innerHTML = "";

    diary.forEach(entry => {

        const article =
            document.createElement("article");

        article.innerHTML = `
            <h3>${entry.title}</h3>
            <p>${entry.text}</p>
        `;

        list.appendChild(article);

    });
}

/* =========================
   INSPECT
========================= */

function inspect(
    title,
    text
) {

    const overlay =
        document.getElementById(
            "inspectOverlay"
        );

    const titleEl =
        document.getElementById(
            "inspectTitle"
        );

    const textEl =
        document.getElementById(
            "inspectText"
        );

    if (!overlay) return;

    if (titleEl)
        titleEl.textContent =
            title;

    if (textEl)
        textEl.textContent =
            text;

    overlay.classList.add("active");
}

const closeInspect =
    document.getElementById(
        "closeInspect"
    );

if (closeInspect) {

    closeInspect.onclick =
        () => {

            document
                .getElementById(
                    "inspectOverlay"
                )
                ?.classList.remove(
                    "active"
                );

        };
}

/* =========================
   STORY MESSAGE
========================= */

let messageTimer;

function storyMessage(text) {

    const el =
        document.getElementById(
            "storyMessage"
        );

    if (!el) return;

    el.textContent = text;

    el.classList.add("show");

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            el.classList.remove(
                "show"
            );

        }, 2800);
}

/* =========================
   OBJECTIVE
========================= */

function updateObjective(text) {

    const el =
        document.getElementById(
            "objective"
        );

    if (el) {

        el.textContent =
            text;
    }
}

/* =========================
   PANEL BUTTONS
========================= */

const inventoryButton =
    document.getElementById(
        "inventoryButton"
    );

if (inventoryButton) {

    inventoryButton.onclick =
        () => {

            document
                .getElementById(
                    "inventoryOverlay"
                )
                ?.classList.toggle(
                    "active"
                );

        };
}

const diaryButton =
    document.getElementById(
        "diaryButton"
    );

if (diaryButton) {

    diaryButton.onclick =
        () => {

            document
                .getElementById(
                    "diaryOverlay"
                )
                ?.classList.toggle(
                    "active"
                );

        };
}

/* =========================
   GAME OVER
========================= */

function endGame() {

    gameOver = true;

    showScreen("gameover");

    tone(
        45,
        1.5,
        0.15,
        "sawtooth"
    );
}

/* =========================
   GAME LOOP
========================= */

function update() {

    if (!gameStarted) return;

    updatePlayer();

    updateBattery();

    updateEntity();

    randomHorrorEvents();

    updateEntityOverlay();
}

function render() {

    if (!gameStarted) return;

    drawWorld();
}

function gameLoop() {

    update();

    render();

    requestAnimationFrame(
        gameLoop
    );
}

/* =========================
   INITIALIZE
========================= */

renderInventory();
renderDiary();

showScreen("cinematic");

setTimeout(() => {

    playCinematic();

}, 500);

gameLoop();

/* =========================================================
   END PHASE 3
========================================================= */
