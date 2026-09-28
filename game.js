/* =========================================================
   THE LAST ROOM — FORGOTTEN
   PHASE 5 — REALISTIC HOUSE
   FULL game.js REPLACEMENT
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas?.getContext("2d");

const screens = {
    cinematic: document.getElementById("cinematicScreen"),
    creator: document.getElementById("creatorScreen"),
    game: document.getElementById("gameScreen"),
    gameover: document.getElementById("gameOverScreen")
};

/* =========================================================
   GAME
========================================================= */

let gameStarted = false;
let gameOver = false;

let playerName = "Unknown";
let currentRoom = "hallway";

let battery = 100;
let flashlight = true;

let fear = 0;
let gameTime = 0;

let inventory = [];
let diary = [];

const keys = {};

const player = {
    x: 450,
    y: 300,
    speed: 2.5,
    size: 13
};

/* =========================================================
   STORY
========================================================= */

const story = {

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

    escaped: false

};

/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    hallway: {
        name: "HALLWAY",
        floor: "#302b27",
        wall: "#171513",
        light: .42,
        ambience: "wood"
    },

    living: {
        name: "LIVING ROOM",
        floor: "#34302d",
        wall: "#191716",
        light: .48,
        ambience: "oldroom"
    },

    bedroom: {
        name: "BEDROOM",
        floor: "#282628",
        wall: "#121112",
        light: .27,
        ambience: "silent"
    },

    basement: {
        name: "BASEMENT",
        floor: "#171716",
        wall: "#0c0c0b",
        light: .12,
        ambience: "basement"
    }

};

/* =========================================================
   AUDIO
========================================================= */

let audioCtx = null;
let masterGain = null;

function initAudio() {

    if (audioCtx) return;

    audioCtx = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

    masterGain =
        audioCtx.createGain();

    masterGain.gain.value = .22;

    masterGain.connect(
        audioCtx.destination
    );

    startHouseHum();
}

function sound(
    freq = 200,
    duration = .2,
    volume = .04,
    type = "sine"
) {

    if (!audioCtx) return;

    const osc =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();

    osc.type = type;

    osc.frequency.value =
        freq;

    gain.gain.setValueAtTime(
        volume,
        audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        .001,
        audioCtx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();

    osc.stop(
        audioCtx.currentTime +
        duration
    );
}

function startHouseHum() {

    const osc =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = 39;

    gain.gain.value = .025;

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
}

function whisper() {

    sound(
        140,
        .7,
        .035,
        "sawtooth"
    );

    setTimeout(() => {

        sound(
            72,
            .5,
            .025,
            "triangle"
        );

    }, 300);
}

function footstep() {

    sound(
        currentRoom === "basement"
            ? 58
            : 82,
        .06,
        .028,
        "triangle"
    );
}

function doorSound() {

    sound(
        60,
        .45,
        .06,
        "sawtooth"
    );

    setTimeout(() => {

        sound(
            42,
            .3,
            .035,
            "triangle"
        );

    }, 180);
}

/* =========================================================
   MESSAGE
========================================================= */

let messageTimeout;

function message(text) {

    const el =
        document.getElementById(
            "storyMessage"
        );

    if (!el) return;

    el.textContent = text;

    el.classList.add("show");

    clearTimeout(
        messageTimeout
    );

    messageTimeout =
        setTimeout(() => {

            el.classList.remove("show");

        }, 2800);
}

/* =========================================================
   OBJECTIVE
========================================================= */

function objective(text) {

    const el =
        document.getElementById(
            "objective"
        );

    if (el) {
        el.textContent = text;
    }
}

/* =========================================================
   INVENTORY
========================================================= */

function addItem(item) {

    if (
        inventory.includes(item)
    ) return;

    inventory.push(item);

    renderInventory();

    sound(
        420,
        .12,
        .04
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

        const el =
            document.createElement("div");

        el.textContent =
            "◆ " + item;

        list.appendChild(el);

    });
}

/* =========================================================
   DIARY
========================================================= */

function diaryEntry(title, text) {

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

/* =========================================================
   ACHIEVEMENTS
========================================================= */

const achievements = {};

function achievement(
    id,
    title,
    description
) {

    if (achievements[id]) return;

    achievements[id] = true;

    showAchievement(
        title,
        description
    );
}

function showAchievement(
    title,
    description
) {

    let box =
        document.getElementById(
            "achievementBox"
        );

    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "achievementBox";

        Object.assign(
            box.style,
            {
                position: "fixed",
                right: "18px",
                top: "18px",
                width: "270px",
                zIndex: "10000",
                pointerEvents: "none"
            }
        );

        document.body.appendChild(box);
    }

    const card =
        document.createElement("div");

    Object.assign(
        card.style,
        {
            background:
                "rgba(8,8,8,.94)",

            color: "#fff",

            padding: "14px",

            marginBottom: "10px",

            border:
                "1px solid rgba(255,255,255,.15)",

            borderRadius: "6px",

            fontFamily:
                "Inter,sans-serif",

            boxShadow:
                "0 10px 30px rgba(0,0,0,.5)"
        }
    );

    card.innerHTML = `
        <small style="
            opacity:.5;
            letter-spacing:2px;
        ">
            ACHIEVEMENT
        </small>

        <div style="
            font-family:Cinzel,serif;
            margin-top:6px;
            font-size:17px;
        ">
            ${title}
        </div>

        <div style="
            opacity:.65;
            font-size:12px;
            margin-top:5px;
        ">
            ${description}
        </div>
    `;

    box.appendChild(card);

    sound(
        620,
        .12,
        .045
    );

    setTimeout(() => {

        card.remove();

    }, 4000);
}

