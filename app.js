/* =========================================================
   VELORA
   Original Virtual Casino Demo
   No external libraries required.
   GitHub Pages compatible.
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       STORAGE
    ===================================================== */

    const STORAGE_KEY = "velora_state_v3";

    const defaultState = {
        registered: false,
        loggedIn: false,
        user: null,
        balance: 10000,
        xp: 0,
        level: 1,
        welcomeClaimed: false,
        lastDailyBonus: null,
        totalSpins: 0,
        totalWins: 0
    };

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return { ...defaultState };
            }

            const parsed = JSON.parse(saved);

            return {
                ...defaultState,
                ...parsed
            };
        } catch (error) {
            console.warn("VELORA storage error:", error);
            return { ...defaultState };
        }
    }

    let state = loadState();

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    function formatNumber(number) {
        return Number(number || 0).toLocaleString("uk-UA", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    function formatMoney(number) {
        return Number(number || 0).toLocaleString("uk-UA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function todayKey() {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer = null;

    function showToast(title, message) {
        const toast = $("#toast");

        if (!toast) return;

        $("#toastTitle").textContent = title;
        $("#toastMessage").textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3500);
    }


    /* =====================================================
       BALANCE / PROFILE UI
    ===================================================== */

    function updateBalanceUI() {
        const balance = formatNumber(state.balance);

        const balanceValue = $("#balanceValue");
        const menuBalance = $("#menuBalance");
        const gameBalance = $("#gameBalance");

        if (balanceValue) {
            balanceValue.textContent = balance;
        }

        if (menuBalance) {
            menuBalance.textContent = balance;
        }

        if (gameBalance) {
            gameBalance.textContent = balance;
        }
    }

    function updateProfileUI() {

        const guestButtons = $("#guestButtons");
        const profileArea = $("#profileArea");

        if (!guestButtons || !profileArea) return;

        if (state.loggedIn && state.user) {

            guestButtons.classList.add("hidden");
            profileArea.classList.remove("hidden");

            const name = state.user.name || "Player";
            const letter = name.charAt(0).toUpperCase();

            $("#profileName").textContent = name;
            $("#menuName").textContent = name;
            $("#profileAvatar").textContent = letter;
            $("#menuAvatar").textContent = letter;

        } else {

            guestButtons.classList.remove("hidden");
            profileArea.classList.add("hidden");
        }

        updateBalanceUI();
        updateBonusUI();
    }


    /* =====================================================
       ROUTER
    ===================================================== */

    const validRoutes = [
        "home",
        "games",
        "bonuses",
        "support",
        "login",
        "register"
    ];

    function getRoute() {
        const hash = window.location.hash.replace("#", "").trim();

        if (!hash) {
            return "home";
        }

        return validRoutes.includes(hash) ? hash : "home";
    }

    function navigate(route) {
        window.location.hash = route;
    }

    function setActiveNavigation(route) {

        $$("[data-route]").forEach(link => {
            const linkRoute = link.dataset.route;

            link.classList.toggle(
                "active",
                linkRoute === route
            );
        });
    }

    function renderRoute() {

        const route = getRoute();

        $$(".page").forEach(page => {
            page.classList.remove("active");
        });

        const page = $("#page-" + route);

        if (page) {
            page.classList.add("active");
        }

        setActiveNavigation(route);

        $("#mobileNav")?.classList.remove("open");

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileMenuButton = $("#mobileMenuButton");
    const mobileNav = $("#mobileNav");

    mobileMenuButton?.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
    });


    /* =====================================================
       PROFILE MENU
    ===================================================== */

    $("#profileButton")?.addEventListener("click", (event) => {
        event.stopPropagation();

        $("#profileArea").classList.toggle("open");
    });

    document.addEventListener("click", (event) => {

        const profileArea = $("#profileArea");

        if (!profileArea) return;

        if (!profileArea.contains(event.target)) {
            profileArea.classList.remove("open");
        }
    });


    /* =====================================================
       WELCOME
    ===================================================== */

    const welcomeOverlay = $("#welcomeOverlay");

    function showWelcomeIfNeeded() {

        const alreadySeen =
            sessionStorage.getItem("velora_welcome_seen");

        if (!alreadySeen) {
            setTimeout(() => {
                welcomeOverlay?.classList.add("open");
            }, 900);
        }
    }

    $("#closeWelcome")?.addEventListener("click", () => {
        welcomeOverlay?.classList.remove("open");
        sessionStorage.setItem("velora_welcome_seen", "1");
    });

    $("#welcomePlay")?.addEventListener("click", () => {
        welcomeOverlay?.classList.remove("open");
        sessionStorage.setItem("velora_welcome_seen", "1");
    });

    welcomeOverlay?.addEventListener("click", (event) => {

        if (event.target === welcomeOverlay) {
            welcomeOverlay.classList.remove("open");
            sessionStorage.setItem("velora_welcome_seen", "1");
        }
    });


    /* =====================================================
       REGISTER
    ===================================================== */

    $("#registerForm")?.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = $("#registerName").value.trim();
        const email = $("#registerEmail").value.trim().toLowerCase();
        const password = $("#registerPassword").value;
        const terms = $("#registerTerms").checked;

        if (name.length < 2) {
            showToast("VELORA", "Ім'я повинно містити щонайменше 2 символи.");
            return;
        }

        if (password.length < 6) {
            showToast("VELORA", "Пароль повинен містити щонайменше 6 символів.");
            return;
        }

        if (!terms) {
            showToast("VELORA", "Потрібно погодитися з правилами.");
            return;
        }

        const submit = event.target.querySelector("button[type='submit']");

        submit.disabled = true;
        submit.innerHTML = "<strong>СТВОРЕННЯ...</strong>";

        await sleep(1400);

        state.registered = true;
        state.loggedIn = true;

        state.user = {
            name,
            email,
            password
        };

        state.balance = 10000;
        state.xp = 0;
        state.level = 1;
        state.welcomeClaimed = false;
        state.totalSpins = 0;
        state.totalWins = 0;

        saveState();

        submit.disabled = false;
        submit.innerHTML = "Створити акаунт <span>→</span>";

        updateProfileUI();

        showToast(
            "Профіль створено",
            "Ласкаво просимо до VELORA. Перенаправлення..."
        );

        await sleep(1600);

        navigate("games");
    });


    /* =====================================================
       LOGIN
    ===================================================== */

    $("#loginForm")?.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = $("#loginEmail").value.trim().toLowerCase();
        const password = $("#loginPassword").value;

        if (!state.registered || !state.user) {
            showToast(
                "VELORA",
                "Профіль ще не створений. Зареєструйся спочатку."
            );
            return;
        }

        if (
            email !== state.user.email ||
            password !== state.user.password
        ) {
            showToast(
                "Помилка входу",
                "Email або пароль введено неправильно."
            );
            return;
        }

        const submit = event.target.querySelector("button[type='submit']");

        submit.disabled = true;
        submit.innerHTML = "<strong>ВХІД...</strong>";

        await sleep(900);

        state.loggedIn = true;

        saveState();

        updateProfileUI();

        submit.disabled = false;
        submit.innerHTML = "Увійти <span>→</span>";

        showToast(
            "VELORA",
            "Вхід виконано успішно."
        );

        await sleep(700);

        navigate("home");
    });


    /* =====================================================
       LOGOUT
    ===================================================== */

    $("#logoutButton")?.addEventListener("click", () => {

        state.loggedIn = false;

        saveState();

        $("#profileArea")?.classList.remove("open");

        updateProfileUI();

        showToast(
            "VELORA",
            "Ти вийшов із профілю."
        );

        navigate("home");
    });


    /* =====================================================
       PASSWORD VISIBILITY
    ===================================================== */

    $$(".show-password").forEach(button => {

        button.addEventListener("click", () => {

            const target = $("#" + button.dataset.target);

            if (!target) return;

            if (target.type === "password") {

                target.type = "text";
                button.textContent = "HIDE";

            } else {

                target.type = "password";
                button.textContent = "SHOW";
            }
        });
    });


    /* =====================================================
       FORGOT PASSWORD
    ===================================================== */

    $("#forgotPassword")?.addEventListener("click", () => {

        showToast(
            "Демо-режим",
            "Відновлення пароля буде підключено після додавання backend."
        );
    });


    /* =====================================================
       BONUS SYSTEM
    ===================================================== */

    function updateBonusUI() {

        const progress = $("#levelProgress");
        const levelText = $("#levelText");
        const welcomeStatus = $("#welcomeStatus");
        const dailyStatus = $("#dailyStatus");

        if (!progress || !levelText) return;

        const xpForLevel = 1000;
        const xpInsideLevel = state.xp % xpForLevel;

        progress.style.width =
            Math.max(4, (xpInsideLevel / xpForLevel) * 100) + "%";

        levelText.textContent =
            `Рівень ${state.level} · ${state.xp} XP`;

        if (state.welcomeClaimed) {
            welcomeStatus.textContent = "Бонус уже отримано";
        } else {
            welcomeStatus.textContent = "Доступний один раз на акаунт";
        }

        const today = todayKey();

        if (state.lastDailyBonus === today) {
            dailyStatus.textContent = "Бонус уже отримано сьогодні";
        } else {
            dailyStatus.textContent = "Доступний сьогодні";
        }
    }

    $("#claimWelcome")?.addEventListener("click", () => {

        if (state.welcomeClaimed) {
            showToast(
                "VELORA",
                "Стартовий бонус уже було отримано."
            );
            return;
        }

        state.balance += 10000;
        state.welcomeClaimed = true;

        saveState();

        updateBalanceUI();
        updateBonusUI();

        showToast(
            "+10 000 VC",
            "Стартовий бонус додано до балансу."
        );
    });


    $("#dailyBonus")?.addEventListener("click", () => {

        const today = todayKey();

        if (state.lastDailyBonus === today) {
            showToast(
                "VELORA",
                "Сьогоднішній бонус уже отримано."
            );
            return;
        }

        state.balance += 500;
        state.lastDailyBonus = today;

        saveState();

        updateBalanceUI();
        updateBonusUI();

        showToast(
            "+500 VC",
            "Щоденний бонус додано."
        );
    });


    /* =====================================================
       SUPPORT FORM
    ===================================================== */

    $("#supportForm")?.addEventListener("submit", (event) => {

        event.preventDefault();

        const name = $("#supportName").value.trim();
        const email = $("#supportEmail").value.trim();
        const message = $("#supportMessage").value.trim();

        if (!name || !email || !message) {
            showToast(
                "VELORA",
                "Заповни всі необхідні поля."
            );
            return;
        }

        event.target.reset();

        showToast(
            "Повідомлення створено",
            "У демо-версії воно не надсилається на сервер."
        );
    });


    /* =====================================================
       GAME DATA
    ===================================================== */

    const games = {

        candy: {
            title: "Candy Kingdom",
            logo: "CANDY",
            sub: "KINGDOM",
            description:
                "Каскадні комбінації у солодкому королівстві.",
            reels: 5,
            rows: 5,
            maxWin: 5000,
            baseWinChance: .37,
            symbols: [
                {
                    id: "crown",
                    name: "Royal Crown",
                    color: "#e5bd50",
                    multiplier: 8
                },
                {
                    id: "heart",
                    name: "Ruby Heart",
                    color: "#ed6d7b",
                    multiplier: 6
                },
                {
                    id: "star",
                    name: "Golden Star",
                    color: "#f5d66d",
                    multiplier: 5
                },
                {
                    id: "candy",
                    name: "Blue Candy",
                    color: "#69bdf1",
                    multiplier: 4
                },
                {
                    id: "berry",
                    name: "Berry",
                    color: "#bd70e5",
                    multiplier: 3
                },
                {
                    id: "mint",
                    name: "Mint",
                    color: "#64d7a2",
                    multiplier: 2
                }
            ]
        },

        olympus: {
            title: "Olympus Fate",
            logo: "OLYMPUS",
            sub: "FATE",
            description:
                "Містичний світ богів та великих множників.",
            reels: 6,
            rows: 5,
            maxWin: 5000,
            baseWinChance: .29,
            symbols: [
                {
                    id: "bolt",
                    name: "Thunder",
                    color: "#7fd7ff",
                    multiplier: 12
                },
                {
                    id: "sun",
                    name: "Solar Crown",
                    color: "#f2c85f",
                    multiplier: 9
                },
                {
                    id: "gem",
                    name: "Divine Gem",
                    color: "#bf8bff",
                    multiplier: 7
                },
                {
                    id: "helm",
                    name: "Warrior Helm",
                    color: "#aeb7c2",
                    multiplier: 5
                },
                {
                    id: "eye",
                    name: "Oracle Eye",
                    color: "#62d6b5",
                    multiplier: 4
                },
                {
                    id: "ring",
                    name: "Golden Ring",
                    color: "#e9ad51",
                    multiplier: 3
                }
            ]
        },

        jungle: {
            title: "Jungle Fortune",
            logo: "JUNGLE",
            sub: "FORTUNE",
            description:
                "Дикі символи, скарби та джунглеві множники.",
            reels: 6,
            rows: 4,
            maxWin: 3000,
            baseWinChance: .32,
            symbols: [
                {
                    id: "idol",
                    name: "Golden Idol",
                    color: "#e2b84d",
                    multiplier: 10
                },
                {
                    id: "mask",
                    name: "Jungle Mask",
                    color: "#72d7a2",
                    multiplier: 8
                },
                {
                    id: "ruby",
                    name: "Red Ruby",
                    color: "#e66e64",
                    multiplier: 6
                },
                {
                    id: "leaf",
                    name: "Emerald Leaf",
                    color: "#57bd7a",
                    multiplier: 5
                },
                {
                    id: "sun",
                    name: "Sun Stone",
                    color: "#e8c45e",
                    multiplier: 4
                },
                {
                    id: "coin",
                    name: "Ancient Coin",
                    color: "#cda154",
                    multiplier: 3
                }
            ]
        }
    };


    let currentGame = null;
    let currentGameKey = "candy";

    let currentBet = 50;
    const betSteps = [
        10,
        25,
        50,
        100,
        250,
        500
    ];

    let autoMode = false;
    let turboMode = false;
    let spinning = false;
    let autoTimer = null;


    /* =====================================================
       GAME DOM
    ===================================================== */

    const gameModal = $("#gameModal");
    const reelsContainer = $("#reels");
    const gameStage = $("#gameStage");

    function openGame(gameKey) {

        const game = games[gameKey];

        if (!game) return;

        currentGame = game;
        currentGameKey = gameKey;

        autoMode = false;
        turboMode = false;

        clearTimeout(autoTimer);

        $("#autoButton")?.classList.remove("active");
        $("#turboButton")?.classList.remove("active");

        $("#autoText").textContent = "OFF";
        $("#turboText").textContent = "OFF";

        $("#gameTitle").textContent = game.title;
        $("#gameLogoTitle").textContent = game.logo;
        $("#gameLogoSub").textContent = game.sub;

        gameStage.classList.remove(
            "candy",
            "olympus",
            "jungle"
        );

        gameStage.classList.add(gameKey);

        $("#winAmount").textContent = "0.00";

        buildReels();

        updateBalanceUI();

        gameModal.classList.add("open");
        document.body.classList.add("modal-open");

        setTimeout(() => {
            $("#gameMessage").textContent =
                "Вибери ставку та натисни SPIN";
        }, 100);
    }


    function closeGame() {

        autoMode = false;

        clearTimeout(autoTimer);

        gameModal.classList.remove("open");
        document.body.classList.remove("modal-open");

        spinning = false;
    }


    $("#closeGame")?.addEventListener("click", closeGame);

    gameModal?.addEventListener("click", (event) => {

        if (event.target === gameModal) {
            closeGame();
        }
    });


    /* =====================================================
       BUILD REELS
    ===================================================== */

    function buildReels() {

        if (!currentGame || !reelsContainer) return;

        const reels = currentGame.reels;
        const rows = currentGame.rows;

        reelsContainer.innerHTML = "";

        for (let column = 0; column < reels; column++) {

            const reel = document.createElement("div");

            reel.className = "reel";

            for (let row = 0; row < rows; row++) {

                const symbol = document.createElement("div");

                symbol.className = "symbol";

                setRandomSymbol(symbol);

                reel.appendChild(symbol);
            }

            reelsContainer.appendChild(reel);
        }

        if (reels === 5) {
            reelsContainer.style.gridTemplateColumns =
                "repeat(5, 1fr)";
        } else {
            reelsContainer.style.gridTemplateColumns =
                "repeat(6, 1fr)";
        }
    }


    function setRandomSymbol(element) {

        const symbol =
            currentGame.symbols[
                randomInt(0, currentGame.symbols.length - 1)
            ];

        element.dataset.symbol =
            getSymbolLetter(symbol.id);

        element.style.setProperty(
            "--symbol-color",
            symbol.color
        );

        element.dataset.id = symbol.id;
        element.title = symbol.name;
    }


    function getSymbolLetter(id) {

        const map = {
            crown: "C",
            heart: "H",
            star: "S",
            candy: "D",
            berry: "B",
            mint: "M",

            bolt: "Z",
            sun: "S",
            gem: "G",
            helm: "H",
            eye: "E",
            ring: "R",

            idol: "I",
            mask: "M",
            ruby: "R",
            leaf: "L",
            coin: "C"
        };

        return map[id] || "V";
    }


    /* =====================================================
       BET
    ===================================================== */

    function updateBetUI() {

        $("#betValue").textContent = formatNumber(currentBet);
        $("#spinCost").textContent =
            formatNumber(currentBet) + " VC";
    }

    function changeBet(direction) {

        const currentIndex = betSteps.indexOf(currentBet);

        let nextIndex =
            currentIndex + direction;

        nextIndex = Math.max(
            0,
            Math.min(
                betSteps.length - 1,
                nextIndex
            )
        );

        currentBet = betSteps[nextIndex];

        updateBetUI();
    }

    $("#betMinus")?.addEventListener("click", () => {
        changeBet(-1);
    });

    $("#betPlus")?.addEventListener("click", () => {
        changeBet(1);
    });


    /* =====================================================
       SPIN
    ===================================================== */

    $("#spinButton")?.addEventListener("click", () => {
        spin();
    });


    async function spin() {

        if (spinning) return;

        if (!currentGame) return;

        if (state.balance < currentBet) {

            showToast(
                "Недостатньо VC",
                "Зменш ставку або отримай бонус."
            );

            autoMode = false;
            clearTimeout(autoTimer);

            return;
        }

        spinning = true;

        state.balance -= currentBet;
        state.totalSpins++;

        saveState();
        updateBalanceUI();

        $("#spinButton").disabled = true;

        $("#gameMessage").textContent =
            "Обертання...";

        $("#winAmount").textContent = "0.00";

        clearWinState();

        reelsContainer.classList.add("spinning");

        const spinDuration =
            turboMode ? 550 : 1050;

        await animateReels(spinDuration);

        reelsContainer.classList.remove("spinning");

        const result = generateResult();

        applyResult(result);

        spinning = false;

        $("#spinButton").disabled = false;

        if (autoMode) {

            autoTimer = setTimeout(() => {

                if (autoMode) {
                    spin();
                }

            }, turboMode ? 350 : 900);
        }
    }


    async function animateReels(duration) {

        const reelElements =
            $$(".reel", reelsContainer);

        const start =
            performance.now();

        return new Promise(resolve => {

            function frame(now) {

                const elapsed = now - start;

                reelElements.forEach((reel, index) => {

                    const symbols =
                        [...reel.children];

                    symbols.forEach(symbol => {

                        if (
                            Math.random() <
                            (turboMode ? .65 : .35)
                        ) {
                            setRandomSymbol(symbol);
                        }
                    });

                    reel.style.transform =
                        `translateY(${Math.sin(
                            elapsed / 40 + index
                        ) * 2}px)`;
                });

                if (elapsed < duration) {

                    requestAnimationFrame(frame);

                } else {

                    reelElements.forEach(reel => {
                        reel.style.transform = "";
                    });

                    resolve();
                }
            }

            requestAnimationFrame(frame);
        });
    }


    /* =====================================================
       RESULT GENERATOR
    ===================================================== */

    function generateResult() {

        const reels =
            [...reelsContainer.querySelectorAll(".reel")];

        const result = [];

        reels.forEach(reel => {

            const column = [];

            [...reel.children].forEach(symbolElement => {

                setRandomSymbol(symbolElement);

                column.push({
                    id: symbolElement.dataset.id,
                    element: symbolElement
                });
            });

            result.push(column);
        });

        let win = 0;
        let winningElements = [];

        const winChance =
            currentGame.baseWinChance;

        if (Math.random() < winChance) {

            const targetSymbol =
                currentGame.symbols[
                    randomInt(
                        0,
                        currentGame.symbols.length - 1
                    )
                ];

            const positions = [];

            result.forEach((column, columnIndex) => {

                column.forEach((cell, rowIndex) => {

                    if (
                        cell.id === targetSymbol.id &&
                        Math.random() < .55
                    ) {
                        positions.push({
                            columnIndex,
                            rowIndex,
                            element: cell.element
                        });
                    }
                });
            });

            if (positions.length >= 3) {

                const chosen =
                    positions.slice(
                        0,
                        Math.min(
                            positions.length,
                            randomInt(3, 8)
                        )
                    );

                winningElements =
                    chosen.map(item => item.element);

                const base =
                    currentBet *
                    targetSymbol.multiplier *
                    (chosen.length - 2);

                const multiplier =
                    currentGameKey === "olympus"
                        ? random(1, 2.2)
                        : currentGameKey === "jungle"
                            ? random(1, 1.8)
                            : random(1, 1.6);

                win =
                    Math.min(
                        currentGame.maxWin * currentBet,
                        base * multiplier
                    );
            }
        }

        /*
           Невелика компенсація нульових раундів,
           щоб демо-гра не відчувалась повністю порожньою.
        */

        if (
            win <= 0 &&
            state.totalSpins % 7 === 0 &&
            Math.random() < .6
        ) {

            const symbol =
                currentGame.symbols[
                    randomInt(
                        0,
                        currentGame.symbols.length - 1
                    )
                ];

            const targetElements = [];

            result.forEach(column => {

                column.forEach(cell => {

                    if (
                        cell.id === symbol.id &&
                        targetElements.length < 3
                    ) {
                        targetElements.push(cell.element);
                    }
                });
            });

            if (targetElements.length >= 3) {

                winningElements = targetElements;

                win =
                    currentBet *
                    symbol.multiplier;
            }
        }

        return {
            win,
            winningElements
        };
    }


    /* =====================================================
       APPLY RESULT
    ===================================================== */

    async function applyResult(result) {

        const win =
            Number(result.win || 0);

        if (result.winningElements.length > 0) {

            result.winningElements.forEach(element => {
                element.classList.add("win");
            });

            $(".win-lines")?.classList.add("active");

            createParticles(
                result.winningElements.length
            );

            await sleep(550);

            state.balance += win;
            state.totalWins++;

            const xpGain =
                Math.max(
                    10,
                    Math.floor(win / 10)
                );

            addXP(xpGain);

            saveState();

            updateBalanceUI();

            animateWinNumber(
                0,
                win,
                500
            );

            $("#gameMessage").textContent =
                `WIN! +${formatMoney(win)} VC`;

            if (win >= currentBet * 20) {

                showToast(
                    "BIG WIN",
                    `Ти виграв ${formatMoney(win)} VC`
                );

            } else {

                showToast(
                    "WIN",
                    `+${formatMoney(win)} VC`
                );
            }

        } else {

            $("#winAmount").textContent = "0.00";

            $("#gameMessage").textContent =
                "Цього разу без виграшу. Спробуй ще раз.";

            clearWinState();
        }
    }


    function animateWinNumber(from, to, duration) {

        const element = $("#winAmount");

        if (!element) return;

        const start =
            performance.now();

        function update(now) {

            const progress =
                Math.min(
                    1,
                    (now - start) / duration
                );

            const eased =
                1 - Math.pow(1 - progress, 3);

            const value =
                from + (to - from) * eased;

            element.textContent =
                formatMoney(value);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }


    function clearWinState() {

        $$(".symbol.win").forEach(element => {
            element.classList.remove("win");
        });

        $(".win-lines")?.classList.remove("active");
    }


    function createParticles(amount) {

        const container =
            $("#gameParticles");

        if (!container) return;

        for (
            let i = 0;
            i < Math.min(amount * 3, 24);
            i++
        ) {

            const particle =
                document.createElement("i");

            particle.className = "particle";

            particle.style.left =
                random(35, 65) + "%";

            particle.style.top =
                random(40, 65) + "%";

            particle.style.setProperty(
                "--x",
                random(-180, 180) + "px"
            );

            particle.style.setProperty(
                "--y",
                random(-180, -40) + "px"
            );

            container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 1100);
        }
    }


    /* =====================================================
       XP / LEVEL
    ===================================================== */

    function addXP(amount) {

        state.xp += amount;

        const calculatedLevel =
            Math.floor(state.xp / 1000) + 1;

        if (
            calculatedLevel >
            state.level
        ) {

            state.level =
                calculatedLevel;

            showToast(
                "NEW LEVEL",
                `Ти досяг рівня ${state.level}.`
            );
        }

        updateBonusUI();
    }


    /* =====================================================
       AUTO
    ===================================================== */

    $("#autoButton")?.addEventListener("click", () => {

        autoMode = !autoMode;

        $("#autoButton")
            .classList.toggle(
                "active",
                autoMode
            );

        $("#autoText").textContent =
            autoMode ? "ON" : "OFF";

        if (autoMode) {

            showToast(
                "AUTO SPIN",
                "Автоматичні обертання увімкнено."
            );

            if (!spinning) {
                spin();
            }

        } else {

            clearTimeout(autoTimer);

            showToast(
                "AUTO SPIN",
                "Автоматичні обертання вимкнено."
            );
        }
    });


    /* =====================================================
       TURBO
    ===================================================== */

    $("#turboButton")?.addEventListener("click", () => {

        turboMode = !turboMode;

        $("#turboButton")
            .classList.toggle(
                "active",
                turboMode
            );

        $("#turboText").textContent =
            turboMode ? "ON" : "OFF";

        showToast(
            "TURBO",
            turboMode
                ? "Швидкий режим увімкнено."
                : "Швидкий режим вимкнено."
        );
    });


    /* =====================================================
       PAYTABLE
    ===================================================== */

    $("#paytableButton")?.addEventListener("click", () => {

        if (!currentGame) return;

        $("#paytableTitle").textContent =
            currentGame.title;

        $("#paytableDescription").textContent =
            currentGame.description;

        const list =
            $("#paytableList");

        list.innerHTML = "";

        currentGame.symbols.forEach(symbol => {

            const row =
                document.createElement("div");

            row.className = "pay-row";

            row.innerHTML = `
                <div class="pay-symbols">
                    <div class="pay-symbol">
                        ${getSymbolLetter(symbol.id)}
                    </div>
                    <div class="pay-symbol">
                        ${getSymbolLetter(symbol.id)}
                    </div>
                    <div class="pay-symbol">
                        ${getSymbolLetter(symbol.id)}
                    </div>
                </div>

                <div class="pay-name">
                    <strong>${symbol.name}</strong>
                    <small>3+ SYMBOLS</small>
                </div>

                <div class="pay-value">
                    ×${symbol.multiplier}
                </div>
            `;

            list.appendChild(row);
        });

        $("#paytableModal").classList.add("open");
    });


    $("#closePaytable")?.addEventListener("click", () => {

        $("#paytableModal").classList.remove("open");
    });


    $("#paytableModal")?.addEventListener("click", event => {

        if (
            event.target ===
            $("#paytableModal")
        ) {
            $("#paytableModal")
                .classList.remove("open");
        }
    });


    /* =====================================================
       GAME OPEN BUTTONS
    ===================================================== */

    $$("[data-game]").forEach(button => {

        button.addEventListener("click", event => {

            const key =
                event.currentTarget.dataset.game;

            openGame(key);
        });
    });


    /* =====================================================
       GAME FILTER
    ===================================================== */

    $$(".filter").forEach(button => {

        button.addEventListener("click", () => {

            $$(".filter").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            const filter =
                button.dataset.filter;

            $$(".game-tile").forEach(tile => {

                const volatility =
                    tile.dataset.volatility;

                if (
                    filter === "all" ||
                    volatility === filter
                ) {

                    tile.style.display = "";

                } else {

                    tile.style.display = "none";
                }
            });
        });
    });


    /* =====================================================
       KEYBOARD
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            if (
                $("#paytableModal")
                    ?.classList.contains("open")
            ) {
                $("#paytableModal")
                    .classList.remove("open");
                return;
            }

            if (
                gameModal
                    ?.classList.contains("open")
            ) {
                closeGame();
            }
        }

        if (
            event.code === "Space" &&
            gameModal?.classList.contains("open")
        ) {

            event.preventDefault();

            if (!spinning) {
                spin();
            }
        }
    });


    /* =====================================================
       ROUTER EVENT
    ===================================================== */

    window.addEventListener(
        "hashchange",
        renderRoute
    );


    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        updateBalanceUI();
        updateProfileUI();
        updateBonusUI();

        updateBetUI();

        renderRoute();

        showWelcomeIfNeeded();

        /*
           Если користувач уже має профіль,
           відкриваємо його стан автоматично.
        */

        if (state.loggedIn) {
            updateProfileUI();
        }
    }

    init();

})();