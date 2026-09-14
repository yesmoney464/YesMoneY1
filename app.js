```javascript
"use strict";

/*
    VELORA
    Frontend demo casino experience
    Virtual credits only.
*/


/* =========================================
   STORAGE
========================================= */

const STORAGE_USER = "velora_user";
const STORAGE_ACCOUNT = "velora_account";


/* =========================================
   GAME DATA
========================================= */

const games = {

    candy: {
        id: "candy",
        title: "Candy Kingdom",
        category: "SWEET ORIGINAL",
        description: "Сладкое королевство",
        visual: "candy-visual",
        emblem: "C",
        symbols: ["C", "◆", "★", "7", "V"],
        colors: ["#ff8ed0", "#c6a5ff", "#ffe39a", "#fff1b5", "#e8bd61"],
        payouts: {
            "C": 8,
            "◆": 12,
            "★": 18,
            "7": 35,
            "V": 60
        }
    },

    olympus: {
        id: "olympus",
        title: "Olympus Fate",
        category: "MYTHIC ORIGINAL",
        description: "Сила небес",
        visual: "olympus-visual",
        emblem: "O",
        symbols: ["O", "◆", "★", "7", "V"],
        colors: ["#8fc5ff", "#b79cff", "#ffd36e", "#fff1b5", "#e8bd61"],
        payouts: {
            "O": 8,
            "◆": 12,
            "★": 18,
            "7": 35,
            "V": 70
        }
    },

    jungle: {
        id: "jungle",
        title: "Jungle Fortune",
        category: "WILD ORIGINAL",
        description: "Тайна джунглей",
        visual: "jungle-visual",
        emblem: "J",
        symbols: ["J", "◆", "★", "7", "V"],
        colors: ["#61e7a2", "#b8e78d", "#ffd56e", "#fff1b5", "#e8bd61"],
        payouts: {
            "J": 8,
            "◆": 12,
            "★": 20,
            "7": 38,
            "V": 75
        }
    }

};


/* =========================================
   STATE
========================================= */

let account = null;

let currentGame = null;

let balance = 10000;

let bet = 100;

let isSpinning = false;

let autoMode = false;

let turboMode = false;

let soundOn = true;

let autoTimer = null;

let totalWin = 0;

let gamesPlayed = 0;


/* =========================================
   DOM
========================================= */

const authScreen = document.getElementById("authScreen");
const mainApp = document.getElementById("mainApp");
const gameScreen = document.getElementById("gameScreen");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginName = document.getElementById("loginName");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerPassword = document.getElementById("registerPassword");
const registerPassword2 = document.getElementById("registerPassword2");

const headerBalance = document.getElementById("headerBalance");
const gameBalance = document.getElementById("gameBalance");

const profileName = document.getElementById("profileName");

const profileButton = document.getElementById("profileButton");
const profileModal = document.getElementById("profileModal");

const profileModalName = document.getElementById("profileModalName");
const profileModalBalance = document.getElementById("profileModalBalance");
const profileGamesPlayed = document.getElementById("profileGamesPlayed");
const profileTotalWin = document.getElementById("profileTotalWin");

const logoutButton = document.getElementById("logoutButton");
const profileLogout = document.getElementById("profileLogout");

const closeProfile = document.getElementById("closeProfile");

const featuredGames = document.getElementById("featuredGames");
const allGames = document.getElementById("allGames");

const closeGame = document.getElementById("closeGame");

const gameTitle = document.getElementById("gameTitle");
const gameCategory = document.getElementById("gameCategory");
const machineGameName = document.getElementById("machineGameName");

const currentBetLabel = document.getElementById("currentBetLabel");
const betValue = document.getElementById("betValue");

const winAmount = document.getElementById("winAmount");

const gameModeLabel = document.getElementById("gameModeLabel");

const spinButton = document.getElementById("spinButton");

const betMinus = document.getElementById("betMinus");
const betPlus = document.getElementById("betPlus");

const autoButton = document.getElementById("autoButton");
const turboButton = document.getElementById("turboButton");

const gameMessage = document.getElementById("gameMessage");

const paytableButton = document.getElementById("paytableButton");
const paytableModal = document.getElementById("paytableModal");
const closePaytable = document.getElementById("closePaytable");
const paytableContent = document.getElementById("paytableContent");

const soundButton = document.getElementById("soundButton");

const supportForm = document.getElementById("supportForm");

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");


/* =========================================
   INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    buildGameCards();

    setupAuth();

    setupNavigation();

    setupGameControls();

    setupProfile();

    setupSupport();

    setupPaytable();

    loadSession();

});


/* =========================================
   AUTH
========================================= */

function setupAuth() {

    loginTab.addEventListener("click", () => {
        showLogin();
    });

    registerTab.addEventListener("click", () => {
        showRegister();
    });

    loginForm.addEventListener("submit", event => {

        event.preventDefault();

        const name = loginName.value.trim();
        const password = loginPassword.value;

        const saved = getSavedAccount();

        if (!saved) {

            showToast("Аккаунт не найден. Сначала зарегистрируйтесь.");

            showRegister();

            return;
        }

        if (
            name.toLowerCase() !== saved.name.toLowerCase() ||
            password !== saved.password
        ) {

            showToast("Неверное имя пользователя или пароль.");

            return;
        }

        account = saved;

        balance = Number(saved.balance || 10000);

        totalWin = Number(saved.totalWin || 0);

        gamesPlayed = Number(saved.gamesPlayed || 0);

        saveSession();

        enterApplication();

    });


    registerForm.addEventListener("submit", event => {

        event.preventDefault();

        const name = registerName.value.trim();
        const password = registerPassword.value;
        const password2 = registerPassword2.value;

        if (name.length < 3) {

            showToast("Имя должно содержать минимум 3 символа.");

            return;
        }

        if (password.length < 4) {

            showToast("Пароль должен содержать минимум 4 символа.");

            return;
        }

        if (password !== password2) {

            showToast("Пароли не совпадают.");

            return;
        }

        const saved = getSavedAccount();

        if (saved) {

            showToast("Аккаунт уже существует. Выполните вход.");

            showLogin();

            return;
        }

        account = {
            name,
            password,
            balance: 10000,
            totalWin: 0,
            gamesPlayed: 0
        };

        balance = 10000;

        totalWin = 0;

        gamesPlayed = 0;

        saveAccount();

        saveSession();

        registerForm.reset();

        showToast("Аккаунт создан. Добро пожаловать в VELORA.");

        setTimeout(() => {

            enterApplication();

        }, 1200);

    });

}


function showLogin() {

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

}


function showRegister() {

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

}


/* =========================================
   SESSION
========================================= */

function loadSession() {

    const session = localStorage.getItem(STORAGE_USER);

    if (!session) {

        showAuth();

        return;
    }

    const saved = getSavedAccount();

    if (!saved) {

        localStorage.removeItem(STORAGE_USER);

        showAuth();

        return;
    }

    account = saved;

    balance = Number(saved.balance || 10000);

    totalWin = Number(saved.totalWin || 0);

    gamesPlayed = Number(saved.gamesPlayed || 0);

    enterApplication();

}


function getSavedAccount() {

    try {

        const raw = localStorage.getItem(STORAGE_ACCOUNT);

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);

    } catch (error) {

        return null;

    }

}


function saveAccount() {

    if (!account) {
        return;
    }

    account.balance = balance;

    account.totalWin = totalWin;

    account.gamesPlayed = gamesPlayed;

    localStorage.setItem(
        STORAGE_ACCOUNT,
        JSON.stringify(account)
    );

}


function saveSession() {

    if (!account) {
        return;
    }

    localStorage.setItem(
        STORAGE_USER,
        account.name
    );

    saveAccount();

}


function clearSession() {

    localStorage.removeItem(STORAGE_USER);

}


function enterApplication() {

    authScreen.classList.add("hidden");

    mainApp.classList.remove("hidden");

    gameScreen.classList.add("hidden");

    updateUserUI();

    showPage("home");

}


function showAuth() {

    authScreen.classList.remove("hidden");

    mainApp.classList.add("hidden");

    gameScreen.classList.add("hidden");

}


function logout() {

    stopAuto();

    currentGame = null;

    clearSession();

    account = null;

    balance = 10000;

    totalWin = 0;

    gamesPlayed = 0;

    profileModal.classList.add("hidden");

    showAuth();

    showLogin();

    loginForm.reset();

}


/* =========================================
   USER UI
========================================= */

function updateUserUI() {

    const name = account?.name || "Игрок";

    profileName.textContent = name;

    profileModalName.textContent = name;

    headerBalance.textContent = formatNumber(balance);

    gameBalance.textContent = `${formatNumber(balance)} VC`;

    profileModalBalance.textContent =
        `${formatNumber(balance)} VC`;

    profileGamesPlayed.textContent =
        gamesPlayed.toString();

    profileTotalWin.textContent =
        `${formatNumber(totalWin)} VC`;

}


/* =========================================
   NAVIGATION
========================================= */

function setupNavigation() {

    document.querySelectorAll("[data-page]").forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            showPage(page);

        });

    });


    document.getElementById("brandButton")
        .addEventListener("click", () => {

            showPage("home");

        });

}


function showPage(pageName) {

    if (gameScreen && !gameScreen.classList.contains("hidden")) {

        gameScreen.classList.add("hidden");

    }

    document.querySelectorAll(".page").forEach(page => {

        page.classList.remove("active-page");

    });

    const page = document.getElementById(
        `page-${pageName}`
    );

    if (page) {

        page.classList.add("active-page");

    }

    document.querySelectorAll(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );

    });

    document.querySelectorAll(".mobile-nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   GAME CARDS
========================================= */

function buildGameCards() {

    const list = Object.values(games);

    featuredGames.innerHTML = "";

    allGames.innerHTML = "";

    list.forEach(game => {

        featuredGames.appendChild(
            createGameCard(game)
        );

        allGames.appendChild(
            createGameCard(game)
        );

    });

}


function createGameCard(game) {

    const article = document.createElement("article");

    article.className = "game-card";

    article.innerHTML = `

        <div class="game-visual ${game.visual}">

            <div class="game-logo-art">

                <div class="game-emblem">
                    ${game.emblem}
                </div>

                <div class="game-mini-title">
                    ${game.title}
                </div>

            </div>

        </div>

        <div class="game-card-info">

            <div class="game-card-top">

                <span class="original-badge">
                    ORIGINAL
                </span>

                <span class="game-type">
                    5 × 3
                </span>

            </div>

            <h3>
                ${game.title}
            </h3>

            <p>
                ${game.description}
            </p>

            <button
                class="primary-button play-game"
                data-game="${game.id}"
            >
                ИГРАТЬ
                <b>→</b>
            </button>

        </div>

    `;

    article
        .querySelector(".play-game")
        .addEventListener("click", () => {

            openGame(game.id);

        });

    return article;

}


/* =========================================
   GAME OPEN
========================================= */

function openGame(gameId) {

    const game = games[gameId];

    if (!game) {
        return;
    }

    currentGame = game;

    bet = Math.min(
        bet,
        Math.max(10, balance)
    );

    if (balance < 10) {

        showToast("Недостаточно виртуальных средств.");

        return;
    }

    gameTitle.textContent = game.title;

    gameCategory.textContent = game.category;

    machineGameName.textContent =
        game.title.toUpperCase();

    winAmount.textContent = "0 VC";

    gameMessage.textContent =
        "Сделайте ставку и нажмите SPIN";

    gameMessage.classList.remove("win");

    updateBetUI();

    renderInitialReels();

    gameScreen.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}


function closeCurrentGame() {

    stopAuto();

    gameScreen.classList.add("hidden");

    currentGame = null;

    showPage("games");

}


/* =========================================
   REELS
========================================= */

function renderInitialReels() {

    if (!currentGame) {
        return;
    }

    const reels = document.querySelectorAll(".reel");

    reels.forEach(reel => {

        const cells =
            reel.querySelectorAll(".symbol-cell");

        cells.forEach(cell => {

            const symbol =
                randomSymbol();

            setSymbolStyle(
                cell,
                symbol
            );

        });

    });

}


function randomSymbol() {

    if (!currentGame) {
        return "V";
    }

    const symbols = currentGame.symbols;

    return symbols[
        Math.floor(Math.random() * symbols.length)
    ];

}


function setSymbolStyle(cell, symbol) {

    cell.textContent = symbol;

    const index =
        currentGame.symbols.indexOf(symbol);

    const color =
        currentGame.colors[index] || "#ffffff";

    cell.style.color = color;

}


function generateMatrix() {

    const matrix = [];

    for (let reel = 0; reel < 5; reel++) {

        matrix[reel] = [];

        for (let row = 0; row < 3; row++) {

            matrix[reel][row] =
                randomSymbol();

        }

    }

    return matrix;

}


function renderMatrix(matrix) {

    const reels =
        document.querySelectorAll(".reel");

    reels.forEach((reel, reelIndex) => {

        const cells =
            reel.querySelectorAll(".symbol-cell");

        cells.forEach((cell, rowIndex) => {

            const symbol =
                matrix[reelIndex][rowIndex];

            setSymbolStyle(
                cell,
                symbol
            );

            cell.classList.remove("win");

        });

    });

}


/* =========================================
   SPIN
========================================= */

async function spin() {

    if (isSpinning || !currentGame) {
        return;
    }

    if (balance < bet) {

        stopAuto();

        showToast("Недостаточно виртуального баланса.");

        return;

    }

    isSpinning = true;

    spinButton.classList.add("spinning");

    spinButton.disabled = true;

    balance -= bet;

    gamesPlayed++;

    saveAccount();

    updateUserUI();

    const duration =
        turboMode ? 300 : 850;

    gameModeLabel.textContent =
        turboMode ? "TURBO" : "NORMAL";

    gameMessage.classList.remove("win");

    gameMessage.textContent =
        "Барабаны вращаются...";

    winAmount.textContent = "0 VC";

    const reels =
        document.querySelectorAll(".reel");

    reels.forEach(reel => {

        reel.classList.add("reel-spinning");

    });

    await animateReels(duration);

    const matrix =
        generateMatrix();

    renderMatrix(matrix);

    reels.forEach(reel => {

        reel.classList.remove("reel-spinning");

    });

    const result =
        calculateWin(matrix);

    if (result.win > 0) {

        balance += result.win;

        totalWin += result.win;

        winAmount.textContent =
            `${formatNumber(result.win)} VC`;

        gameMessage.textContent =
            `${result.message} +${formatNumber(result.win)} VC`;

        gameMessage.classList.add("win");

        highlightWin(result.symbol);

    } else {

        winAmount.textContent = "0 VC";

        gameMessage.textContent =
            "Попробуйте ещё раз";

    }

    saveAccount();

    updateUserUI();

    isSpinning = false;

    spinButton.classList.remove("spinning");

    spinButton.disabled = false;

    if (autoMode) {

        scheduleAutoSpin();

    }

}


/* =========================================
   REEL ANIMATION
========================================= */

function animateReels(duration) {

    return new Promise(resolve => {

        const start =
            performance.now();

        const reels =
            document.querySelectorAll(".reel");

        const interval =
            setInterval(() => {

                reels.forEach(reel => {

                    const cells =
                        reel.querySelectorAll(".symbol-cell");

                    cells.forEach(cell => {

                        setSymbolStyle(
                            cell,
                            randomSymbol()
                        );

                    });

                });

                if (
                    performance.now() - start
                    >= duration
                ) {

                    clearInterval(interval);

                    resolve();

                }

            }, turboMode ? 55 : 90);

    });

}


/* =========================================
   WIN CALCULATION
========================================= */

function calculateWin(matrix) {

    const rows = [0,1,2];

    let bestWin = 0;

    let bestSymbol = null;

    let message = "Небольшой выигрыш";

    rows.forEach(row => {

        const line = matrix.map(
            reel => reel[row]
        );

        const first = line[0];

        let count = 1;

        for (let i = 1; i < line.length; i++) {

            if (line[i] === first) {

                count++;

            } else {

                break;

            }

        }

        if (count >= 3) {

            const multiplier =
                currentGame.payouts[first] || 5;

            let win =
                bet * multiplier;

            if (count === 4) {

                win *= 2;

            }

            if (count === 5) {

                win *= 4;

            }

            if (win > bestWin) {

                bestWin = win;

                bestSymbol = first;

                if (count === 5) {

                    message = "MEGA WIN";

                } else if (count === 4) {

                    message = "BIG WIN";

                } else {

                    message = "WIN";

                }

            }

        }

    });


    /*
       Small random bonus to keep the demo
       entertaining, but always tied to
       virtual credits.
    */

    if (
        bestWin === 0 &&
        Math.random() < 0.12
    ) {

        bestWin =
            Math.round(bet * 1.5);

        bestSymbol =
            matrix[2][1];

        message = "BONUS WIN";

    }

    return {
        win: bestWin,
        symbol: bestSymbol,
        message
    };

}


/* =========================================
   HIGHLIGHT
========================================= */

function highlightWin(symbol) {

    if (!symbol) {
        return;
    }

    document
        .querySelectorAll(".symbol-cell")
        .forEach(cell => {

            if (cell.textContent === symbol) {

                cell.classList.add("win");

                setTimeout(() => {

                    cell.classList.remove("win");

                }, 1300);

            }

        });

}


/* =========================================
   BET CONTROLS
========================================= */

function setupGameControls() {

    closeGame.addEventListener(
        "click",
        closeCurrentGame
    );

    spinButton.addEventListener(
        "click",
        spin
    );

    betMinus.addEventListener(
        "click",
        decreaseBet
    );

    betPlus.addEventListener(
        "click",
        increaseBet
    );

    autoButton.addEventListener(
        "click",
        toggleAuto
    );

    turboButton.addEventListener(
        "click",
        toggleTurbo
    );

    soundButton.addEventListener(
        "click",
        toggleSound
    );

}


function decreaseBet() {

    const steps = [
        10,
        25,
        50,
        100,
        250,
        500,
        1000
    ];

    const index =
        steps.findIndex(
            value => value >= bet
        );

    if (index <= 0) {

        bet = steps[0];

    } else {

        bet = steps[index - 1];

    }

    updateBetUI();

}


function increaseBet() {

    const steps = [
        10,
        25,
        50,
        100,
        250,
        500,
        1000
    ];

    const index =
        steps.findIndex(
            value => value > bet
        );

    if (index === -1) {

        bet = steps[steps.length - 1];

    } else {

        bet = steps[index];

    }

    if (bet > balance && balance > 0) {

        bet = Math.max(
            10,
            Math.floor(balance / 10) * 10
        );

    }

    updateBetUI();

}


function updateBetUI() {

    betValue.textContent =
        formatNumber(bet);

    currentBetLabel.textContent =
        `${formatNumber(bet)} VC`;

}


/* =========================================
   AUTO
========================================= */

function toggleAuto() {

    autoMode = !autoMode;

    autoButton.classList.toggle(
        "active",
        autoMode
    );

    autoButton.querySelector("small").textContent =
        autoMode ? "ON" : "OFF";

    if (autoMode) {

        showToast("AUTO включён");

        if (!isSpinning) {
            scheduleAutoSpin();
        }

    } else {

        stopAuto();

        showToast("AUTO выключен");

    }

}


function scheduleAutoSpin() {

    clearTimeout(autoTimer);

    if (!autoMode) {
        return;
    }

    autoTimer = setTimeout(() => {

        if (!isSpinning) {

            if (balance >= bet) {

                spin();

            } else {

                stopAuto();

                showToast(
                    "AUTO остановлен: недостаточно средств."
                );

            }

        }

    }, turboMode ? 400 : 900);

}


function stopAuto() {

    autoMode = false;

    clearTimeout(autoTimer);

    autoTimer = null;

    autoButton.classList.remove("active");

    if (autoButton.querySelector("small")) {

        autoButton.querySelector("small").textContent =
            "OFF";

    }

}


/* =========================================
   TURBO
========================================= */

function toggleTurbo() {

    turboMode = !turboMode;

    turboButton.classList.toggle(
        "active",
        turboMode
    );

    turboButton.querySelector("small").textContent =
        turboMode ? "ON" : "OFF";

    gameModeLabel.textContent =
        turboMode ? "TURBO" : "NORMAL";

}


/* =========================================
   SOUND
========================================= */

function toggleSound() {

    soundOn = !soundOn;

    soundButton.textContent =
        soundOn ? "SOUND ON" : "SOUND OFF";

}


/* =========================================
   PROFILE
========================================= */

function setupProfile() {

    profileButton.addEventListener(
        "click",
        () => {

            updateUserUI();

            profileModal.classList.remove(
                "hidden"
            );

        }
    );

    closeProfile.addEventListener(
        "click",
        () => {

            profileModal.classList.add(
                "hidden"
            );

        }
    );

    profileLogout.addEventListener(
        "click",
        () => {

            logout();

        }
    );

    logoutButton.addEventListener(
        "click",
        logout
    );

    profileModal.addEventListener(
        "click",
        event => {

            if (
                event.target === profileModal
            ) {

                profileModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================
   PAYTABLE
========================================= */

function setupPaytable() {

    paytableButton.addEventListener(
        "click",
        openPaytable
    );

    closePaytable.addEventListener(
        "click",
        () => {

            paytableModal.classList.add(
                "hidden"
            );

        }
    );

    paytableModal.addEventListener(
        "click",
        event => {

            if (
                event.target === paytableModal
            ) {

                paytableModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


function openPaytable() {

    if (!currentGame) {
        return;
    }

    paytableContent.innerHTML = "";

    Object.entries(
        currentGame.payouts
    ).forEach(([symbol, multiplier]) => {

        const row =
            document.createElement("div");

        row.className =
            "paytable-row";

        row.innerHTML = `

            <span
                class="paytable-symbol"
                style="color:${getSymbolColor(symbol)}"
            >
                ${symbol}
            </span>

            <span class="paytable-name">
                3 символа подряд
            </span>

            <strong class="paytable-value">
                x${multiplier}
            </strong>

        `;

        paytableContent.appendChild(row);

    });

    paytableModal.classList.remove(
        "hidden"
    );

}


function getSymbolColor(symbol) {

    if (!currentGame) {
        return "#e8bd61";
    }

    const index =
        currentGame.symbols.indexOf(symbol);

    return currentGame.colors[index] || "#e8bd61";

}


/* =========================================
   SUPPORT
========================================= */

function setupSupport() {

    supportForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const message =
                document
                    .getElementById("supportMessage")
                    .value
                    .trim();

            if (!message) {

                showToast(
                    "Напишите сообщение."
                );

                return;

            }

            supportForm.reset();

            showToast(
                "Сообщение принято. Спасибо."
            );

        }
    );

}


/* =========================================
   TOAST
========================================= */

let toastTimer = null;

function showToast(message) {

    toastText.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================
   FORMAT
========================================= */

function formatNumber(value) {

    return Number(value).toLocaleString(
        "ru-RU"
    );

}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" &&
            !gameScreen.classList.contains("hidden")
        ) {

            event.preventDefault();

            spin();

        }

        if (
            event.key === "Escape"
        ) {

            if (
                !paytableModal.classList.contains(
                    "hidden"
                )
            ) {

                paytableModal.classList.add(
                    "hidden"
                );

            }

            if (
                !profileModal.classList.contains(
                    "hidden"
                )
            ) {

                profileModal.classList.add(
                    "hidden"
                );

            }

        }

    }
);


/* =========================================
   PREVENT ACCIDENTAL PAGE DRAG
========================================= */

document.addEventListener(
    "touchmove",
    event => {

        if (
            gameScreen &&
            !gameScreen.classList.contains("hidden")
        ) {

            /*
                Keep normal vertical scrolling,
                but prevent accidental browser
                overscroll on the slot area.
            */

            const target =
                event.target;

            if (
                target.closest(".reel-area")
            ) {

                event.preventDefault();

            }

        }

    },
    { passive: false }
);
```