/* =========================================================
   FEAR
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

function calm(amount) {

    fear -= amount;

    fear =
        Math.max(
            0,
            fear
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

    aggression: 0
};

function spawnEntity() {

    entity.room =
        currentRoom;

    entity.x =
        80 +
        Math.random() *
        (canvas.width - 160);

    entity.y =
        80 +
        Math.random() *
        (canvas.height - 160);

    entity.visible =
        true;

    entity.state =
        "watching";

    entity.timer =
        0;

    story.entityAwake =
        true;

    whisper();

    message(
        "Ada sesuatu di dalam rumah ini."
    );
}

function updateEntity() {

    if (
        !gameStarted ||
        gameOver
    ) return;

    if (
        !story.entityAwake
    ) {

        if (
            gameTime > 1000
        ) {

            spawnEntity();

        }

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

    const dist =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (
        entity.state ===
        "watching"
    ) {

        addFear(.006);

        if (
            entity.timer % 220 === 0
        ) {

            whisper();

        }

        if (
            dist < 230
        ) {

            entity.state =
                "near";

            entity.timer =
                0;
        }
    }

    else if (
        entity.state ===
        "near"
    ) {

        addFear(.018);

        if (
            dist > 0
        ) {

            const speed =
                .12 +
                entity.aggression *
                .01;

            entity.x +=
                dx / dist *
                speed;

            entity.y +=
                dy / dist *
                speed;
        }

        if (
            entity.timer % 180 === 0
        ) {

            whisper();

        }

        if (
            dist < 90
        ) {

            jumpscare();

        }
    }
}

function drawEntity() {

    if (
        !entity.visible ||
        entity.room !==
        currentRoom
    ) return;

    ctx.save();

    const alpha =
        entity.state ===
        "watching"
            ? .22
            : .48;

    ctx.globalAlpha =
        alpha;

    const aura =
        ctx.createRadialGradient(
            entity.x,
            entity.y,
            5,
            entity.x,
            entity.y,
            120
        );

    aura.addColorStop(
        0,
        "rgba(0,0,0,.9)"
    );

    aura.addColorStop(
        .5,
        "rgba(0,0,0,.45)"
    );

    aura.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle =
        aura;

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

    ctx.fillStyle =
        "#030303";

    ctx.beginPath();

    ctx.arc(
        entity.x,
        entity.y - 72,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "rgba(230,230,230,.7)";

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

let scareLock = false;

function jumpscare() {

    if (scareLock) return;

    scareLock = true;

    addFear(30);

    const flash =
        document.createElement("div");

    Object.assign(
        flash.style,
        {
            position: "fixed",
            inset: "0",
            background:
                "rgba(255,255,255,.18)",
            zIndex: "9999",
            pointerEvents: "none"
        }
    );

    document.body.appendChild(
        flash
    );

    sound(
        55,
        .8,
        .14,
        "sawtooth"
    );

    message(
        "JANGAN MENATAPNYA."
    );

    document.body.style.transform =
        "translate(4px,-3px)";

    setTimeout(() => {

        document.body.style.transform =
            "translate(-5px,4px)";

    }, 80);

    setTimeout(() => {

        document.body.style.transform =
            "";

        flash.remove();

        entity.visible =
            false;

        entity.state =
            "hidden";

        entity.timer =
            0;

        scareLock =
            false;

        calm(25);

        achievement(
            "saw",
            "I SAW YOU",
            "Survive an encounter with the Entity."
        );

    }, 900);
}

/* =========================================================
   PLAYER
========================================================= */

let lastStep =
    0;

function updatePlayer() {

    let dx = 0;
    let dy = 0;

    if (
        keys.w ||
        keys.arrowup
    ) dy--;

    if (
        keys.s ||
        keys.arrowdown
    ) dy++;

    if (
        keys.a ||
        keys.arrowleft
    ) dx--;

    if (
        keys.d ||
        keys.arrowright
    ) dx++;

    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const len =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        dx /= len;
        dy /= len;

        player.x +=
            dx *
            player.speed;

        player.y +=
            dy *
            player.speed;

        const now =
            performance.now();

        if (
            now - lastStep >
            300
        ) {

            footstep();

            lastStep =
                now;
        }
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

    checkExits();
}

