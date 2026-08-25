/* =========================================================
   VELORA — COMPLETE APP
   8 ORIGINAL DRAWN / ANIMATED GAME WORLDS
========================================================= */

const $ = id => document.getElementById(id);

let balance = Number(localStorage.getItem("velora_balance") || 10000);
let user = JSON.parse(localStorage.getItem("velora_user") || "null");
let registerMode = false;
let currentGame = null;
let gameTimer = null;


/* =========================================================
   USER / AUTH
========================================================= */

function saveUser(){
    localStorage.setItem("velora_user", JSON.stringify(user));
}

function saveBalance(){
    localStorage.setItem("velora_balance", balance);
    updateBalance();
}

function updateBalance(){
    $("balance").textContent = formatMoney(balance);
    $("gameBalance").textContent = formatMoney(balance);
}

function formatMoney(n){
    return Math.max(0, Math.floor(n)).toLocaleString("uk-UA");
}

function showApp(){
    $("authScreen").classList.add("hidden");
    $("app").classList.remove("hidden");

    if(user){
        const name = user.name || "Гравець VELORA";
        $("profileName").textContent = name;
        $("profileEmail").textContent = user.email || "";
        $("profileLetter").textContent = name.charAt(0).toUpperCase();
        $("profileAvatar").textContent = name.charAt(0).toUpperCase();
    }

    updateBalance();
}

function showAuth(){
    $("authScreen").classList.remove("hidden");
    $("app").classList.add("hidden");
}

$("authSwitch").addEventListener("click", () => {

    registerMode = !registerMode;

    $("nameWrap").classList.toggle("hidden", !registerMode);

    if(registerMode){
        $("authHeading").textContent = "Створити акаунт";
        $("authText").textContent = "Створи профіль VELORA та відкрий ігри.";
        $("authSubmit").textContent = "Зареєструватися";
        $("authSwitch").textContent = "Вже маєш акаунт? Вхід";
    }else{
        $("authHeading").textContent = "Ласкаво просимо";
        $("authText").textContent = "Увійди, щоб відкрити ігровий світ VELORA.";
        $("authSubmit").textContent = "Увійти";
        $("authSwitch").textContent = "Немає акаунта? Реєстрація";
    }
});


$("authForm").addEventListener("submit", e => {

    e.preventDefault();

    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    const name = $("authName").value.trim();

    if(registerMode && !name){
        showToast("Вкажи ім'я або нікнейм");
        return;
    }

    if(password.length < 4){
        showToast("Пароль має містити щонайменше 4 символи");
        return;
    }

    user = {
        name: registerMode ? name : (user?.name || email.split("@")[0]),
        email
    };

    saveUser();

    if(!localStorage.getItem("velora_balance")){
        balance = 10000;
        saveBalance();
    }

    showApp();
    showToast(registerMode ? "Акаунт створено" : "Вхід виконано");
});


$("logout").addEventListener("click", () => {

    localStorage.removeItem("velora_user");
    user = null;

    registerMode = false;
    $("authForm").reset();
    $("nameWrap").classList.add("hidden");

    showAuth();
});


/* =========================================================
   NAVIGATION
========================================================= */

document.addEventListener("click", e => {

    const target = e.target.closest("[data-page]");

    if(!target) return;

    const page = target.dataset.page;

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    const selected = $("page-" + page);

    if(selected){
        selected.classList.add("active");
    }

    document.querySelectorAll("[data-page]").forEach(btn => {
        if(btn.closest(".desktop-nav") || btn.closest(".mobile-nav")){
            btn.classList.toggle("active", btn.dataset.page === page);
        }
    });

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
});


/* =========================================================
   GAMES
========================================================= */

const games = [

    {
        id:"jungle",
        title:"Jungle King",
        subtitle:"Таємниця джунглів",
        world:"w1",
        type:"character",
        description:"Королівські джунглі оживають.",
        action:"Зібрати нагороду"
    },

    {
        id:"candy",
        title:"Candy Dream",
        subtitle:"Солодка пригода",
        world:"w2",
        type:"wheel",
        description:"Крути чарівне колесо.",
        action:"Крутити"
    },

    {
        id:"pirate",
        title:"Golden Seas",
        subtitle:"Пошук скарбів",
        world:"w3",
        type:"chest",
        description:"Скарб чекає на свого капітана.",
        action:"Відкрити скриню"
    },

    {
        id:"ocean",
        title:"Ocean Rush",
        subtitle:"Підводна експедиція",
        world:"w4",
        type:"shark",
        description:"Поринь у глибини.",
        action:"Почати експедицію"
    },

    {
        id:"cosmos",
        title:"Cosmic Voyage",
        subtitle:"Подорож крізь галактику",
        world:"w5",
        type:"rocket",
        description:"Відправляйся у космос.",
        action:"Запустити"
    },

    {
        id:"volcano",
        title:"Dragon Valley",
        subtitle:"Долина дракона",
        world:"w6",
        type:"character",
        description:"Небезпечна долина прокидається.",
        action:"Викликати дракона"
    },

    {
        id:"forest",
        title:"Mystic Forest",
        subtitle:"Таємничий ліс",
        world:"w7",
        type:"portal",
        description:"Знайди портал у стародавньому лісі.",
        action:"Відкрити портал"
    },

    {
        id:"city",
        title:"Neon City",
        subtitle:"Нічне місто",
        world:"w8",
        type:"rocket",
        description:"Неонове місто ніколи не спить.",
        action:"Почати місію"
    }

];


