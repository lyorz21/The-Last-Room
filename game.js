/* =========================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 4 — THE HOUSE REMEMBERS

   FULL REPLACEMENT FOR PHASE 3 game.js

   FEATURES:
   - 4 rooms
   - Room transitions
   - Story progression
   - 03:17 puzzle
   - Family photograph clue
   - Radio clue
   - Bedroom puzzle
   - Basement puzzle
   - Keys & inventory
   - Entity roaming
   - Room-specific atmosphere
   - Dynamic horror events
   - Achievement system
   - Multiple ending preparation
   - Secret clue
   - Portrait + landscape compatible
========================================================= */


/* =========================================================
   BASIC DOM
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const screens = {
    cinematic: document.getElementById("cinematicScreen"),
    creator: document.getElementById("creatorScreen"),
    game: document.getElementById("gameScreen"),
    gameover: document.getElementById("gameOverScreen")
};


/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(name) {

    Object.values(screens).forEach(screen => {

        if (screen) {
            screen.classList.remove("active");
        }

    });

    if (screens[name]) {
        screens[name].classList.add("active");
    }
}


/* =========================================================
   GAME STATE
========================================================= */

let playerName = "Unknown";

let currentRoom = "hallway";

let battery = 100;
let flashlight = true;

let gameStarted = false;
let gameOver = false;

let fear = 0;

let totalPlayTime = 0;

let interactionCooldown = 0;

const player = {

    x: 450,
    y: 300,

    speed: 2.5,

    size: 14

};


/* =========================================================
   ROOM DATA
========================================================= */

const rooms = {

    hallway: {

        name: "HALLWAY",

        subtitle: "The corridor that remembers",

        floor: "#252525",

        ambient: 38,

        exits: {

            living: {
                x: 0,
                y: 220,
                width: 45,
                height: 150
            },

            bedroom: {
                x: 400,
                y: 0,
                width: 100,
                height: 40
            },

            basement: {
                x: 730,
                y: 520,
                width: 120,
                height: 45
            }

        }

    },

    living: {

        name: "LIVING ROOM",

        subtitle: "The room where they waited",

        floor: "#292929",

        ambient: 42,

        exits: {

            hallway: {
                x: 850,
                y: 220,
                width: 45,
                height: 150
            }

        }

    },

    bedroom: {

        name: "BEDROOM",

        subtitle: "The room nobody opened",

        floor: "#202020",

        ambient: 31,

        exits: {

            hallway: {
                x: 400,
                y: 550,
                width: 100,
                height: 45
            }

        }

    },

    basement: {

        name: "BASEMENT",

        subtitle: "Below the house",

        floor: "#151515",

        ambient: 25,

        exits: {

            hallway: {
                x: 730,
                y: 0,
                width: 120,
                height: 45
            }

        }

    }

};


/* =========================================================
   STORY FLAGS
========================================================= */

const story = {

    photographFound: false,

    clockInspected: false,

    radioHeard: false,

    radioCodeFound: false,

    bedroomUnlocked: false,

    basementUnlocked: false,

    basementClueFound: false,

    mirrorClueFound: false,

    secretFound: false,

    finalDoorUnlocked: false,

    entityAwakened: false

};


/* =========================================================
   INVENTORY
========================================================= */

let inventory = [];


function addInventory(item) {

    if (inventory.includes(item)) {
        return;
    }

    inventory.push(item);

    renderInventory();

    playTone(
        500,
        0.12,
        0.04,
        "sine"
    );

}


/* =========================================================
   DIARY
========================================================= */

let diary = [];


function addDiary(title, text) {

    diary.push({
        title,
        text
    });

    renderDiary();

}


function renderDiary() {

    const list =
        document.getElementById("diaryList");

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


/* =========================================================
   ACHIEVEMENT SYSTEM
========================================================= */

const achievements = {

    CURIOUS: {
        title: "THE CURIOUS",
        description: "Inspect the old family photograph.",
        unlocked: false
    },

    THREE_SEVENTEEN: {
        title: "03:17",
        description: "Discover the time hidden in the house.",
        unlocked: false
    },

    LISTEN: {
        title: "LISTEN",
        description: "Listen to the mysterious radio.",
        unlocked: false
    },

    THE_ROOM: {
        title: "THE LAST ROOM",
        description: "Enter the forbidden bedroom.",
        unlocked: false
    },

    BELOW: {
        title: "BELOW",
        description: "Descend into the basement.",
        unlocked: false
    },

    WATCHED: {
        title: "I SAW YOU",
        description: "Survive the Entity's appearance.",
        unlocked: false
    },

    SECRET: {
        title: "FORGOTTEN",
        description: "Discover the hidden message.",
        unlocked: false
    }

};


function unlockAchievement(id) {

    const achievement =
        achievements[id];

    if (!achievement) return;

    if (achievement.unlocked) return;

    achievement.unlocked = true;

    showAchievement(
        achievement.title,
        achievement.description
    );

}


/* =========================================================
   ACHIEVEMENT UI
========================================================= */

function createAchievementUI() {

    if (
        document.getElementById(
            "achievementContainer"
        )
    ) {
        return;
    }

    const container =
        document.createElement("div");

    container.id =
        "achievementContainer";

    Object.assign(
        container.style,
        {

            position: "fixed",

            top: "20px",

            right: "20px",

            width: "290px",

            zIndex: "10000",

            pointerEvents: "none"

        }
    );

    document.body.appendChild(
        container
    );

}


function showAchievement(
    title,
    description
) {

    createAchievementUI();

    const container =
        document.getElementById(
            "achievementContainer"
        );

    const card =
        document.createElement("div");

    Object.assign(
        card.style,
        {

            background:
                "rgba(8,8,8,.94)",

            border:
                "1px solid rgba(255,255,255,.18)",

            padding:
                "14px 16px",

            marginBottom:
                "10px",

            borderRadius:
                "6px",

            color:
                "#fff",

            fontFamily:
                "Inter, sans-serif",

            boxShadow:
                "0 10px 30px rgba(0,0,0,.45)",

            transform:
                "translateX(120%)",

            transition:
                "transform .4s ease"

        }
    );

    card.innerHTML = `
        <div style="
            font-size:10px;
            letter-spacing:3px;
            opacity:.55;
            margin-bottom:6px;
        ">
            ACHIEVEMENT UNLOCKED
        </div>

        <div style="
            font-family:Cinzel,serif;
            font-size:17px;
            margin-bottom:5px;
        ">
            ${title}
        </div>

        <div style="
            font-size:12px;
            opacity:.65;
        ">
            ${description}
        </div>
    `;

    container.appendChild(card);

    requestAnimationFrame(() => {

        card.style.transform =
            "translateX(0)";

    });

    playTone(
        660,
        .12,
        .05,
        "sine"
    );

    setTimeout(() => {

        card.style.transform =
            "translateX(120%)";

        setTimeout(() => {
            card.remove();
        }, 500);

    }, 3800);

}


/* =========================================================
   AUDIO ENGINE
========================================================= */

let audioCtx = null;
let masterGain = null;
let ambientGain = null;

function initAudio() {

    if (audioCtx) return;

    audioCtx =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    masterGain =
        audioCtx.createGain();

    masterGain.gain.value =
        0.24;

    masterGain.connect(
        audioCtx.destination
    );

    ambientGain =
        audioCtx.createGain();

    ambientGain.gain.value =
        0.055;

    ambientGain.connect(
        masterGain
    );

    createAmbient();

}


function playTone(
    frequency = 200,
    duration = .2,
    volume = .05,
    type = "sine"
) {

    if (!audioCtx) return;

    const osc =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();

    osc.type =
        type;

    osc.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        volume,
        audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        .001,
        audioCtx.currentTime +
        duration
    );

    osc.connect(gain);

    gain.connect(
        masterGain
    );

    osc.start();

    osc.stop(
        audioCtx.currentTime +
        duration
    );

}