function drawPlayer() {

    ctx.save();

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
   ROOM TRANSITION
========================================================= */

function enterRoom(room) {

    if (!rooms[room]) return;

    currentRoom =
        room;

    entity.visible =
        false;

    entity.state =
        "hidden";

    player.x =
        canvas.width / 2;

    player.y =
        canvas.height / 2;

    sound(
        45,
        .3,
        .035
    );

    updateRoomUI();

    roomMessage();
}

function updateRoomUI() {

    const chapter =
        document.getElementById(
            "chapter"
        );

    if (chapter) {

        chapter.textContent =
            rooms[
                currentRoom
            ].name;

    }
}

function roomMessage() {

    if (
        currentRoom ===
        "hallway"
    ) {

        message(
            "Lorong itu terasa lebih panjang dari sebelumnya."
        );

    }

    if (
        currentRoom ===
        "living"
    ) {

        message(
            "Ruang tamu masih menyimpan suara malam itu."
        );

    }

    if (
        currentRoom ===
        "bedroom"
    ) {

        message(
            "Udara di kamar ini jauh lebih dingin."
        );

        addFear(5);

    }

    if (
        currentRoom ===
        "basement"
    ) {

        message(
            "Aku seharusnya tidak turun ke sini."
        );

        addFear(10);

    }
}

/* =========================================================
   EXITS
========================================================= */

function checkExits() {

    const w =
        canvas.width;

    const h =
        canvas.height;

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

            player.x =
                w - 55;

        }

        if (
            player.y < 30 &&
            player.x > 380 &&
            player.x < 520
        ) {

            if (
                story.bedroom
            ) {

                enterRoom(
                    "bedroom"
                );

            }
            else {

                message(
                    "Pintu kamar terkunci."
                );

                player.y =
                    55;

            }

        }

        if (
            player.y >
                h - 30 &&
            player.x > 700
        ) {

            if (
                story.basement
            ) {

                enterRoom(
                    "basement"
                );

            }
            else {

                message(
                    "Aku belum menemukan kuncinya."
                );

                player.y =
                    h - 55;

            }
        }
    }

    else if (
        currentRoom ===
        "living"
    ) {

        if (
            player.x >
            w - 30
        ) {

            enterRoom(
                "hallway"
            );

            player.x =
                55;

        }

    }

    else if (
        currentRoom ===
        "bedroom"
    ) {

        if (
            player.y >
            h - 30
        ) {

            enterRoom(
                "hallway"
            );

            player.y =
                55;

        }

    }

    else if (
        currentRoom ===
        "basement"
    ) {

        if (
            player.y < 30
        ) {

            enterRoom(
                "hallway"
            );

            player.y =
                h - 55;

        }

    }
}

/* =========================================================
   WORLD
========================================================= */

function drawWorld() {

    const room =
        rooms[
            currentRoom
        ];

    ctx.fillStyle =
        room.wall;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawWalls();

    drawFloor();

    drawFurniture();

    drawDecorations();

    drawDoors();

    drawEntity();

    drawPlayer();

    drawLighting();

    drawAtmosphere();
}

/* =========================================================
   WALLS
========================================================= */

function drawWalls() {

    ctx.fillStyle =
        rooms[
            currentRoom
        ].wall;

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

/* =========================================================
   FLOOR
========================================================= */

function drawFloor() {

    const room =
        rooms[
            currentRoom
        ];

    ctx.fillStyle =
        room.floor;

    ctx.fillRect(
        35,
        35,
        canvas.width - 70,
        canvas.height - 70
    );

    ctx.strokeStyle =
        "rgba(255,255,255,.018)";

    ctx.lineWidth =
        1;

    const spacing =
        currentRoom ===
        "basement"
            ? 28
            : 48;

    for (
        let x = 35;
        x < canvas.width - 35;
        x += spacing
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            35
        );

        ctx.lineTo(
            x,
            canvas.height - 35
        );

        ctx.stroke();
    }

    for (
        let y = 35;
        y < canvas.height - 35;
        y += spacing
    ) {

        ctx.beginPath();

        ctx.moveTo(
            35,
            y
        );

        ctx.lineTo(
            canvas.width - 35,
            y
        );

        ctx.stroke();
    }
}

/* =========================================================
   FURNITURE
========================================================= */

