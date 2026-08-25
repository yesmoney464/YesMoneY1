"use strict";

const KEY = "velora_account";

let user = JSON.parse(localStorage.getItem(KEY) || "null");

let authMode = "register";
let toastTimer = null;

const games = {
    gorila: {
        title: "GORILA KING",
        text: "Король джунглів",
        background: "linear-gradient(145deg,#173f29,#050806)"
    },
    candy: {
        title: "CANDY RUSH",
        text: "Солодкий світ",
        background: "linear-gradient(145deg,#542d66,#08070b)"
    },
    pirate: {
        title: "GOLDEN PIRATE",
        text: "Полювання за скарбом",
        background: "linear-gradient(145deg,#123b4a,#07100d)"
    },
    dragon: {
        title: "DRAGON FORTUNE",
        text: "Скарби стародавнього дракона",
        background: "linear-gradient(145deg,#512515,#080706)"
    }
};


document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();
    setupAuth();
    setupGames();
    setupSupport();
    setupProfile();
    setupButtons();

    updateUI();

});


/* ================= NAVIGATION ================= */

function setupNavigation(){

    document.querySelectorAll("[data-page]").forEach(button => {

        button.addEventListener("click", () => {

            openPage(button.dataset.page);

        });

    });

}


function openPage(page){

    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active");
    });

    const target = document.getElementById(page);

    if(target){
        target.classList.add("active");
    }

    document.querySelectorAll("[data-page]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}


/* ================= BUTTONS ================= */

function setupButtons(){

    document.getElementById("homeBtn")?.addEventListener(
        "click",
        () => openPage("home")
    );

    document.querySelectorAll("[data-page-btn]").forEach(button => {

        button.addEventListener("click", () => {

            openPage(button.dataset.pageBtn);

        });

    });

    document.getElementById("heroRegister")?.addEventListener(
        "click",
        () => openAuth("register")
    );

    document.getElementById("bonusBtn")?.addEventListener(
        "click",
        () => {

            if(!user){

                openAuth("register");

                showToast("Спочатку створіть акаунт.");

                return;
            }

            user.balance += 500;

            saveUser();
            updateUI();

            showToast("Бонус +500 віртуальних монет.");

        }
    );

}


/* ================= AUTH ================= */

function setupAuth(){

    document.getElementById("loginBtn")?.addEventListener(
        "click",
        () => openAuth("login")
    );

    document.getElementById("registerBtn")?.addEventListener(
        "click",
        () => openAuth("register")
    );

    document.getElementById("profileBtn")?.addEventListener(
        "click",
        () => openPage("profile")
    );

    document.getElementById("closeAuth")?.addEventListener(
        "click",
        closeAuth
    );

    document.querySelector(".modal-bg")?.addEventListener(
        "click",
        closeAuth
    );

    document.getElementById("switchAuth")?.addEventListener(
        "click",
        () => {

            openAuth(
                authMode === "register"
                ? "login"
                : "register"
            );

        }
    );

    document.getElementById("authForm")?.addEventListener(
        "submit",
        handleAuth
    );

}


function openAuth(mode){

    authMode = mode;

    const modal =
        document.getElementById("authModal");

    const title =
        document.getElementById("authTitle");

    const text =
        document.getElementById("authText");

    const submit =
        document.getElementById("authSubmit");

    const nameWrap =
        document.getElementById("nameWrap");

    const switchButton =
        document.getElementById("switchAuth");

    modal.classList.add("show");

    if(mode === "register"){

        title.textContent =
            "Створити акаунт";

        text.textContent =
            "Зареєструйся та відкрий свій профіль VELORA.";

        submit.textContent =
            "ЗАРЕЄСТРУВАТИСЯ";

        nameWrap.style.display =
            "block";

        switchButton.textContent =
            "Вже маєш акаунт? Увійти";

    }else{

        title.textContent =
            "Вхід";

        text.textContent =
            "Раді бачити тебе знову у VELORA.";

        submit.textContent =
            "УВІЙТИ";

        nameWrap.style.display =
            "none";

        switchButton.textContent =
            "Немає акаунта? Реєстрація";

    }

}


function closeAuth(){

    document
        .getElementById("authModal")
        .classList.remove("show");

}


function handleAuth(event){

    event.preventDefault();

    const name =
        document.getElementById("authName").value.trim();

    const email =
        document.getElementById("authEmail").value.trim();

    const password =
        document.getElementById("authPassword").value.trim();


    if(!email || !password){

        showToast("Заповніть email та пароль.");

        return;
    }


    if(authMode === "register"){

        if(!name){

            showToast("Введіть ім'я або нікнейм.");

            return;
        }


        user = {

            name,
            email,

            /*
             * Тільки демо-дані.
             * Пароль не використовується
             * як справжня серверна авторизація.
             */

            balance:10000,
            logged:true

        };


        saveUser();

        closeAuth();

        showToast(
            "Акаунт створено. Відкриваємо VELORA..."
        );


        setTimeout(() => {

            updateUI();

            openPage("home");

        }, 3500);


    }else{

        if(!user){

            showToast(
                "Акаунт не знайдено. Спочатку зареєструйтесь."
            );

            return;
        }


        if(
            user.email !== email
        ){

            showToast(
                "Email не відповідає створеному акаунту."
            );

            return;
        }


        user.logged = true;

        saveUser();

        closeAuth();

        updateUI();

        showToast(
            "Вхід виконано."
        );

    }

}


/* ================= STORAGE ================= */

function saveUser(){

    localStorage.setItem(
        KEY,
        JSON.stringify(user)
    );

}


/* ================= UI ================= */

function updateUI(){

    const balance =
        user?.balance ?? 10000;

    document.getElementById("balance").textContent =
        formatMoney(balance);

    document.getElementById("gameBalance").textContent =
        formatMoney(balance);


    const login =
        document.getElementById("loginBtn");

    const register =
        document.getElementById("registerBtn");

    const avatar =
        document.getElementById("profileBtn");

    const logout =
        document.getElementById("logoutBtn");


    if(user?.logged){

        login.classList.add("hidden");

        register.classList.add("hidden");

        avatar.classList.remove("hidden");

        logout.classList.remove("hidden");


        const first =
            user.name
            ? user.name.charAt(0).toUpperCase()
            : "V";


        avatar.textContent = first;

        document.getElementById("profileAvatar").textContent =
            first;

        document.getElementById("profileName").textContent =
            user.name;

        document.getElementById("profileEmail").textContent =
            user.email;

    }else{

        login.classList.remove("hidden");

        register.classList.remove("hidden");

        avatar.classList.add("hidden");

        logout.classList.add("hidden");

    }

}


function formatMoney(number){

    return Number(number).toLocaleString(
        "uk-UA"
    );

}


/* ================= GAMES ================= */

function setupGames(){

    document.querySelectorAll("[data-game]").forEach(card => {

        card.addEventListener("click", event => {

            if(
                event.target.classList.contains("play") ||
                event.currentTarget === card
            ){

                openGame(
                    card.dataset.game
                );

            }

        });

    });


    document.getElementById("closeGame")?.addEventListener(
        "click",
        closeGame
    );

}


function openGame(id){

    if(!user?.logged){

        openAuth("register");

        showToast(
            "Створіть акаунт, щоб відкрити гру."
        );

        return;
    }


    const game =
        games[id];

    if(!game) return;


    document.getElementById("gameTitle").textContent =
        game.title;


    const screen =
        document.getElementById("gameScreen");


    screen.innerHTML = "";


    const board =
        document.createElement("div");


    board.className =
        "game-board";


    board.style.background =
        game.background;


    board.innerHTML = `

        <div class="game-decoration"></div>

        <h2>${game.title}</h2>

        <p>${game.text}</p>

        <button class="game-action">
            ПОЧАТИ ГРУ
        </button>

    `;


    screen.appendChild(board);


    board
        .querySelector(".game-action")
        .addEventListener(
            "click",
            () => playGame(id)
        );


    document
        .getElementById("gameModal")
        .classList.add("show");

}


function closeGame(){

    document
        .getElementById("gameModal")
        .classList.remove("show");

}


/* ================= GAME DEMO ================= */

function playGame(id){

    const cost = 100;


    if(user.balance < cost){

        showToast(
            "Недостатньо віртуального балансу."
        );

        return;
    }


    user.balance -= cost;


    const random =
        Math.random();


    let reward = 0;


    if(random > .93){

        reward = 1500;

    }else if(random > .75){

        reward = 500;

    }else if(random > .48){

        reward = 200;

    }


    user.balance += reward;


    saveUser();

    updateUI();


    if(reward){

        showToast(
            `Результат: +${formatMoney(reward)}`
        );

    }else{

        showToast(
            "Раунд завершено."
        );

    }

}


/* ================= SUPPORT ================= */

function setupSupport(){

    document
        .getElementById("supportForm")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                showToast(
                    "Звернення прийнято. Підтримка зв'яжеться з вами."
                );

                event.target.reset();

            }
        );

}


/* ================= PROFILE ================= */

function setupProfile(){

    document
        .getElementById("logoutBtn")
        ?.addEventListener(
            "click",
            () => {

                user = null;

                localStorage.removeItem(KEY);

                updateUI();

                openPage("home");

                showToast(
                    "Ви вийшли з акаунта."
                );

            }
        );

}


/* ================= TOAST ================= */

function showToast(message){

    const toast =
        document.getElementById("toast");

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove("show");

            },
            3200
        );

}


/* ================= ESC ================= */

document.addEventListener(
    "keydown",
    event => {

        if(event.key === "Escape"){

            closeAuth();
            closeGame();

        }

    }
);