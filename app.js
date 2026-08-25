/* =========================================================
   VELORA
   Main application logic
   Demo / virtual currency version
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const STORAGE_KEY = "velora_user";

const DEFAULT_USER = {
    logged: false,
    name: "",
    email: "",
    balance: 1000,
    bonus: 0
};


/* =========================================================
   STATE
========================================================= */

let user = loadUser();

let currentPage = "home";

let authMode = "login";

let currentGame = null;

let toastTimer = null;


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


/* =========================================================
   USER STORAGE
========================================================= */

function loadUser() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return { ...DEFAULT_USER };
        }

        const parsed = JSON.parse(saved);

        return {
            ...DEFAULT_USER,
            ...parsed
        };

    } catch (error) {

        console.error("VELORA storage error:", error);

        return { ...DEFAULT_USER };
    }
}


function saveUser() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(user)
    );
}


function clearUser() {
    user = {
        ...DEFAULT_USER
    };

    saveUser();
}


/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initNavigation();

    initAuth();

    initGames();

    initSupport();

    initButtons();

    updateInterface();

    showPage("home");

});


/* =========================================================
   NAVIGATION
========================================================= */

function initNavigation() {

    $$(".nav-link").forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page ||
                button.getAttribute("data-page");

            if (page) {
                showPage(page);
            }

        });

    });


    $$(".mobile-nav-item").forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page ||
                button.getAttribute("data-page");

            if (page) {
                showPage(page);
            }

        });

    });


    $$("[data-open-page]").forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.openPage;

            if (page) {
                showPage(page);
            }

        });

    });

}


function showPage(page) {

    const target =
        document.getElementById(page) ||
        document.querySelector(`[data-page-content="${page}"]`);

    if (!target) {
        console.warn(
            `VELORA: page "${page}" not found`
        );

        return;
    }

    currentPage = page;


    $$(".page").forEach(section => {
        section.classList.remove("active");
    });


    target.classList.add("active");


    $$(".nav-link").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });


    $$(".mobile-nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   AUTH
========================================================= */

function initAuth() {

    $$("[data-auth]").forEach(button => {

        button.addEventListener("click", () => {

            const mode =
                button.dataset.auth;

            openAuth(mode || "login");

        });

    });


    const closeButton =
        $(".modal-close");

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAuth
        );

    }


    const backdrop =
        $(".modal-backdrop");

    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeAuth
        );

    }


    const form =
        $("#authForm");

    if (form) {

        form.addEventListener(
            "submit",
            handleAuth
        );

    }


    const switchButton =
        $(".modal-switch");

    if (switchButton) {

        switchButton.addEventListener(
            "click",
            () => {

                openAuth(
                    authMode === "login"
                        ? "register"
                        : "login"
                );

            }
        );

    }

}


function openAuth(mode = "login") {

    authMode = mode;

    const modal =
        $("#authModal") ||
        $(".modal");

    if (!modal) return;

    modal.classList.add("show");

    updateAuthModal();

}


function closeAuth() {

    const modal =
        $("#authModal") ||
        $(".modal");

    if (!modal) return;

    modal.classList.remove("show");

}


function updateAuthModal() {

    const title =
        $("#authTitle");

    const description =
        $("#authDescription");

    const submit =
        $("#authSubmit");

    const switchButton =
        $(".modal-switch");

    const nameField =
        $("#nameField");

    if (authMode === "register") {

        if (title) {
            title.textContent =
                "Створити акаунт";
        }

        if (description) {
            description.textContent =
                "Приєднуйтесь до VELORA та відкрийте ігровий простір.";
        }

        if (submit) {
            submit.textContent =
                "Створити акаунт";
        }

        if (switchButton) {
            switchButton.textContent =
                "Вже маєте акаунт? Увійти";
        }

        if (nameField) {
            nameField.style.display =
                "flex";
        }

    } else {

        if (title) {
            title.textContent =
                "Вхід";
        }

        if (description) {
            description.textContent =
                "Раді бачити вас знову у VELORA.";
        }

        if (submit) {
            submit.textContent =
                "Увійти";
        }

        if (switchButton) {
            switchButton.textContent =
                "Немає акаунта? Реєстрація";
        }

        if (nameField) {
            nameField.style.display =
                "none";
        }

    }

}