function drawFurniture() {

    if (
        currentRoom ===
        "hallway"
    ) {

        /* table */

        shadowRect(
            90,
            120,
            150,
            70
        );

        woodRect(
            90,
            120,
            150,
            70
        );

        /* small drawer */

        woodRect(
            115,
            140,
            100,
            38
        );

    }

    if (
        currentRoom ===
        "living"
    ) {

        /* sofa */

        shadowRect(
            100,
            350,
            300,
            90
        );

        roundedRect(
            100,
            350,
            300,
            90,
            "#403636"
        );

        roundedRect(
            125,
            325,
            90,
            60,
            "#4a3e3d"
        );

        roundedRect(
            285,
            325,
            90,
            60,
            "#4a3e3d"
        );

        /* coffee table */

        woodRect(
            440,
            390,
            150,
            45
        );

    }

    if (
        currentRoom ===
        "bedroom"
    ) {

        /* bed */

        shadowRect(
            100,
            130,
            290,
            150
        );

        roundedRect(
            100,
            130,
            290,
            150,
            "#3e3940"
        );

        roundedRect(
            120,
            150,
            250,
            110,
            "#514b55"
        );

        /* pillow */

        roundedRect(
            140,
            165,
            90,
            45,
            "#706872"
        );

        /* wardrobe */

        woodRect(
            510,
            90,
            130,
            230
        );

    }

    if (
        currentRoom ===
        "basement"
    ) {

        /* shelves */

        for (
            let y = 100;
            y < 390;
            y += 100
        ) {

            woodRect(
                80,
                y,
                300,
                22
            );

        }

        /* boxes */

        woodRect(
            500,
            350,
            130,
            80
        );

        woodRect(
            650,
            390,
            100,
            60
        );

    }
}

/* =========================================================
   DECORATIONS
========================================================= */

function drawDecorations() {

    if (
        currentRoom ===
        "hallway"
    ) {

        drawClock();

        drawPhoto();

        drawPainting(
            560,
            75,
            130,
            100
        );

    }

    if (
        currentRoom ===
        "living"
    ) {

        drawRadio();

        drawPainting(
            300,
            70,
            160,
            120
        );

        drawLamp(
            700,
            160
        );

    }

    if (
        currentRoom ===
        "bedroom"
    ) {

        drawMirror();

        drawLamp(
            700,
            330
        );

    }

    if (
        currentRoom ===
        "basement"
    ) {

        drawPipe();

        drawBoxMark();

    }
}

/* =========================================================
   DRAW HELPERS
========================================================= */

function shadowRect(
    x,
    y,
    w,
    h
) {

    ctx.fillStyle =
        "rgba(0,0,0,.38)";

    ctx.fillRect(
        x + 7,
        y + 8,
        w,
        h
    );
}

function woodRect(
    x,
    y,
    w,
    h
) {

    ctx.fillStyle =
        "#3b2b23";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );

    ctx.strokeStyle =
        "rgba(255,255,255,.035)";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );
}

function roundedRect(
    x,
    y,
    w,
    h,
    color
) {

    ctx.fillStyle =
        color;

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        w,
        h,
        10
    );

    ctx.fill();
}

function drawPainting(
    x,
    y,
    w,
    h
) {

    ctx.strokeStyle =
        "#5b4435";

    ctx.lineWidth =
        8;

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );

    ctx.fillStyle =
        "rgba(100,100,100,.09)";

    ctx.fillRect(
        x + 5,
        y + 5,
        w - 10,
        h - 10
    );
}

function drawPhoto() {

    ctx.fillStyle =
        "#bca77f";

    ctx.fillRect(
        145,
        140,
        50,
        35
    );

    ctx.strokeStyle =
        "#5b4635";

    ctx.strokeRect(
        140,
        135,
        60,
        45
    );
}