function gameCard(game){

    return `
        <article class="game-card" data-open-game="${game.id}">

            <div class="card-art">
                <div class="world ${game.world}">

                    <div class="world-character">
                        <div class="world-head"></div>
                        <div class="world-body"></div>
                        <div class="world-arm"></div>
                        <div class="world-arm"></div>
                    </div>

                </div>

                <div class="card-label">VELORA ORIGINAL</div>
            </div>

            <div class="game-card-content">

                <h3>${game.title}</h3>

                <p>${game.subtitle}</p>

                <button class="play-small">
                    Грати
                </button>

            </div>

        </article>
    `;
}


function renderGames(){

    $("homeGames").innerHTML =
        games.slice(0,4).map(gameCard).join("");

    $("allGames").innerHTML =
        games.map(gameCard).join("");
}

renderGames();


document.addEventListener("click", e => {

    const card = e.target.closest("[data-open-game]");

    if(!card) return;

    openGame(card.dataset.openGame);
});


/* =========================================================
   GAME ENGINE
========================================================= */

function openGame(id){

    const game = games.find(g => g.id === id);

    if(!game) return;

    currentGame = game;

    $("gameTitle").textContent = game.title;
    $("gameOverlay").classList.add("open");

    renderGame(game);
    updateBalance();
}


function closeGame(){

    clearInterval(gameTimer);
    gameTimer = null;

    $("gameOverlay").classList.remove("open");
    $("gameStage").innerHTML = "";
    $("gameControls").innerHTML = "";

    currentGame = null;
}

$("closeGame").addEventListener("click", closeGame);


function renderGame(game){

    const stage = $("gameStage");
    const controls = $("gameControls");

    let content = "";

    if(game.type === "character"){

        content = `
            <div class="game-scene">

                <div class="scene-bg scene-jungle"></div>

                <div class="scene-title">
                    <h2>${game.title}</h2>
                    <p>${game.description}</p>
                </div>

                <div class="big-character">

                    <div class="big-head">
                        <div class="big-mouth"></div>
                    </div>

                    <div class="big-body"></div>

                    <div class="big-arm a"></div>
                    <div class="big-arm b"></div>

                </div>

            </div>
        `;

        controls.innerHTML = `
            <button class="control-btn" id="mainGameAction">
                ${game.action}
            </button>
        `;

    }


    if(game.type === "wheel"){

        content = `
            <div class="game-scene">

                <div class="scene-bg scene-candy"></div>

                <div class="scene-title">
                    <h2>${game.title}</h2>
                    <p>${game.description}</p>
                </div>

                <div class="giant-wheel" id="wheel"></div>

            </div>
        `;

        controls.innerHTML = `
            <button class="control-btn" id="spinWheel">
                Крутити колесо
            </button>
        `;
    }


    if(game.type === "chest"){

        content = `
            <div class="game-scene">

                <div class="scene-bg scene-volcano"></div>

                <div class="scene-title">
                    <h2>${game.title}</h2>
                    <p>${game.description}</p>
                </div>

                <div class="chest" id="treasureChest">
                    <div class="chest-lock"></div>
                </div>

            </div>
        `;

        controls.innerHTML = `
            <button class="control-btn" id="openChest">
                Відкрити скриню
            </button>
        `;
    }


    if(game.type === "shark"){

        content = `
            <div class="game-scene">

                <div class="scene-bg scene-ocean"></div>

                <div class="scene-title">
                    <h2>${game.title}</h2>
                    <p>${game.description}</p>
                </div>

                <div class="shark">
                    <div class="shark-fin"></div>
                </div>

            </div>
        `;

        controls.innerHTML = `
            <button class="control-btn" id="oceanAction">
                ${game.action}
            </button>
        `;
    }


    if(game.type === "rocket"){

        content = `
            <div class="game-scene">

                <div class="scene-bg ${game.id === "city" ? "scene-city" : "scene-space"}"></div>

                <div class="scene-title">
                    <h2>${game.title}</h2>
                    <p>${game.description}</p>
                </div>

                <div class="rocket">
                    <div class="rocket-window"></div>
                </div>

            </div>
        `;

        controls.innerHTML = `
            <button class="control-btn" id="rocketAction">
                ${game.action}
            </button>
        `;
    }


    if(game.type === "portal"){

        content = `
            <div class="game-scene">

                <div class="scene-bg scene-forest"></div>

                <div class="scene-title">
                    <h2>${game.title}</h2>
                    <p>${game.description}</p>
                </div>

                <div class="portal">
                    <div class="portal-core"></div>
                </div>

            </div>
        `;

        controls.innerHTML = `
            <button class="control-btn" id="portalAction">
                Відкрити портал
            </button>
        `;
    }


    stage.innerHTML = content;

    bindGameControls(game);
}