function handleAuth(event) {

    event.preventDefault();

    const email =
        $("#email")?.value.trim();

    const password =
        $("#password")?.value.trim();

    const name =
        $("#name")?.value.trim();


    if (!email || !password) {

        showToast(
            "Заповніть усі необхідні поля."
        );

        return;
    }


    if (authMode === "register") {

        if (!name) {

            showToast(
                "Введіть ваше ім'я."
            );

            return;
        }


        user = {
            logged: true,
            name,
            email,
            balance: 1000,
            bonus: 0
        };

        saveUser();


        closeAuth();


        showToast(
            "Акаунт створено. Ласкаво просимо до VELORA!"
        );


        /*
         * Невелика пауза робить перехід
         * більш природним.
         */

        setTimeout(() => {

            updateInterface();

            showPage("home");

        }, 3500);


    } else {

        /*
         * У демо-версії вхід перевіряє,
         * чи існує локальний акаунт.
         */

        if (
            user.email &&
            user.email !== email
        ) {

            showToast(
                "У демо-версії введіть email, з яким створено акаунт."
            );

            return;
        }


        if (!user.email) {

            showToast(
                "Спочатку створіть акаунт."
            );

            return;
        }


        user.logged = true;

        saveUser();

        closeAuth();

        updateInterface();

        showToast(
            "Ви успішно увійшли до VELORA."
        );

    }

}


/* =========================================================
   INTERFACE
========================================================= */

function updateInterface() {

    updateBalance();

    updateProfile();

    updateAuthButtons();

}


function updateBalance() {

    const formatted =
        Number(user.balance || 0)
            .toLocaleString(
                "uk-UA",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


    $$("#balance").forEach(element => {

        element.textContent =
            formatted;

    });


    $$(".user-balance").forEach(element => {

        element.textContent =
            formatted;

    });

}


function updateProfile() {

    const name =
        user.name ||
        "Гість";

    const email =
        user.email ||
        "Акаунт не створено";


    $$("#profileName").forEach(element => {

        element.textContent =
            name;

    });


    $$("#profileEmail").forEach(element => {

        element.textContent =
            email;

    });


    $$("#profileInitial").forEach(element => {

        element.textContent =
            name.charAt(0).toUpperCase();

    });

}


function updateAuthButtons() {

    const loginButtons =
        $$("[data-auth='login']");

    const registerButtons =
        $$("[data-auth='register']");

    const profileButtons =
        $$("[data-page='profile']");


    if (user.logged) {

        loginButtons.forEach(button => {
            button.classList.add("hidden");
        });

        registerButtons.forEach(button => {
            button.classList.add("hidden");
        });

        profileButtons.forEach(button => {
            button.classList.remove("hidden");
        });

    } else {

        loginButtons.forEach(button => {
            button.classList.remove("hidden");
        });

        registerButtons.forEach(button => {
            button.classList.remove("hidden");
        });

        profileButtons.forEach(button => {
            button.classList.add("hidden");
        });

    }

}


/* =========================================================
   GAMES
========================================================= */

function initGames() {

    $$("[data-game]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const game =
                    button.dataset.game;

                openGame(game);

            }
        );

    });


    const backButton =
        $(".game-back");

    if (backButton) {

        backButton.addEventListener(
            "click",
            closeGame
        );

    }

}


function openGame(gameName) {

    currentGame = gameName;


    const modal =
        $("#gameModal") ||
        $(".game-modal");

    if (!modal) {

        showToast(
            "Ігровий модуль ще не підключено."
        );

        return;
    }


    modal.classList.add("show");


    const title =
        $(".game-header-title");

    if (title) {

        title.textContent =
            getGameTitle(gameName);

    }


    renderGame(gameName);

}


function closeGame() {

    const modal =
        $("#gameModal") ||
        $(".game-modal");

    if (!modal) return;

    modal.classList.remove("show");

    currentGame = null;

}


function getGameTitle(game) {

    const titles = {

        gorila:
            "GORILA KING",

        candy:
            "CANDY DREAMS",

        pirate:
            "GOLDEN PIRATE"

    };

    return (
        titles[game] ||
        "VELORA GAME"
    );

}