function drawClock() {

    ctx.strokeStyle =
        "#999";

    ctx.lineWidth =
        3;

    ctx.beginPath();

    ctx.arc(
        730,
        120,
        34,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.fillStyle =
        "#aaa";

    ctx.font =
        "11px serif";

    ctx.fillText(
        "03:17",
        714,
        124
    );
}

function drawRadio() {

    ctx.fillStyle =
        "#151515";

    ctx.fillRect(
        600,
        170,
        110,
        70
    );

    ctx.fillStyle =
        "#777";

    ctx.fillRect(
        615,
        185,
        75,
        28
    );

    ctx.strokeStyle =
        "#555";

    ctx.strokeRect(
        610,
        180,
        85,
        38
    );
}

function drawMirror() {

    ctx.strokeStyle =
        "#756e6b";

    ctx.lineWidth =
        7;

    ctx.strokeRect(
        650,
        90,
        100,
        190
    );

    ctx.fillStyle =
        "rgba(150,160,170,.09)";

    ctx.fillRect(
        657,
        97,
        86,
        176
    );
}

function drawLamp(
    x,
    y
) {

    ctx.fillStyle =
        "#40352b";

    ctx.fillRect(
        x,
        y,
        8,
        80
    );

    ctx.beginPath();

    ctx.arc(
        x + 4,
        y,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();

}

function drawPipe() {

    ctx.strokeStyle =
        "#4c4b45";

    ctx.lineWidth =
        8;

    ctx.beginPath();

    ctx.moveTo(
        450,
        50
    );

    ctx.lineTo(
        450,
        350
    );

    ctx.lineTo(
        650,
        350
    );

    ctx.stroke();
}

function drawBoxMark() {

    ctx.fillStyle =
        "rgba(180,150,100,.15)";

    ctx.font =
        "20px serif";

    ctx.fillText(
        "0317",
        520,
        395
    );
}

/* =========================================================
   DOORS
========================================================= */

function drawDoors() {

    ctx.fillStyle =
        "#17120f";

    if (
        currentRoom ===
        "hallway"
    ) {

        ctx.fillRect(
            400,
            35,
            100,
            15
        );

        ctx.fillRect(
            700,
            canvas.height - 50,
            120,
            15
        );

        ctx.fillRect(
            0,
            220,
            35,
            150
        );
    }

    if (
        currentRoom ===
        "living"
    ) {

        ctx.fillRect(
            canvas.width - 35,
            220,
            35,
            150
        );

    }

    if (
        currentRoom ===
        "bedroom"
    ) {

        ctx.fillRect(
            400,
            canvas.height - 35,
            100,
            15
        );

    }

    if (
        currentRoom ===
        "basement"
    ) {

        ctx.fillRect(
            700,
            90,
            100,
            180
        );

    }
}

/* =========================================================
   LIGHTING
========================================================= */

function drawLighting() {

    const room =
        rooms[
            currentRoom
        ];

    ctx.fillStyle =
        `rgba(
            0,
            0,
            0,
            ${1 - room.light}
        )`;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (
        !flashlight
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,.94)";

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
            ? 180
            : 260;

    const gradient =
        ctx.createRadialGradient(
            player.x,
            player.y,
            10,
            player.x,
            player.y,
            radius
        );

    gradient.addColorStop(
        0,
        "rgba(255,245,210,.34)"
    );

    gradient.addColorStop(
        .25,
        "rgba(255,245,210,.14)"
    );

    gradient.addColorStop(
        .65,
        "rgba(0,0,0,.42)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,.92)"
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
   ATMOSPHERE
========================================================= */

function drawAtmosphere() {

    /* dust */

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        const x =
            (
                i * 137 +
                gameTime * .12
            ) %
            canvas.width;

        const y =
            (
                i * 71 +
                gameTime * .04
            ) %
            canvas.height;

        ctx.fillStyle =
            "rgba(255,255,255,.035)";

        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }

    /* fear vignette */

    if (
        fear > 20
    ) {

        const alpha =
            (
                fear - 20
            ) / 180;

        const gradient =
            ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                80,
                canvas.width / 2,
                canvas.height / 2,
                canvas.width / 1.2
            );

        gradient.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );

        gradient.addColorStop(
            1,
            `rgba(0,0,0,${alpha})`
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
}

/* =========================================================
   INTERACTION
========================================================= */

function interact() {

    if (
        !gameStarted ||
        gameOver
    ) return;

    const x =
        player.x;

    const y =
        player.y;

    /* =========================
       HALLWAY
    ========================= */

    if (
        currentRoom ===
        "hallway"
    ) {

        if (
            distance(
                x,
                y,
                170,
                158
            ) < 75
        ) {

            inspectPhoto();

            return;
        }

        if (
            distance(
                x,
                y,
                730,
                120
            ) < 75
        ) {

            inspectClock();

            return;
        }

        if (
            y < 85 &&
            x > 380 &&
            x < 520
        ) {

            bedroomDoor();

            return;
        }

        if (
            y >
            canvas.height - 100 &&
            x > 680
        ) {

            basementDoor();

            return;
        }
    }

    /* =========================
       LIVING
    ========================= */

    if (
        currentRoom ===
        "living"
    ) {

        if (
            distance(
                x,
                y,
                650,
                205
            ) < 100
        ) {

            radio();

            return;
        }

        if (
            distance(
                x,
                y,
                380,
                130
            ) < 110
        ) {

            painting();

            return;
        }
    }

    /* =========================
       BEDROOM
    ========================= */

    if (
        currentRoom ===
        "bedroom"
    ) {

        if (
            distance(
                x,
                y,
                700,
                180
            ) < 100
        ) {

            mirror();

            return;
        }

        if (
            distance(
                x,
                y,
                575,
                200
            ) < 130
        ) {

            wardrobe();

            return;
        }
    }

    /* =========================
       BASEMENT
    ========================= */

    if (
        currentRoom ===
        "basement"
    ) {

        if (
            distance(
                x,
                y,
                560,
                390
            ) < 110
        ) {

            oldBox();

            return;
        }

        if (
            x > 680 &&
            y > 80 &&
            y < 300
        ) {

            finalDoor();

            return;
        }
    }
}

/* =========================================================
   PUZZLES
========================================================= */

function inspectPhoto() {

    if (
        !story.photograph
    ) {

        story.photograph =
            true;

        addItem(
            "Old Family Photograph"
        );

        diaryEntry(
            "THE PHOTOGRAPH",
            "Di balik keluarga itu ada sosok lain. Wajahnya dicoret, tetapi matanya masih terlihat."
        );

        achievement(
            "photo",
            "THE CURIOUS",
            "Inspect the old family photograph."
        );

        objective(
            "Periksa jam tua yang berhenti pada 03:17."
        );

        message(
            "Ada sesuatu di belakang mereka."
        );

        return;
    }

    inspect(
        "FOTO",
        "Tulisan di belakangnya: 'Ia selalu datang pada 03:17.'"
    );
}

function inspectClock() {

    if (
        !story.clock
    ) {

        story.clock =
            true;

        addItem(
            "Clock Note"
        );

        diaryEntry(
            "03:17",
            "Jam berhenti tepat pada pukul 03:17."
        );

        achievement(
            "clock",
            "03:17",
            "Discover the time hidden in the house."
        );

        objective(
            "Cari radio tua di ruang tamu."
        );

        message(
            "03:17... lagi."
        );

        return;
    }

    inspect(
        "JAM",
        "Jarumnya tidak pernah bergerak sejak malam itu."
    );
}

function radio() {

    if (
        !story.clock
    ) {

        message(
            "Radio tidak menyala."
        );

        return;
    }

    if (
        !story.radio
    ) {

        story.radio =
            true;

        addItem(
            "Radio Recording"
        );

        diaryEntry(
            "THE RADIO",
            "Suara dari radio mengulang empat angka: 0... 3... 1... 7."
        );

        achievement(
            "radio",
            "LISTEN",
            "Listen to the mysterious radio."
        );

        sound(
            90,
            .5,
            .06,
            "sawtooth"
        );

        setTimeout(
            whisper,
            700
        );

        objective(
            "Cari tempat yang menggunakan kode 0317."
        );

        message(
            "0... 3... 1... 7..."
        );

        return;
    }

    inspect(
        "RADIO",
        "Hanya suara statis yang tersisa."
    );
}

function painting() {

    if (
        story.radio &&
        !story.code
    ) {

        story.code =
            true;

        addItem(
            "Code 0317"
        );

        objective(
            "Gunakan kode 0317 untuk membuka kamar."
        );

        message(
            "Kode itu cocok dengan sesuatu."
        );

        return;
    }

    inspect(
        "LUKISAN",
        "Tatapan pada lukisan terasa berbeda setiap kali aku melihatnya."
    );
}

function bedroomDoor() {

    if (
        story.bedroom
    ) {

        enterRoom(
            "bedroom"
        );

        return;
    }

    if (
        story.code
    ) {

        story.bedroom =
            true;

        addItem(
            "Bedroom Key"
        );

        achievement(
            "room",
            "THE LAST ROOM",
            "Enter the forbidden bedroom."
        );

        objective(
            "Cari tahu kenapa kamar ini dikunci."
        );

        message(
            "Pintunya terbuka..."
        );

        return;
    }

    doorSound();

    message(
        "Terkunci."
    );
}

function mirror() {

    if (
        !story.mirror
    ) {

        story.mirror =
            true;

        diaryEntry(
            "THE MIRROR",
            "Pantulan di cermin bergerak sedikit terlambat."
        );

        objective(
            "Periksa lemari tua."
        );

        addFear(
            12
        );

        message(
            "Itu bukan pantulanku."
        );

        return;
    }

    inspect(
        "CERMIN",
        "Sekarang pantulannya kembali normal."
    );
}

function wardrobe() {

    if (
        story.mirror &&
        !story.basement
    ) {

        story.basement =
            true;

        addItem(
            "Basement Key"
        );

        diaryEntry(
            "THE KEY",
            "Sebuah kunci ditemukan di balik pakaian lama."
        );

        objective(
            "Turun ke basement."
        );

        message(
            "Kunci basement."
        );

        return;
    }

    inspect(
        "LEMARI",
        "Bau kayu tua dan debu."
    );
}

function basementDoor() {

    if (
        story.basement
    ) {

        enterRoom(
            "basement"
        );

        achievement(
            "basement",
            "BELOW",
            "Descend beneath the house."
        );

        objective(
            "Temukan apa yang sebenarnya disembunyikan."
        );

        return;
    }

    message(
        "Aku belum punya kuncinya."
    );
}

function oldBox() {

    if (
        !story.letter
    ) {

        story.letter =
            true;

        addItem(
            "Old Letter"
        );

        diaryEntry(
            "THE LETTER",
            "Surat itu menjelaskan bahwa rumah ini dibangun untuk mengurung sesuatu."
        );

        objective(
            "Cari pintu terakhir."
        );

        addFear(
            15
        );

        message(
            "Rumah ini... adalah penjara."
        );

        return;
    }

    inspect(
        "KOTAK",
        "Tidak ada apa-apa lagi."
    );
}

function finalDoor() {

    if (
        !story.letter
    ) {

        message(
            "Aku belum tahu apa yang ada di baliknya."
        );

        return;
    }

    if (
        !story.finalDoor
    ) {

        story.finalDoor =
            true;

        story.houseKey =
            true;

        addItem(
            "House Key"
        );

        story.entityAwake =
            true;

        entity.room =
            currentRoom;

        entity.x =
            180;

        entity.y =
            120;

        entity.visible =
            true;

        entity.state =
            "watching";

        objective(
            "Temukan jalan keluar."
        );

        message(
            "Rumah ini bukan rumah. Ini penjara."
        );

        diaryEntry(
            "THE TRUTH",
            "Mereka tidak tinggal di rumah ini. Mereka mengurung sesuatu di sini."
        );

        return;
    }

    if (
        story.houseKey
    ) {

        ending();
    }
}

/* =========================================================
   ENDING SYSTEM
========================================================= */

function ending() {

    gameOver =
        true;

    story.escaped =
        true;

    let endingType =
        "ESCAPE";

    if (
        story.secret
    ) {

        endingType =
            "TRUE ENDING";

    }
    else if (
        story.letter &&
        story.finalDoor
    ) {

        endingType =
            "THE TRUTH";

    }

    showEnding(
        endingType
    );
}

function showEnding(type) {

    const overlay =
        document.createElement("div");

    Object.assign(
        overlay.style,
        {
            position: "fixed",
            inset: "0",
            background:
                "rgba(0,0,0,.95)",
            zIndex: "20000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#fff",
            padding: "25px"
        }
    );

    let description = "";

    if (
        type ===
        "ESCAPE"
    ) {

        description =
            "Kau berhasil keluar dari rumah. Tapi dari jendela lantai atas, sesuatu masih memperhatikanmu.";

    }

    else if (
        type ===
        "THE TRUTH"
    ) {

        description =
            "Kau menemukan kebenaran tentang rumah itu. Namun satu pertanyaan masih belum terjawab: siapa yang membangun penjara tersebut?";

    }

    else {

        description =
            "Kau menemukan rahasia terdalam rumah. Entity tidak pernah benar-benar dikurung. Ia hanya menunggu seseorang membuka pintunya.";

    }

    overlay.innerHTML = `
        <div style="max-width:650px">

            <div style="
                font-size:11px;
                letter-spacing:5px;
                opacity:.45;
                margin-bottom:25px;
            ">
                ENDING
            </div>

            <h1 style="
                font-family:Cinzel,serif;
                font-size:42px;
                letter-spacing:5px;
                margin-bottom:25px;
            ">
                ${type}
            </h1>

            <p style="
                font-family:Inter,sans-serif;
                line-height:1.8;
                opacity:.72;
            ">
                ${description}
            </p>

            <button
                id="restartGame"
                style="
                    margin-top:35px;
                    padding:12px 25px;
                    background:transparent;
                    color:white;
                    border:1px solid rgba(255,255,255,.3);
                    cursor:pointer;
                "
            >
                PLAY AGAIN
            </button>

        </div>
    `;

    document.body.appendChild(
        overlay
    );

    achievement(
        "ending",
        type,
        "Complete an ending."
    );

    document
        .getElementById(
            "restartGame"
        )
        ?.addEventListener(
            "click",
            () => {

                location.reload();

            }
        );
}

/* =========================================================
   INSPECT
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

    if (titleEl)
        titleEl.textContent =
            title;

    if (textEl)
        textEl.textContent =
            text;

    overlay.classList.add(
        "active"
    );
}

document
    .getElementById(
        "closeInspect"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "inspectOverlay"
                )
                ?.classList.remove(
                    "active"
                );

        }
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

        message(
            "Baterainya habis."
        );

        return;
    }

    flashlight =
        !flashlight;

    sound(
        flashlight
            ? 180
            : 75,
        .12,
        .035
    );
}

document
    .getElementById(
        "flashlightBtn"
    )
    ?.addEventListener(
        "click",
        toggleFlashlight
    );

/* =========================================================
   BATTERY
========================================================= */

function updateBattery() {

    if (
        !flashlight
    ) return;

    battery -=
        currentRoom ===
        "basement"
            ? .012
            : .007;

    if (
        battery <= 0
    ) {

        battery =
            0;

        flashlight =
            false;

        message(
            "Senterku mati."
        );

        addFear(
            15
        );
    }

    const el =
        document.getElementById(
            "battery"
        );

    if (el) {

        el.textContent =
            Math.floor(
                battery
            ) + "%";

    }
}

/* =========================================================
   MOBILE
========================================================= */

function holdButton(
    id,
    key
) {

    const button =
        document.getElementById(
            id
        );

    if (!button) return;

    button.addEventListener(
        "touchstart",
        e => {

            e.preventDefault();

            keys[key] =
                true;

        },
        {
            passive:false
        }
    );

    button.addEventListener(
        "touchend",
        e => {

            e.preventDefault();

            keys[key] =
                false;

        },
        {
            passive:false
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

document
    .getElementById(
        "interactBtn"
    )
    ?.addEventListener(
        "click",
        interact
    );

/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    e => {

        keys[
            e.key.toLowerCase()
        ] = true;

        if (
            e.key.toLowerCase() ===
            "e"
        ) {

            interact();

        }

        if (
            e.key.toLowerCase() ===
            "f"
        ) {

            toggleFlashlight();

        }

    }
);

window.addEventListener(
    "keyup",
    e => {

        keys[
            e.key.toLowerCase()
        ] = false;

    }
);

/* =========================================================
   CHARACTER CREATOR
========================================================= */

document
    .getElementById(
        "startGame"
    )
    ?.addEventListener(
        "click",
        () => {

            playerName =
                document
                    .getElementById(
                        "playerName"
                    )
                    ?.value
                    .trim() ||
                "Unknown";

            initAudio();

            if (
                audioCtx.state ===
                "suspended"
            ) {

                audioCtx.resume();

            }

            startGame();

        }
    );

/* =========================================================
   START
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
        canvas.width / 2;

    player.y =
        canvas.height / 2;

    battery =
        100;

    flashlight =
        true;

    fear =
        0;

    gameTime =
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
        "hidden";

    diaryEntry(
        "FIRST NIGHT",
        "Aku kembali ke rumah lama keluarga. Tidak ada yang tinggal di sini sejak malam itu."
    );

    objective(
        "Cari tahu apa yang terjadi di rumah ini."
    );

    message(
        `Selamat datang kembali, ${playerName}.`
    );

    updateRoomUI();

    renderInventory();

    renderDiary();
}

/* =========================================================
   CHARACTER PREVIEW
========================================================= */

function updatePreview() {

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

    const s =
        document.querySelector(
            ".preview-skin"
        );

    const h =
        document.querySelector(
            ".preview-hair"
        );

    const o =
        document.querySelector(
            ".preview-outfit"
        );

    if (s)
        s.style.background =
            skin;

    if (h)
        h.style.background =
            hair;

    if (o)
        o.style.background =
            outfit;
}

[
    "skinColor",
    "hairColor",
    "outfitColor"
].forEach(id => {

    document
        .getElementById(id)
        ?.addEventListener(
            "input",
            updatePreview
        );

});

updatePreview();

/* =========================================================
   CINEMATIC
========================================================= */

const scenes = [

    [
        "CHAPTER I",
        "23:41 PM."
    ],

    [
        "THE RETURN",
        "Hujan turun ketika aku kembali ke rumah lama keluargaku."
    ],

    [
        "THE HOUSE",
        "Tidak ada yang tinggal di sini sejak malam itu."
    ],

    [
        "THE WARNING",
        "Jangan masuk ke kamar paling ujung."
    ],

    [
        "THE HOUSE REMEMBERS",
        "Tapi rumah itu masih mengingat semuanya."
    ]

];

let sceneIndex =
    0;

function playCinematic() {

    showScreen(
        "cinematic"
    );

    sceneIndex =
        0;

    nextScene();
}

function nextScene() {

    if (
        sceneIndex >=
        scenes.length
    ) {

        showScreen(
            "creator"
        );

        return;
    }

    const label =
        document.getElementById(
            "chapterLabel"
        );

    const text =
        document.getElementById(
            "cinematicText"
        );

    if (
        label
    )
        label.textContent =
            scenes[
                sceneIndex
            ][0];

    if (
        text
    )
        text.textContent =
            scenes[
                sceneIndex
            ][1];

    sceneIndex++;

    setTimeout(
        nextScene,
        2500
    );
}

document
    .getElementById(
        "skipCinematic"
    )
    ?.addEventListener(
        "click",
        () => {

            showScreen(
                "creator"
            );

        }
    );

/* =========================================================
   CANVAS
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
   LOOP
========================================================= */

function update() {

    if (
        !gameStarted ||
        gameOver
    ) return;

    gameTime++;

    updatePlayer();

    updateBattery();

    updateEntity();

    if (
        gameTime % 900 === 0
    ) {

        calm(5);

    }
}

function render() {

    if (
        !gameStarted
    ) return;

    drawWorld();
}

function loop() {

    update();

    render();

    requestAnimationFrame(
        loop
    );
}

showScreen(
    "cinematic"
);

setTimeout(
    playCinematic,
    500
);

loop();

/* =========================================================
   END PHASE 5
========================================================= */