function bindGameControls(game){

    const action = $("mainGameAction");

    if(action){
        action.onclick = () => rewardAction(
            "Персонаж знайшов нагороду!"
        );
    }


    const wheel = $("spinWheel");

    if(wheel){

        wheel.onclick = () => {

            wheel.disabled = true;

            const object = $("wheel");

            const rotations =
                1440 + Math.floor(Math.random()*720);

            object.style.transform =
                `translate(-50%,-50%) rotate(${rotations}deg)`;

            setTimeout(() => {

                const rewards = [50,100,150,250,500];

                const reward =
                    rewards[Math.floor(Math.random()*rewards.length)];

                balance += reward;
                saveBalance();

                showToast(`Виграш +${formatMoney(reward)}`);

                wheel.disabled = false;

            },2900);
        };
    }


    const chest = $("openChest");

    if(chest){

        chest.onclick = () => {

            const values = [50,100,200,300,750];
            const reward =
                values[Math.floor(Math.random()*values.length)];

            const obj = $("treasureChest");

            obj.style.transform =
                "translate(-50%,-50%) scale(1.08)";

            setTimeout(() => {

                obj.style.transform =
                    "translate(-50%,-50%) scale(1)";

                balance += reward;
                saveBalance();

                showToast(`Скарб знайдено: +${formatMoney(reward)}`);

            },600);
        };
    }


    const ocean = $("oceanAction");

    if(ocean){
        ocean.onclick = () => rewardAction(
            "Експедиція завершена!"
        );
    }


    const rocket = $("rocketAction");

    if(rocket){

        rocket.onclick = () => {

            const obj = document.querySelector(".rocket");

            if(!obj) return;

            obj.style.transition =
                "transform 1.4s ease-in, opacity 1.4s";

            obj.style.transform =
                "translate(-50%,-300%)";

            obj.style.opacity = "0";

            setTimeout(() => {

                const reward = 100 + Math.floor(Math.random()*301);

                balance += reward;
                saveBalance();

                showToast(`Місія завершена: +${formatMoney(reward)}`);

                obj.style.transition = "";
                obj.style.transform =
                    "translate(-50%,-50%)";
                obj.style.opacity = "1";

            },1500);
        };
    }


    const portal = $("portalAction");

    if(portal){

        portal.onclick = () => {

            const obj = document.querySelector(".portal");

            obj.style.transform =
                "translate(-50%,-50%) scale(1.25)";

            setTimeout(() => {

                const reward = 200;

                balance += reward;
                saveBalance();

                showToast(`Портал відкритий: +${formatMoney(reward)}`);

                obj.style.transform =
                    "translate(-50%,-50%)";

            },1000);
        };
    }
}


/* =========================================================
   REWARDS
========================================================= */

function rewardAction(message){

    const reward =
        50 + Math.floor(Math.random()*251);

    balance += reward;

    saveBalance();

    showToast(`${message} +${formatMoney(reward)}`);
}


function dailyBonus(){

    const key = "velora_daily";

    const today = new Date().toISOString().slice(0,10);

    if(localStorage.getItem(key) === today){
        showToast("Сьогодні бонус уже отримано");
        return;
    }

    localStorage.setItem(key,today);

    balance += 500;
    saveBalance();

    showToast("Щоденна нагорода +500");
}


/* =========================================================
   SUPPORT
========================================================= */

$("supportForm").addEventListener("submit", e => {

    e.preventDefault();

    showToast("Звернення підготовлено");

    e.target.reset();
});


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(text){

    const toast = $("toast");

    $("toast").textContent = text;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    },2600);
}


/* =========================================================
   INITIAL STATE
========================================================= */

updateBalance();

if(user){
    showApp();
}else{
    showAuth();
}


/* =========================================================
   PREVENT DOUBLE TAP ZOOM ON GAME BUTTONS
========================================================= */

document.addEventListener("touchend", e => {

    if(e.target.closest("button")){
        e.target.blur();
    }

}, {passive:true});