function renderGame(game) {

    const container =
        $("#gameContainer") ||
        $(".game-container");

    if (!container) return;


    /*
     * Тут поки створюється ігрове полотно.
     *
     * Наступним етапом ми зробимо для кожної гри
     * окрему повноцінну графічну сцену.
     */

    container.innerHTML = "";


    const scene =
        document.createElement("div");

    scene.className =
        `velora-game-scene game-${game || "default"}`;


    const title =
        document.createElement("div");

    title.className =
        "game-scene-title";

    title.textContent =
        getGameTitle(game);


    const subtitle =
        document.createElement("div");

    subtitle.className =
        "game-scene-subtitle";

    subtitle.textContent =
        "Ігрова сцена VELORA";


    scene.appendChild(title);

    scene.appendChild(subtitle);

    container.appendChild(scene);


    /*
     * Для першого тесту.
     * Реальна механіка кожної гри буде
     * окремою функцією, а не одним шаблоном.
     */

    createDemoControls(
        scene,
        game
    );

}


function createDemoControls(
    scene,
    game
) {

    const controls =
        document.createElement("div");

    controls.className =
        "game-controls";


    const play =
        document.createElement("button");

    play.className =
        "primary-button";

    play.textContent =
        "ГРАТИ";


    play.addEventListener(
        "click",
        () => {

            playVirtualRound(game);

        }
    );


    controls.appendChild(play);

    scene.appendChild(controls);

}


/* =========================================================
   VIRTUAL GAME ROUND
========================================================= */

function playVirtualRound(game) {

    const cost = 10;


    if (!user.logged) {

        closeGame();

        openAuth("register");

        showToast(
            "Створіть акаунт, щоб продовжити."
        );

        return;
    }


    if (user.balance < cost) {

        showToast(
            "Недостатньо віртуального балансу."
        );

        return;
    }


    user.balance -= cost;


    /*
     * Демо-результат.
     *
     * Це не реальні гроші і не підключено
     * до платежів або ставок.
     */

    const roll =
        Math.random();


    let reward = 0;


    if (roll > 0.94) {

        reward = 100;

    } else if (roll > 0.78) {

        reward = 35;

    } else if (roll > 0.55) {

        reward = 15;

    }


    user.balance += reward;

    saveUser();

    updateInterface();


    if (reward > 0) {

        showToast(
            `Виграш у демо: +${reward}`
        );

    } else {

        showToast(
            "Спроба завершена. Спробуйте ще раз."
        );

    }

}


/* =========================================================
   SUPPORT
========================================================= */

function initSupport() {

    const form =
        $("#supportForm") ||
        $(".support-form");

    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                form.querySelector(
                    "[name='name']"
                )?.value.trim();


            const email =
                form.querySelector(
                    "[name='email']"
                )?.value.trim();


            const message =
                form.querySelector(
                    "[name='message']"
                )?.value.trim();


            if (
                !name ||
                !email ||
                !message
            ) {

                showToast(
                    "Будь ласка, заповніть форму."
                );

                return;
            }


            /*
             * Зараз повідомлення лише
             * імітується локально.
             *
             * Після підключення backend
             * тут можна буде відправляти
             * звернення на сервер.
             */

            showToast(
                "Звернення прийнято. Підтримка зв'яжеться з вами."
            );


            form.reset();

        }
    );

}


/* =========================================================
   GENERAL BUTTONS
========================================================= */

function initButtons() {

    $$("[data-close-game]").forEach(button => {

        button.addEventListener(
            "click",
            closeGame
        );

    });


    $$("[data-logout]").forEach(button => {

        button.addEventListener(
            "click",
            logout
        );

    });


    $$("[data-scroll-top]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    });

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    user.logged = false;

    saveUser();

    updateInterface();

    showPage("home");

    showToast(
        "Ви вийшли з акаунта."
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    let toast =
        $("#toast") ||
        $(".toast");


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "toast";

        toast.className =
            "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3200
        );

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeAuth();

            closeGame();

        }

    }
);


/* =========================================================
   PREVENT ACCIDENTAL FORM SUBMISSION
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            event.target.tagName !== "TEXTAREA"
        ) {

            const form =
                event.target.closest("form");

            if (
                form &&
                event.target.type !== "submit"
            ) {

                event.preventDefault();

            }

        }

    }
);


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "%cVELORA",
    "font-size:28px;font-weight:900;"
);

console.log(
    "VELORA application initialized."
);