function createAmbient() {

    if (!audioCtx) return;

    const osc =
        audioCtx.createOscillator();

    osc.type =
        "sine";

    osc.frequency.value =
        38;

    osc.connect(
        ambientGain
    );

    osc.start();

}


function roomSound() {

    if (!audioCtx) return;

    const data =
        rooms[currentRoom];

    if (!data) return;

    playTone(
        data.ambient,
        .8,
        .015,
        "sine"
    );

}


/* =========================================================
   FOOTSTEPS
========================================================= */

let lastFootstep = 0;

function footstep() {

    const now =
        performance.now();

    if (
        now - lastFootstep <
        290
    ) {
        return;
    }

    lastFootstep =
        now;

    let frequency = 90;

    if (
        currentRoom ===
        "basement"
    ) {
        frequency = 60;
    }

    if (
        currentRoom ===
        "bedroom"
    ) {
        frequency = 72;
    }

    playTone(
        frequency,
        .07,
        .035,
        "triangle"
    );

}


/* =========================================================
   ENTITY
========================================================= */

const entity = {

    x: 100,

    y: 100,

    room: "hallway",

    visible: false,

    state: "hidden",

    timer: 0,

    aggression: 0,

    distance: 999

};


const ENTITY_STATES = {

    HIDDEN:
        "hidden",

    WATCHING:
        "watching",

    NEAR:
        "near",

    ATTACK:
        "attack"

};


/* =========================================================
   ENTITY AUDIO
========================================================= */

function entityWhisper() {

    if (!audioCtx) return;

    playTone(
        150,
        .8,
        .04,
        "sawtooth"
    );

    setTimeout(() => {

        playTone(
            75,
            .6,
            .025,
            "triangle"
        );

    }, 300);

}


function entityBreathing() {

    playTone(
        55,
        .55,
        .045,
        "sawtooth"
    );

    setTimeout(() => {

        playTone(
            48,
            .6,
            .04,
            "sawtooth"
        );

    }, 650);

}


/* =========================================================
   ENTITY SPAWN
========================================================= */

function spawnEntity() {

    const margin = 70;

    entity.room =
        currentRoom;

    entity.x =
        margin +
        Math.random() *
        (
            canvas.width -
            margin * 2
        );

    entity.y =
        margin +
        Math.random() *
        (
            canvas.height -
            margin * 2
        );

    entity.visible =
        true;

    entity.state =
        ENTITY_STATES.WATCHING;

    entity.timer =
        0;

    story.entityAwakened =
        true;

    unlockAchievement(
        "WATCHED"
    );

    storyMessage(
        "Aku tidak sendirian."
    );

    entityWhisper();

}


/* =========================================================
   ENTITY UPDATE
========================================================= */

function updateEntity() {

    if (
        !gameStarted ||
        gameOver
    ) {
        return;
    }

    if (
        entity.room !==
        currentRoom
    ) {

        entity.visible =
            false;

        return;

    }

    entity.timer++;

    const dx =
        player.x -
        entity.x;

    const dy =
        player.y -
        entity.y;

    entity.distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    /* HIDDEN */

    if (
        entity.state ===
        ENTITY_STATES.HIDDEN
    ) {

        if (
            entity.timer >
            900 +
            Math.random() * 900
        ) {

            entity.timer =
                0;

            spawnEntity();

        }

    }


    /* WATCHING */

    else if (
        entity.state ===
        ENTITY_STATES.WATCHING
    ) {

        addFear(
            .008
        );

        if (
            entity.timer %
            190 ===
            0
        ) {

            entityWhisper();

        }

        if (
            entity.distance <
            250
        ) {

            entity.state =
                ENTITY_STATES.NEAR;

            entity.timer =
                0;

        }

    }


    /* NEAR */

    else if (
        entity.state ===
        ENTITY_STATES.NEAR
    ) {

        addFear(
            .025
        );

        entity.aggression +=
            .012;

        const distance =
            entity.distance;

        if (
            distance > 0
        ) {

            const speed =
                .12 +
                entity.aggression *
                .012;

            entity.x +=
                (
                    dx /
                    distance
                ) *
                speed;

            entity.y +=
                (
                    dy /
                    distance
                ) *
                speed;

        }

        if (
            entity.timer %
            160 ===
            0
        ) {

            entityBreathing();

        }

        if (
            entity.distance <
            100
        ) {

            entity.state =
                ENTITY_STATES.ATTACK;

        }

    }


    /* ATTACK */

    else if (
        entity.state ===
        ENTITY_STATES.ATTACK
    ) {

        triggerJumpscare();

    }

}


/* =========================================================
   ENTITY DRAW
========================================================= */

function drawEntity() {

    if (
        !entity.visible ||
        entity.room !==
        currentRoom
    ) {
        return;
    }

    ctx.save();

    const alpha =
        entity.state ===
        ENTITY_STATES.WATCHING
            ? .25
            : .5;

    ctx.globalAlpha =
        alpha;

    const gradient =
        ctx.createRadialGradient(
            entity.x,
            entity.y,
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
        .55,
        "rgba(0,0,0,.5)"
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
        48,
        105,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* HEAD */

    ctx.fillStyle =
        "#050505";

    ctx.beginPath();

    ctx.arc(
        entity.x,
        entity.y - 72,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* EYES */

    ctx.fillStyle =
        "rgba(220,220,220,.7)";

    ctx.fillRect(
        entity.x - 13,
        entity.y - 78,
        6,
        3
    );

    ctx.fillRect(
        entity.x + 7,
        entity.y - 78,
        6,
        3
    );

    ctx.restore();

}


/* =========================================================
   JUMPSCARE
========================================================= */

let jumpscareActive =
    false;


function createHorrorOverlay() {

    if (
        document.getElementById(
            "phase4HorrorOverlay"
        )
    ) {
        return;
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "phase4HorrorOverlay";

    Object.assign(
        overlay.style,
        {

            position:
                "fixed",

            inset:
                "0",

            background:
                "rgba(0,0,0,0)",

            pointerEvents:
                "none",

            zIndex:
                "9998",

            transition:
                "background .15s"

        }
    );

    document.body.appendChild(
        overlay
    );


    const style =
        document.createElement(
            "style"
        );

    style.textContent = `

        @keyframes phase4Shake {

            0% {
                transform:translate(0,0);
            }

            20% {
                transform:translate(-7px,4px);
            }

            40% {
                transform:translate(6px,-5px);
            }

            60% {
                transform:translate(-4px,-3px);
            }

            80% {
                transform:translate(5px,4px);
            }

            100% {
                transform:translate(0,0);
            }

        }

        .phase4-shake {

            animation:
                phase4Shake
                .08s
                infinite;

        }

    `;

    document.head.appendChild(
        style
    );

}


function triggerJumpscare() {

    if (
        jumpscareActive
    ) {
        return;
    }

    jumpscareActive =
        true;

    createHorrorOverlay();

    const overlay =
        document.getElementById(
            "phase4HorrorOverlay"
        );

    if (overlay) {

        overlay.style.background =
            "rgba(255,255,255,.12)";

    }

    document.body.classList.add(
        "phase4-shake"
    );

    playTone(
        55,
        .8,
        .14,
        "sawtooth"
    );

    setTimeout(() => {

        if (overlay) {

            overlay.style.background =
                "rgba(0,0,0,.85)";

        }

        storyMessage(
            "Ia berdiri tepat di depanku."
        );

    }, 180);

    setTimeout(() => {

        if (overlay) {

            overlay.style.background =
                "rgba(0,0,0,0)";

        }

        document.body.classList.remove(
            "phase4-shake"
        );

        entity.visible =
            false;

        entity.state =
            ENTITY_STATES.HIDDEN;

        entity.timer =
            0;

        entity.aggression =
            0;

        jumpscareActive =
            false;

        reduceFear(
            25
        );

        storyMessage(
            "Sosok itu menghilang."
        );

    }, 1200);

}


/* =========================================================
   FEAR SYSTEM
========================================================= */

function addFear(amount) {

    fear += amount;

    fear =
        Math.max(
            0,
            Math.min(
                100,
                fear
            )
        );

}


function reduceFear(amount) {

    fear -= amount;

    fear =
        Math.max(
            0,
            fear
        );

}


/* =========================================================
   ROOM TRANSITION
========================================================= */

function enterRoom(
    roomName
) {

    if (
        !rooms[roomName]
    ) {
        return;
    }

    currentRoom =
        roomName;

    player.x =
        canvas.width / 2;

    player.y =
        canvas.height / 2;

    entity.visible =
        false;

    entity.state =
        ENTITY_STATES.HIDDEN;

    entity.timer =
        0;

    roomSound();

    updateRoomUI();

    checkRoomStory();

}


function updateRoomUI() {

    const roomName =
        document.getElementById(
            "chapter"
        );

    if (roomName) {

        roomName.textContent =
            rooms[
                currentRoom
            ].name;

    }

}


function checkRoomStory() {

    if (
        currentRoom ===
        "living" &&
        !story.radioHeard
    ) {

        updateObjective(
            "Cari sumber suara radio."
        );

    }

    if (
        currentRoom ===
        "bedroom" &&
        !story.mirrorClueFound
    ) {

        updateObjective(
            "Periksa kamar yang selama ini dikunci."
        );

    }

    if (
        currentRoom ===
        "basement" &&
        !story.basementClueFound
    ) {

        updateObjective(
            "Cari tahu apa yang disembunyikan di bawah rumah."
        );

    }

}


/* =========================================================
   ROOM EXITS
========================================================= */

function checkRoomExits() {

    if (!gameStarted) return;

    const width =
        canvas.width;

    const height =
        canvas.height;


    /* HALLWAY */

    if (
        currentRoom ===
        "hallway"
    ) {

        if (
            player.x < 30
        ) {

            enterRoom(
                "living"
            );

            return;

        }


        if (
            player.y < 30 &&
            player.x > 370 &&
            player.x < 530
        ) {

            if (
                story.bedroomUnlocked
            ) {

                enterRoom(
                    "bedroom"
                );

            }
            else {

                storyMessage(
                    "Pintu kamar masih terkunci."
                );

                player.y =
                    55;

            }

            return;

        }


        if (
            player.y >
                height - 30 &&
            player.x >
                700
        ) {

            if (
                story.basementUnlocked
            ) {

                enterRoom(
                    "basement"
                );

            }
            else {

                storyMessage(
                    "Aku belum tahu cara membukanya."
                );

                player.y =
                    height - 55;

            }

            return;

        }

    }


    /* LIVING ROOM */

    if (
        currentRoom ===
        "living"
    ) {

        if (
            player.x >
            width - 30
        ) {

            enterRoom(
                "hallway"
            );

        }

    }


    /* BEDROOM */

    if (
        currentRoom ===
        "bedroom"
    ) {

        if (
            player.y >
            height - 30
        ) {

            enterRoom(
                "hallway"
            );

        }

    }


    /* BASEMENT */

    if (
        currentRoom ===
        "basement"
    ) {

        if (
            player.y <
            30
        ) {

            enterRoom(
                "hallway"
            );

        }

    }

}


/* =========================================================
   WORLD DRAW
========================================================= */

function drawWorld() {

    if (!canvas) return;

    const room =
        rooms[
            currentRoom
        ];

    ctx.fillStyle =
        "#070707";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* FLOOR */

    ctx.fillStyle =
        room.floor;

    ctx.fillRect(
        30,
        30,
        canvas.width - 60,
        canvas.height - 60
    );


    drawFloorDetails();

    drawRoomObjects();

    drawExits();

    drawEntity();

    drawPlayer();

    drawLighting();

    drawFearOverlay();

}


/* =========================================================
   FLOOR DETAILS
========================================================= */

function drawFloorDetails() {

    ctx.strokeStyle =
        "rgba(255,255,255,.025)";

    ctx.lineWidth =
        1;


    const step =
        currentRoom ===
        "basement"
            ? 30
            : 45;


    for (
        let x = 30;
        x <
        canvas.width - 30;
        x += step
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
        y <
        canvas.height - 30;
        y += step
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

}


/* =========================================================
   EXITS DRAW
========================================================= */

function drawExits() {

    ctx.fillStyle =
        "rgba(0,0,0,.5)";


    if (
        currentRoom ===
        "hallway"
    ) {

        ctx.fillRect(
            0,
            220,
            45,
            150
        );

        ctx.fillRect(
            400,
            30,
            100,
            15
        );

        ctx.fillRect(
            730,
            canvas.height - 45,
            120,
            15
        );

    }


    if (
        currentRoom ===
        "living"
    ) {

        ctx.fillRect(
            canvas.width - 45,
            220,
            45,
            150
        );

    }


    if (
        currentRoom ===
        "bedroom"
    ) {

        ctx.fillRect(
            400,
            canvas.height - 45,
            100,
            15
        );

    }


    if (
        currentRoom ===
        "basement"
    ) {

        ctx.fillRect(
            730,
            30,
            120,
            15
        );

    }

}


/* =========================================================
   ROOM OBJECTS
========================================================= */

function drawRoomObjects() {

    /* HALLWAY */

    if (
        currentRoom ===
        "hallway"
    ) {

        drawTable();

        drawPhoto();

        drawClock();

        drawBedroomDoor();

        drawBasementDoor();

    }


    /* LIVING */

    if (
        currentRoom ===
        "living"
    ) {

        drawSofa();

        drawRadio();

        drawFamilyPainting();

    }


    /* BEDROOM */

    if (
        currentRoom ===
        "bedroom"
    ) {

        drawBed();

        drawMirror();

        drawDiaryBox();

    }


    /* BASEMENT */

    if (
        currentRoom ===
        "basement"
    ) {

        drawBasementShelf();

        drawOldBox();

        drawFinalDoor();

    }

}


/* =========================================================
   HALLWAY OBJECTS
========================================================= */

function drawTable() {

    ctx.fillStyle =
        "#34271f";

    ctx.fillRect(
        100,
        125,
        130,
        65
    );

}


function drawPhoto() {

    ctx.fillStyle =
        "#bda477";

    ctx.fillRect(
        140,
        140,
        55,
        38
    );

}


function drawClock() {

    ctx.strokeStyle =
        "#aaa";

    ctx.lineWidth =
        2;

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
        683,
        124
    );

}


function drawBedroomDoor() {

    ctx.fillStyle =
        story.bedroomUnlocked
            ? "#4b3027"
            : "#1b1513";

    ctx.fillRect(
        400,
        30,
        100,
        15
    );

}


function drawBasementDoor() {

    ctx.fillStyle =
        story.basementUnlocked
            ? "#4b4034"
            : "#161616";

    ctx.fillRect(
        730,
        canvas.height - 45,
        120,
        15
    );

}


/* =========================================================
   LIVING ROOM OBJECTS
========================================================= */

function drawSofa() {

    ctx.fillStyle =
        "#392c29";

    ctx.fillRect(
        130,
        360,
        260,
        80
    );

    ctx.fillStyle =
        "#463634";

    ctx.fillRect(
        150,
        335,
        70,
        50
    );

    ctx.fillRect(
        300,
        335,
        70,
        50
    );

}


function drawRadio() {

    ctx.fillStyle =
        "#151515";

    ctx.fillRect(
        580,
        160,
        110,
        65
    );

    ctx.fillStyle =
        "#777";

    ctx.fillRect(
        595,
        175,
        75,
        25
    );

    ctx.fillStyle =
        "#333";

    ctx.beginPath();

    ctx.arc(
        605,
        212,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


function drawFamilyPainting() {

    ctx.strokeStyle =
        "#70513d";

    ctx.lineWidth =
        8;

    ctx.strokeRect(
        290,
        80,
        150,
        130
    );

    ctx.fillStyle =
        "rgba(255,255,255,.025)";

    ctx.fillRect(
        295,
        85,
        140,
        120
    );

}


/* =========================================================
   BEDROOM OBJECTS
========================================================= */

function drawBed() {

    ctx.fillStyle =
        "#40383a";

    ctx.fillRect(
        120,
        150,
        250,
        130
    );

    ctx.fillStyle =
        "#554c4e";

    ctx.fillRect(
        135,
        165,
        220,
        90
    );

}


function drawMirror() {

    ctx.strokeStyle =
        "#6e665e";

    ctx.lineWidth =
        6;

    ctx.strokeRect(
        620,
        90,
        100,
        180
    );

    ctx.fillStyle =
        "rgba(150,160,170,.08)";

    ctx.fillRect(
        625,
        95,
        90,
        170
    );

}


function drawDiaryBox() {

    ctx.fillStyle =
        "#3a2921";

    ctx.fillRect(
        560,
        380,
        120,
        70
    );

}


/* =========================================================
   BASEMENT OBJECTS
========================================================= */

function drawBasementShelf() {

    ctx.fillStyle =
        "#302820";

    ctx.fillRect(
        100,
        120,
        260,
        25
    );

    ctx.fillRect(
        100,
        220,
        260,
        25
    );

    ctx.fillRect(
        100,
        320,
        260,
        25
    );

}


function drawOldBox() {

    ctx.fillStyle =
        "#51402e";

    ctx.fillRect(
        500,
        330,
        140,
        90
    );

}


function drawFinalDoor() {

    ctx.fillStyle =
        story.finalDoorUnlocked
            ? "#554338"
            : "#171717";

    ctx.fillRect(
        700,
        100,
        100,
        170
    );

}


/* =========================================================
   PLAYER
========================================================= */

function drawPlayer() {

    ctx.save();

    ctx.fillStyle =
        "rgba(0,0,0,.5)";

    ctx.beginPath();

    ctx.ellipse(
        player.x,
        player.y + 11,
        15,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#ddd";

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


/* =========================================================
   LIGHTING
========================================================= */

function drawLighting() {

    if (!flashlight) {

        ctx.fillStyle =
            "rgba(0,0,0,.95)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return;

    }


    const radius =
        currentRoom ===
        "basement"
            ? 190
            : 250;


    const gradient =
        ctx.createRadialGradient(
            player.x,
            player.y,
            15,
            player.x,
            player.y,
            radius
        );


    gradient.addColorStop(
        0,
        "rgba(255,245,210,.38)"
    );

    gradient.addColorStop(
        .25,
        "rgba(255,245,210,.16)"
    );

    gradient.addColorStop(
        .65,
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


/* =========================================================
   FEAR VISUAL
========================================================= */

function drawFearOverlay() {

    if (
        fear <
        30
    ) {
        return;
    }

    const alpha =
        (
            fear - 30
        ) /
        500;

    ctx.fillStyle =
        `rgba(0,0,0,${alpha})`;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


/* =========================================================
   MOVEMENT
========================================================= */

const keys = {};


window.addEventListener(
    "keydown",
    event => {

        keys[
            event.key.toLowerCase()
        ] = true;


        if (
            event.key.toLowerCase()
            ===
            "e"
        ) {

            interact();

        }


        if (
            event.key.toLowerCase()
            ===
            "f"
        ) {

            toggleFlashlight();

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


function updatePlayer() {

    if (
        !gameStarted ||
        gameOver
    ) {
        return;
    }

    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy--;
    }


    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy++;
    }


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx--;
    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx++;
    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        dx /=
            length;

        dy /=
            length;


        player.x +=
            dx *
            player.speed;

        player.y +=
            dy *
            player.speed;


        footstep();

    }


    const margin =
        18;


    player.x =
        Math.max(
            margin,
            Math.min(
                canvas.width -
                margin,
                player.x
            )
        );


    player.y =
        Math.max(
            margin,
            Math.min(
                canvas.height -
                margin,
                player.y
            )
        );


    checkRoomExits();

}


/* =========================================================
   MOBILE CONTROLS
========================================================= */

function holdButton(
    id,
    key
) {

    const button =
        document.getElementById(id);

    if (!button) {
        return;
    }


    button.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            keys[key] =
                true;

        },
        {
            passive:false
        }
    );


    button.addEventListener(
        "touchend",
        event => {

            event.preventDefault();

            keys[key] =
                false;

        },
        {
            passive:false
        }
    );


    button.addEventListener(
        "touchcancel",
        () => {

            keys[key] =
                false;

        }
    );

}


holdButton(
    "upBtn",
    "arrowup"
);

holdButton(
    "downBtn",
    "arrowdown"
);

holdButton(
    "leftBtn",
    "arrowleft"
);

holdButton(
    "rightBtn",
    "arrowright"
);


/* =========================================================
   FLASHLIGHT
========================================================= */

function toggleFlashlight() {

    if (
        battery <= 0
    ) {

        flashlight =
            false;

        storyMessage(
            "Baterainya habis."
        );

        return;

    }


    flashlight =
        !flashlight;


    playTone(
        flashlight
            ? 180
            : 80,
        .12,
        .04
    );

}


const flashlightButton =
    document.getElementById(
        "flashlightBtn"
    );


if (
    flashlightButton
) {

    flashlightButton.onclick =
        toggleFlashlight;

}


/* =========================================================
   BATTERY
========================================================= */

function updateBattery() {

    if (
        !flashlight ||
        !gameStarted ||
        gameOver
    ) {
        return;
    }


    battery -=
        currentRoom ===
        "basement"
            ? .012
            : .008;


    if (
        battery <= 0
    ) {

        battery =
            0;

        flashlight =
            false;

        storyMessage(
            "Senterku mati."
        );

        addFear(
            12
        );

    }


    const batteryEl =
        document.getElementById(
            "battery"
        );


    if (
        batteryEl
    ) {

        batteryEl.textContent =
            Math.floor(
                battery
            ) +
            "%";

    }

}


/* =========================================================
   INTERACTION
========================================================= */

function interact() {

    if (
        !gameStarted ||
        gameOver
    ) {
        return;
    }


    if (
        interactionCooldown >
        0
    ) {
        return;
    }


    interactionCooldown =
        20;


    const x =
        player.x;

    const y =
        player.y;


    /* =====================================================
       HALLWAY
    ===================================================== */

    if (
        currentRoom ===
        "hallway"
    ) {

        /* PHOTO */

        if (
            distance(
                x,
                y,
                168,
                158
            ) <
            75
        ) {

            inspectPhoto();

            return;

        }


        /* CLOCK */

        if (
            distance(
                x,
                y,
                700,
                120
            ) <
            75
        ) {

            inspectClock();

            return;

        }


        /* BEDROOM */

        if (
            x >
            370 &&
            x <
            530 &&
            y <
            80
        ) {

            interactBedroomDoor();

            return;

        }


        /* BASEMENT */

        if (
            x >
            700 &&
            y >
            canvas.height -
            100
        ) {

            interactBasementDoor();

            return;

        }

    }


    /* =====================================================
       LIVING ROOM
    ===================================================== */

    if (
        currentRoom ===
        "living"
    ) {

        if (
            distance(
                x,
                y,
                635,
                190
            ) <
            100
        ) {

            interactRadio();

            return;

        }


        if (
            distance(
                x,
                y,
                365,
                145
            ) <
            120
        ) {

            inspectPainting();

            return;

        }

    }


    /* =====================================================
       BEDROOM
    ===================================================== */

    if (
        currentRoom ===
        "bedroom"
    ) {

        if (
            distance(
                x,
                y,
                670,
                180
            ) <
            100
        ) {

            inspectMirror();

            return;

        }


        if (
            distance(
                x,
                y,
                620,
                415
            ) <
            100
        ) {

            inspectDiaryBox();

            return;

        }

    }


    /* =====================================================
       BASEMENT
    ===================================================== */

    if (
        currentRoom ===
        "basement"
    ) {

        if (
            distance(
                x,
                y,
                570,
                375
            ) <
            110
        ) {

            inspectOldBox();

            return;

        }


        if (
            x >
            690 &&
            y >
            80 &&
            y <
            300
        ) {

            interactFinalDoor();

            return;

        }

    }

}


/* =========================================================
   PHOTO PUZZLE
========================================================= */

function inspectPhoto() {

    if (
        !story.photographFound
    ) {

        story.photographFound =
            true;

        addInventory(
            "Old Family Photograph"
        );

        addDiary(
            "THE PHOTOGRAPH",
            "Empat orang berdiri di depan rumah. Namun ada satu sosok di belakang mereka. Wajahnya sengaja dicoret."
        );

        unlockAchievement(
            "CURIOUS"
        );

        storyMessage(
            "Ada sesuatu yang aneh di foto ini."
        );

        updateObjective(
            "Periksa jam tua yang berhenti pada pukul 03:17."
        );

        addFear(
            5
        );

        return;

    }


    inspect(
        "FOTO KELUARGA",
        "Di balik foto tertulis: 'Ia datang setiap pukul 03:17.'"
    );

}


/* =========================================================
   CLOCK PUZZLE
========================================================= */

function inspectClock() {

    if (
        !story.clockInspected
    ) {

        story.clockInspected =
            true;

        addInventory(
            "Clock Note"
        );

        addDiary(
            "03:17",
            "Jam tua itu berhenti pada pukul 03:17. Waktu yang sama tertulis samar di balik foto keluarga."
        );

        unlockAchievement(
            "THREE_SEVENTEEN"
        );

        updateObjective(
            "Cari radio tua di ruang tamu."
        );

        storyMessage(
            "03:17... lagi."
        );

        addFear(
            5
        );

        return;

    }


    inspect(
        "JAM TUA",
        "Jarumnya tetap diam di 03:17. Seolah waktu di rumah ini berhenti malam itu."
    );

}


/* =========================================================
   LIVING ROOM RADIO
========================================================= */

function interactRadio() {

    if (
        !story.clockInspected
    ) {

        storyMessage(
            "Radio itu tidak menyala."
        );

        return;

    }


    if (
        !story.radioHeard
    ) {

        story.radioHeard =
            true;

        unlockAchievement(
            "LISTEN"
        );

        addDiary(
            "THE RADIO",
            "Radio tua itu tiba-tiba menyala. Suara seorang perempuan menyebut tiga angka: 0... 3... 1... 7."
        );

        playRadioSequence();

        updateObjective(
            "Gunakan kode 0317 pada sesuatu yang tersembunyi."
        );

        addFear(
            10
        );

        return;

    }


    inspect(
        "RADIO",
        "Sekarang hanya terdengar suara statis."
    );

}


function playRadioSequence() {

    playTone(
        110,
        .25,
        .06,
        "sawtooth"
    );

    setTimeout(() => {

        playTone(
            90,
            .25,
            .05,
            "sawtooth"
        );

    }, 500);

    setTimeout(() => {

        entityWhisper();

        storyMessage(
            "0... 3... 1... 7..."
        );

    }, 1100);

}


/* =========================================================
   PAINTING
========================================================= */

function inspectPainting() {

    if (
        !story.radioCodeFound
    ) {

        if (
            story.radioHeard
        ) {

            story.radioCodeFound =
                true;

            addInventory(
                "Code 0317"
            );

            inspect(
                "LUKISAN KELUARGA",
                "Di balik bingkai terdapat empat angka kecil: 0317."
            );

            updateObjective(
                "Cari sesuatu yang bisa dibuka dengan kode 0317."
            );

            return;

        }

    }


    inspect(
        "LUKISAN",
        "Mata pada lukisan terasa seperti mengikuti gerakanku."
    );

}


/* =========================================================
   BEDROOM DOOR
========================================================= */

function interactBedroomDoor() {

    if (
        story.bedroomUnlocked
    ) {

        enterRoom(
            "bedroom"
        );

        return;

    }


    if (
        story.radioCodeFound
    ) {

        story.bedroomUnlocked =
            true;

        addInventory(
            "Bedroom Key"
        );

        unlockAchievement(
            "THE_ROOM"
        );

        storyMessage(
            "Kunci itu cocok."
        );

        updateObjective(
            "Masuk ke kamar paling ujung."
        );

        return;

    }


    playTone(
        55,
        .4,
        .06,
        "sawtooth"
    );

    storyMessage(
        "Pintunya terkunci."
    );

    setTimeout(() => {

        storyMessage(
            "Dari dalam terdengar ketukan."
        );

    }, 700);

    addFear(
        8
    );

}


/* =========================================================
   BEDROOM MIRROR
========================================================= */

function inspectMirror() {

    if (
        !story.mirrorClueFound
    ) {

        story.mirrorClueFound =
            true;

        addDiary(
            "THE MIRROR",
            "Pantulan di cermin tidak mengikuti gerakanku selama beberapa detik."
        );

        inspect(
            "CERMIN",
            "Tulisan muncul di permukaan kaca: 'Turunlah ke bawah sebelum dia bangun.'"
        );

        updateObjective(
            "Cari jalan menuju basement."
        );

        addFear(
            12
        );

        return;

    }


    inspect(
        "CERMIN",
        "Sekarang cermin hanya memantulkan diriku."
    );

}


/* =========================================================
   BEDROOM DIARY BOX
========================================================= */

function inspectDiaryBox() {

    if (
        story.mirrorClueFound &&
        !story.basementUnlocked
    ) {

        story.basementUnlocked =
            true;

        addInventory(
            "Basement Key"
        );

        addDiary(
            "THE LAST ENTRY",
            "Jika kau membaca ini, berarti pintu kamar sudah terbuka. Jangan biarkan dia mengetahui bahwa kau menemukan jalan ke basement."
        );

        updateObjective(
            "Buka pintu basement."
        );

        storyMessage(
            "Sebuah kunci jatuh dari kotak."
        );

        return;

    }


    inspect(
        "KOTAK TUA",
        "Tidak ada apa-apa lagi di dalamnya."
    );

}


/* =========================================================
   BASEMENT DOOR
========================================================= */

function interactBasementDoor() {

    if (
        story.basementUnlocked
    ) {

        enterRoom(
            "basement"
        );

        unlockAchievement(
            "BELOW"
        );

        updateObjective(
            "Temukan rahasia terakhir rumah ini."
        );

        return;

    }


    storyMessage(
        "Aku belum menemukan kuncinya."
    );

}


/* =========================================================
   BASEMENT BOX
========================================================= */

function inspectOldBox() {

    if (
        !story.basementClueFound
    ) {

        story.basementClueFound =
            true;

        addInventory(
            "Old Letter"
        );

        addDiary(
            "THE OLD LETTER",
            "Surat itu menjelaskan bahwa seseorang mencoba mengunci Entity di rumah ini. Namun segelnya tidak pernah selesai."
        );

        updateObjective(
            "Temukan pintu terakhir di basement."
        );

        storyMessage(
            "Jadi selama ini... mereka mencoba mengurungnya."
        );

        addFear(
            15
        );

        return;

    }


    inspect(
        "KOTAK TUA",
        "Kotak itu kosong."
    );

}


/* =========================================================
   FINAL DOOR
========================================================= */

function interactFinalDoor() {

    if (
        !story.basementClueFound
    ) {

        storyMessage(
            "Aku belum tahu apa yang ada di balik pintu."
        );

        return;

    }


    if (
        !story.secretFound
    ) {

        story.secretFound =
            true;

        unlockAchievement(
            "SECRET"
        );

        addDiary(
            "THE TRUTH",
            "Di balik pintu ada tulisan: 'Rumah ini tidak pernah dihantui. Rumah ini adalah penjaranya.'"
        );

        inspect(
            "PESAN TERAKHIR",
            "Rumah ini bukan tempat tinggal Entity. Rumah ini adalah tempat ia dikurung."
        );

        updateObjective(
            "Temukan cara keluar sebelum Entity bangun sepenuhnya."
        );

        storyMessage(
            "Selama ini aku salah..."
        );

        entity.aggression +=
            3;

        return;

    }


    unlockFinalEnding();

}


/* =========================================================
   MULTIPLE ENDING PREPARATION
========================================================= */

function unlockFinalEnding() {

    story.finalDoorUnlocked =
        true;

    addInventory(
        "House Key"
    );

    updateObjective(
        "Cari jalan keluar dari rumah."
    );

    storyMessage(
        "Aku menemukan kunci rumah."
    );

    setTimeout(() => {

        storyMessage(
            "Tapi Entity juga sudah bangun."
        );

        entity.room =
            currentRoom;

        entity.x =
            canvas.width / 2;

        entity.y =
            100;

        entity.visible =
            true;

        entity.state =
            ENTITY_STATES.NEAR;

        entity.timer =
            0;

    }, 1800);

}


/* =========================================================
   GENERIC INSPECT PANEL
========================================================= */

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


    if (titleEl) {

        titleEl.textContent =
            title;

    }


    if (textEl) {

        textEl.textContent =
            text;

    }


    overlay.classList.add(
        "active"
    );

}


const closeInspect =
    document.getElementById(
        "closeInspect"
    );


if (
    closeInspect
) {

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


/* =========================================================
   STORY MESSAGE
========================================================= */

let messageTimer;


function storyMessage(
    text
) {

    const element =
        document.getElementById(
            "storyMessage"
        );

    if (!element) return;


    element.textContent =
        text;

    element.classList.add(
        "show"
    );


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(() => {

            element.classList.remove(
                "show"
            );

        }, 2800);

}


/* =========================================================
   OBJECTIVE
========================================================= */

function updateObjective(
    text
) {

    const element =
        document.getElementById(
            "objective"
        );

    if (
        element
    ) {

        element.textContent =
            text;

    }

}


/* =========================================================
   INVENTORY RENDER
========================================================= */

function renderInventory() {

    const list =
        document.getElementById(
            "inventoryList"
        );

    if (!list) return;


    list.innerHTML = "";


    inventory.forEach(item => {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            "◆ " +
            item;

        list.appendChild(
            div
        );

    });

}


/* =========================================================
   INVENTORY BUTTON
========================================================= */

const inventoryButton =
    document.getElementById(
        "inventoryButton"
    );


if (
    inventoryButton
) {

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


/* =========================================================
   DIARY BUTTON
========================================================= */

const diaryButton =
    document.getElementById(
        "diaryButton"
    );


if (
    diaryButton
) {

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


/* =========================================================
   RANDOM HORROR EVENTS
========================================================= */

let horrorCooldown =
    0;


function randomHorrorEvents() {

    if (
        !gameStarted ||
        gameOver
    ) {
        return;
    }


    if (
        horrorCooldown >
        0
    ) {

        horrorCooldown--;

        return;

    }


    const chance =
        Math.random();


    if (
        chance <
        .0018
    ) {

        horrorCooldown =
            850;

        eventWhisper();

    }

    else if (
        chance <
        .003
    ) {

        horrorCooldown =
            900;

        eventLight();

    }

    else if (
        chance <
        .004
    ) {

        horrorCooldown =
            1000;

        eventKnock();

    }

}


/* =========================================================
   HORROR EVENTS
========================================================= */

function eventWhisper() {

    entityWhisper();

    addFear(
        5
    );

    storyMessage(
        "Ada suara berbisik di dekat telingaku."
    );

}


function eventLight() {

    if (
        !flashlight
    ) {
        return;
    }


    flashlight =
        false;


    setTimeout(() => {

        flashlight =
            true;

    }, 240);


    addFear(
        8
    );


    storyMessage(
        "Cahaya senterku berkedip."
    );

}


function eventKnock() {

    playTone(
        45,
        .3,
        .07,
        "sawtooth"
    );


    setTimeout(() => {

        playTone(
            42,
            .3,
            .06,
            "sawtooth"
        );

    }, 450);


    addFear(
        7
    );


    storyMessage(
        "Tok... tok... tok..."
    );

}


/* =========================================================
   GAME START
========================================================= */

function startGame() {

    showScreen(
        "game"
    );


    gameStarted =
        true;

    gameOver =
        false;


    currentRoom =
        "hallway";


    player.x =
        canvas.width /
        2;

    player.y =
        canvas.height /
        2;


    battery =
        100;

    flashlight =
        true;

    fear =
        0;


    inventory =
        [];

    diary =
        [];


    Object.keys(story)
        .forEach(key => {

            story[key] =
                false;

        });


    entity.visible =
        false;

    entity.state =
        ENTITY_STATES.HIDDEN;

    entity.timer =
        0;

    entity.aggression =
        0;


    addDiary(
        "FIRST NIGHT",
        "Aku akhirnya kembali ke rumah lama keluargaku. Entah kenapa rasanya rumah ini masih menungguku."
    );


    updateObjective(
        "Cari tahu apa yang terjadi di rumah ini."
    );


    storyMessage(
        `Selamat datang kembali, ${playerName}.`
    );


    roomSound();

}


/* =========================================================
   CHARACTER CREATOR
========================================================= */

const startGameButton =
    document.getElementById(
        "startGame"
    );


if (
    startGameButton
) {

    startGameButton.onclick =
        () => {

            const input =
                document.getElementById(
                    "playerName"
                );


            playerName =
                input?.value.trim() ||
                "Unknown";


            initAudio();


            if (
                audioCtx &&
                audioCtx.state ===
                "suspended"
            ) {

                audioCtx.resume();

            }


            startGame();

        };

}


/* =========================================================
   CHARACTER PREVIEW
========================================================= */

function updateCharacterPreview() {

    const skin =
        document.getElementById(
            "skinColor"
        )?.value ||
        "#c98b68";


    const hair =
        document.getElementById(
            "hairColor"
        )?.value ||
        "#171717";


    const outfit =
        document.getElementById(
            "outfitColor"
        )?.value ||
        "#202020";


    const skinPart =
        document.querySelector(
            ".preview-skin"
        );


    const hairPart =
        document.querySelector(
            ".preview-hair"
        );


    const outfitPart =
        document.querySelector(
            ".preview-outfit"
        );


    if (
        skinPart
    ) {

        skinPart.style.background =
            skin;

    }


    if (
        hairPart
    ) {

        hairPart.style.background =
            hair;

    }


    if (
        outfitPart
    ) {

        outfitPart.style.background =
            outfit;

    }

}


[
    "skinColor",
    "hairColor",
    "outfitColor"
]
.forEach(id => {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.addEventListener(
            "input",
            updateCharacterPreview
        );

    }

});


updateCharacterPreview();


/* =========================================================
   CINEMATIC
========================================================= */

const cinematicText =
    document.getElementById(
        "cinematicText"
    );


const chapterLabel =
    document.getElementById(
        "chapterLabel"
    );


const skipButton =
    document.getElementById(
        "skipCinematic"
    );


const cinematicScenes = [

    {
        chapter:
            "CHAPTER I",

        text:
            "23:41 PM."
    },

    {
        chapter:
            "THE RETURN",

        text:
            "Hujan turun ketika aku kembali ke rumah lama keluargaku."
    },

    {
        chapter:
            "THE HOUSE",

        text:
            "Tidak ada yang tinggal di sini sejak malam itu."
    },

    {
        chapter:
            "THE WARNING",

        text:
            "Jangan masuk ke kamar paling ujung."
    },

    {
        chapter:
            "THE HOUSE REMEMBERS",

        text:
            "Lalu aku mendengar langkah kaki dari lantai atas."
    }

];


let cinematicIndex =
    0;


function playCinematic() {

    if (
        !cinematicText ||
        !chapterLabel
    ) {

        startCreator();

        return;

    }


    showScreen(
        "cinematic"
    );


    cinematicIndex =
        0;


    showCinematicScene();

}


function showCinematicScene() {

    if (
        cinematicIndex >=
        cinematicScenes.length
    ) {

        startCreator();

        return;

    }


    const scene =
        cinematicScenes[
            cinematicIndex
        ];


    chapterLabel.textContent =
        scene.chapter;


    cinematicText.textContent =
        scene.text;


    cinematicText.style.opacity =
        "0";


    setTimeout(() => {

        cinematicText.style.opacity =
            "1";

    }, 100);


    playTone(
        60,
        .5,
        .03
    );


    cinematicIndex++;


    setTimeout(
        showCinematicScene,
        2600
    );

}


function startCreator() {

    showScreen(
        "creator"
    );

}


if (
    skipButton
) {

    skipButton.onclick =
        startCreator;

}


/* =========================================================
   CANVAS RESIZE
========================================================= */

function resizeCanvas() {

    if (!canvas) return;


    canvas.width =
        canvas.clientWidth ||
        900;


    canvas.height =
        canvas.clientHeight ||
        600;

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


/* =========================================================
   INTERACT MOBILE
========================================================= */

const interactButton =
    document.getElementById(
        "interactBtn"
    );


if (
    interactButton
) {

    interactButton.onclick =
        interact;

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (
        !gameStarted
    ) {
        return;
    }


    if (
        interactionCooldown >
        0
    ) {

        interactionCooldown--;

    }


    updatePlayer();

    updateBattery();

    updateEntity();

    randomHorrorEvents();

}


/* =========================================================
   RENDER
========================================================= */

function render() {

    if (
        !gameStarted
    ) {
        return;
    }


    drawWorld();

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    update();

    render();

    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INIT
========================================================= */

createHorrorOverlay();

createAchievementUI();

renderInventory();

renderDiary();

showScreen(
    "cinematic"
);


setTimeout(() => {

    playCinematic();

}, 500);


gameLoop();


/* =========================================================
   END PHASE 4
========================================================= */
