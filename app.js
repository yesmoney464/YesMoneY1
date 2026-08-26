"use strict";

/* =========================================================
   VELORA
   CLIENT BUILD
   VIRTUAL CREDITS
========================================================= */

const $ = id => document.getElementById(id);

const state = {
    user: JSON.parse(localStorage.getItem("velora_user") || "null"),
    balance: Number(localStorage.getItem("velora_balance") || 10000),
    page: "home",
    currentGame: null,
    animation: null,
    gameData: null
};


/* =========================================================
   GAME DEFINITIONS
========================================================= */

const games = [
    {
        id:"gorila",
        title:"Gorila King",
        subtitle:"Jungle Fortune",
        type:"jungle"
    },
    {
        id:"pirate",
        title:"Golden Pirate",
        subtitle:"Treasure Storm",
        type:"pirate"
    },
    {
        id:"candy",
        title:"Candy Rush",
        subtitle:"Sweet Kingdom",
        type:"candy"
    },
    {
        id:"dragon",
        title:"Dragon Forge",
        subtitle:"Fire & Gold",
        type:"dragon"
    },
    {
        id:"moon",
        title:"Moon Temple",
        subtitle:"Mystic Night",
        type:"moon"
    },
    {
        id:"robot",
        title:"Neon Robots",
        subtitle:"Cyber Arena",
        type:"robot"
    },
    {
        id:"ocean",
        title:"Ocean Treasure",
        subtitle:"Deep Blue",
        type:"ocean"
    },
    {
        id:"forest",
        title:"Forest Spirits",
        subtitle:"Magic Grove",
        type:"forest"
    }
];


/* =========================================================
   HELPERS
========================================================= */

function money(n){
    return Math.max(0, Math.floor(n)).toLocaleString("uk-UA");
}

function saveState(){
    localStorage.setItem("velora_balance", String(state.balance));

    if(state.user){
        localStorage.setItem("velora_user", JSON.stringify(state.user));
    }
}

function toast(text){
    const el = $("toast");
    el.textContent = text;
    el.classList.add("show");

    clearTimeout(toast.timer);
    toast.timer = setTimeout(()=>{
        el.classList.remove("show");
    },2200);
}

function updateBalance(){
    $("balance").textContent = money(state.balance);
    $("gameBalance").textContent = money(state.balance);
    saveState();
}

function spend(amount){
    if(state.balance < amount){
        toast("Недостатньо віртуальних кредитів");
        return false;
    }

    state.balance -= amount;
    updateBalance();
    return true;
}

function reward(amount){
    state.balance += amount;
    updateBalance();
    toast("Нагорода +" + money(amount));
}


/* =========================================================
   AUTH
========================================================= */

let authMode = "login";

function setAuthMode(mode){
    authMode = mode;

    $("loginTab").classList.toggle("active", mode === "login");
    $("registerTab").classList.toggle("active", mode === "register");

    $("nameWrap").classList.toggle("hidden", mode === "login");
    $("authSubmit").textContent =
        mode === "login" ? "Увійти" : "Створити акаунт";
}

$("loginTab").onclick = () => setAuthMode("login");
$("registerTab").onclick = () => setAuthMode("register");

$("authForm").addEventListener("submit", e=>{
    e.preventDefault();

    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    const name = $("authName").value.trim();

    if(!email || !password) return;

    if(authMode === "register"){
        if(!name){
            toast("Введи ім'я або нікнейм");
            return;
        }

        state.user = {
            name,
            email
        };

        state.balance = 10000;
        saveState();

        enterApp();
        toast("Акаунт VELORA створено");
        return;
    }

    const stored = JSON.parse(localStorage.getItem("velora_account") || "null");

    if(!stored){
        toast("Спочатку створи акаунт");
        return;
    }

    if(stored.email !== email || stored.password !== password){
        toast("Невірні дані входу");
        return;
    }

    state.user = {
        name:stored.name,
        email:stored.email
    };

    saveState();
    enterApp();
});

function enterApp(){
    $("authScreen").classList.add("hidden");
    $("app").classList.remove("hidden");

    if(state.user){
        $("profileName").textContent = state.user.name;
        $("profileEmail").textContent = state.user.email;

        const letter =
            state.user.name.charAt(0).toUpperCase() || "V";

        $("profileLetter").textContent = letter;
        $("bigAvatar").textContent = letter;
    }

    updateBalance();
    renderGames();
    startHeroAnimation();
}

function showAuth(){
    $("app").classList.add("hidden");
    $("authScreen").classList.remove("hidden");
}


/*
   Demo-only local account.
   Before any real-money deployment this must be replaced
   with server-side authentication.
*/
$("registerTab").addEventListener("click",()=>{
    $("authForm").onsubmit = null;
});


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(page){

    state.page = page;

    document.querySelectorAll(".page").forEach(p=>{
        p.classList.remove("active");
    });

    const target = $(page);
    if(target) target.classList.add("active");

    document.querySelectorAll("[data-page]").forEach(btn=>{
        btn.classList.toggle(
            "active",
            btn.dataset.page === page
        );
    });

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}

document.addEventListener("click", e=>{
    const button = e.target.closest("[data-page]");
    if(button){
        showPage(button.dataset.page);
    }
});

$("homeLogo").onclick = () => showPage("home");
$("profileOpen").onclick = () => showPage("profile");
$("heroProfile").onclick = () => showPage("profile");

$("logout").onclick = ()=>{
    state.user = null;
    localStorage.removeItem("velora_user");
    showAuth();
};


/* =========================================================
   ACCOUNT STORAGE
========================================================= */

$("authForm").addEventListener("submit", e=>{

    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    const name = $("authName").value.trim();

    if(authMode === "register"){
        localStorage.setItem(
            "velora_account",
            JSON.stringify({
                name,
                email,
                password
            })
        );
    }
});


/* =========================================================
   GAME CARDS
========================================================= */

function gameCard(game){

    return `
        <article class="game-card">
            <div class="game-art">
                <canvas data-preview="${game.type}"></canvas>
            </div>

            <div class="game-info">
                <div>
                    <h3>${game.title}</h3>
                    <p>${game.subtitle}</p>
                </div>

                <button
                    class="play"
                    data-open-game="${game.id}">
                    →
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

    document.querySelectorAll("[data-open-game]").forEach(btn=>{
        btn.onclick = ()=>{
            openGame(btn.dataset.openGame);
        };
    });

    document.querySelectorAll("[data-preview]").forEach(canvas=>{
        drawPreview(
            canvas,
            canvas.dataset.preview
        );
    });
}


/* =========================================================
   PREVIEW ART
========================================================= */

function drawPreview(canvas,type){

    const dpr = Math.min(window.devicePixelRatio || 1,2);
    const rect = canvas.getBoundingClientRect();

    const w = Math.max(300,rect.width);
    const h = Math.max(200,rect.height);

    canvas.width = w*dpr;
    canvas.height = h*dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr,dpr);

    const bg = {
        jungle:"#15291b",
        pirate:"#141b38",
        candy:"#301b37",
        dragon:"#32150e",
        moon:"#14162e",
        robot:"#091b27",
        ocean:"#08283b",
        forest:"#10291d"
    }[type] || "#111";

    ctx.fillStyle = bg;
    ctx.fillRect(0,0,w,h);

    const g = ctx.createRadialGradient(
        w*.5,h*.35,10,
        w*.5,h*.35,h
    );

    g.addColorStop(0,"rgba(255,255,255,.12)");
    g.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    if(type === "jungle"){
        drawMonkey(ctx,w*.5,h*.48,w*.18);
        drawLeaves(ctx,w,h);
    }

    if(type === "pirate"){
        drawMoon(ctx,w*.75,h*.28,w*.12);
        drawShip(ctx,w*.5,h*.6,w*.32);
        drawStars(ctx,w,h);
    }

    if(type === "candy"){
        drawCandy(ctx,w*.5,h*.5,w*.18);
        drawCandyPieces(ctx,w,h);
    }

    if(type === "dragon"){
        drawDragon(ctx,w*.5,h*.5,w*.26);
        drawFire(ctx,w*.5,h*.82,w*.13);
    }

    if(type === "moon"){
        drawTemple(ctx,w*.5,h*.58,w*.35);
        drawMoon(ctx,w*.75,h*.22,w*.13);
    }

    if(type === "robot"){
        drawRobot(ctx,w*.5,h*.5,w*.22);
        drawNeonLines(ctx,w,h);
    }

    if(type === "ocean"){
        drawFish(ctx,w*.5,h*.52,w*.22);
        drawBubbles(ctx,w,h);
    }

    if(type === "forest"){
        drawSpirit(ctx,w*.5,h*.5,w*.2);
        drawTrees(ctx,w,h);
    }
}


/* =========================================================
   DRAWING FUNCTIONS
========================================================= */

function circle(ctx,x,y,r,fill){
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=fill;
    ctx.fill();
}

function rounded(ctx,x,y,w,h,r,fill){
    ctx.beginPath();
    ctx.roundRect(x,y,w,h,r);
    ctx.fillStyle=fill;
    ctx.fill();
}

function drawMonkey(ctx,x,y,s){
    circle(ctx,x,y,s,"#8d5b38");
    circle(ctx,x-s*.45,y-s*.05,s*.32,"#74472f");
    circle(ctx,x+s*.45,y-s*.05,s*.32,"#74472f");

    circle(ctx,x-s*.27,y-s*.1,s*.08,"#111");
    circle(ctx,x+s*.27,y-s*.1,s*.08,"#111");

    rounded(
        ctx,
        x-s*.3,
        y+s*.18,
        s*.6,
        s*.35,
        s*.14,
        "#b77a4b"
    );

    circle(ctx,x,y+s*.28,s*.07,"#17110d");
}

function drawLeaves(ctx,w,h){
    for(let i=0;i<8;i++){
        const x=(i*97)%w;
        const y=25+(i*43)%h;
        ctx.save();
        ctx.translate(x,y);
        ctx.rotate((i%2?-.4:.4));
        ctx.fillStyle="#3d7d48";
        ctx.beginPath();
        ctx.ellipse(0,0,35,12,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

function drawMoon(ctx,x,y,r){
    circle(ctx,x,y,r,"#ffe59b");
    circle(ctx,x+r*.35,y-r*.15,r*.82,"#151b38");
}

function drawShip(ctx,x,y,s){
    ctx.fillStyle="#713b24";
    ctx.beginPath();
    ctx.moveTo(x-s,y);
    ctx.lineTo(x+s,y);
    ctx.lineTo(x+s*.65,y+s*.35);
    ctx.lineTo(x-s*.55,y+s*.35);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle="#c99142";
    ctx.lineWidth=4;
    ctx.stroke();

    ctx.fillStyle="#e7d4a3";
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y-s*.75);
    ctx.lineTo(x+s*.48,y-s*.18);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle="#3a2419";
    ctx.lineWidth=4;
    ctx.stroke();
}

function drawStars(ctx,w,h){
    for(let i=0;i<18;i++){
        circle(
            ctx,
            (i*71)%w,
            (i*37)%h,
            1.5+(i%3),
            "#fff0ad"
        );
    }
}

function drawCandy(ctx,x,y,s){
    circle(ctx,x,y,s,"#ff5e9c");

    circle(ctx,x-s*.32,y-s*.12,s*.09,"white");
    circle(ctx,x+s*.32,y-s*.12,s*.09,"white");

    circle(ctx,x-s*.32,y-s*.12,s*.04,"#31162c");
    circle(ctx,x+s*.32,y-s*.12,s*.04,"#31162c");

    ctx.strokeStyle="#701a49";
    ctx.lineWidth=5;
    ctx.beginPath();
    ctx.arc(x,y+s*.05,s*.3,0,Math.PI);
    ctx.stroke();
}

function drawCandyPieces(ctx,w,h){
    const colors=["#ffd45a","#74e4d0","#d47cff","#ff6c85"];

    for(let i=0;i<8;i++){
        circle(
            ctx,
            (i*81)%w,
            25+(i*57)%h,
            12,
            colors[i%colors.length]
        );
    }
}

function drawDragon(ctx,x,y,s){
    ctx.save();
    ctx.translate(x,y);

    ctx.fillStyle="#c6422c";
    ctx.beginPath();
    ctx.moveTo(-s*.8,s*.5);
    ctx.lineTo(-s*.55,-s*.45);
    ctx.lineTo(0,-s*.75);
    ctx.lineTo(s*.55,-s*.45);
    ctx.lineTo(s*.8,s*.5);
    ctx.lineTo(0,s*.72);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle="#f2a33d";
    ctx.beginPath();
    ctx.moveTo(-s*.6,-s*.1);
    ctx.lineTo(-s*.15,-s*.48);
    ctx.lineTo(0,s*.55);
    ctx.lineTo(s*.15,-s*.48);
    ctx.lineTo(s*.6,-s*.1);
    ctx.lineTo(0,s*.25);
    ctx.closePath();
    ctx.fill();

    circle(ctx,-s*.23,-s*.2,s*.07,"#fff3a1");
    circle(ctx,s*.23,-s*.2,s*.07,"#fff3a1");

    ctx.restore();
}

function drawFire(ctx,x,y,s){
    ctx.fillStyle="#ffb33e";
    ctx.beginPath();
    ctx.moveTo(x,y+s);
    ctx.bezierCurveTo(
        x-s,y,
        x+s,y-s,
        x,y-s*1.5
    );
    ctx.bezierCurveTo(
        x+s*.4,y,
        x+s*.5,y+s*.2,
        x,y+s
    );
    ctx.fill();
}

function drawTemple(ctx,x,y,s){
    ctx.fillStyle="#6c5d99";
    ctx.fillRect(x-s*.5,y-s*.2,s,s*.6);

    ctx.fillStyle="#a994d2";
    ctx.beginPath();
    ctx.moveTo(x-s*.65,y-s*.2);
    ctx.lineTo(x,y-s*.65);
    ctx.lineTo(x+s*.65,y-s*.2);
    ctx.closePath();
    ctx.fill();

    for(let i=-1;i<=1;i++){
        ctx.fillStyle="#282340";
        ctx.fillRect(x+i*s*.25,y-s*.05,s*.1,s*.45);
    }
}

function drawRobot(ctx,x,y,s){
    rounded(ctx,x-s*.55,y-s*.55,s*1.1,s*1.1,s*.18,"#38a9c9");
    rounded(ctx,x-s*.4,y-s*.28,s*.8,s*.48,s*.08,"#0a1720");

    circle(ctx,x-s*.2,y-s*.04,s*.07,"#73f1ff");
    circle(ctx,x+s*.2,y-s*.04,s*.07,"#73f1ff");

    ctx.fillStyle="#dcefff";
    ctx.fillRect(x-s*.08,y-s*.48,s*.16,s*.18);
}

function drawNeonLines(ctx,w,h){
    ctx.strokeStyle="rgba(69,210,255,.3)";
    ctx.lineWidth=2;

    for(let i=0;i<7;i++){
        ctx.beginPath();
        ctx.moveTo(0,i*h/7);
        ctx.lineTo(w,(i+1)*h/7);
        ctx.stroke();
    }
}

function drawFish(ctx,x,y,s){
    ctx.fillStyle="#4cc5e8";
    ctx.beginPath();
    ctx.ellipse(x,y,s,s*.55,0,0,Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x-s,y);
    ctx.lineTo(x-s*1.5,y-s*.55);
    ctx.lineTo(x-s*1.5,y+s*.55);
    ctx.closePath();
    ctx.fill();

    circle(ctx,x+s*.35,y-s*.12,s*.07,"#06141c");
}

function drawBubbles(ctx,w,h){
    for(let i=0;i<12;i++){
        ctx.strokeStyle="rgba(160,235,255,.5)";
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.arc(
            (i*67)%w,
            (i*47)%h,
            4+(i%4)*2,
            0,
            Math.PI*2
        );
        ctx.stroke();
    }
}

function drawSpirit(ctx,x,y,s){
    const g=ctx.createRadialGradient(x,y,5,x,y,s*2);
    g.addColorStop(0,"#a5ffd1");
    g.addColorStop(1,"rgba(74,255,171,0)");

    circle(ctx,x,y,s*1.8,g);

    circle(ctx,x,y,s,"#65dca2");
    circle(ctx,x-s*.25,y-s*.1,s*.09,"#10261d");
    circle(ctx,x+s*.25,y-s*.1,s*.09,"#10261d");
}

function drawTrees(ctx,w,h){
    for(let i=0;i<7;i++){
        const x=(i*91)%w;
        const y=h*.65;
        ctx.fillStyle="#38291c";
        ctx.fillRect(x,y,15,h-y);

        circle(ctx,x+7,y,38,"#28633c");
    }
}


/* =========================================================
   HERO ANIMATION
========================================================= */

let heroFrame = 0;

function startHeroAnimation(){

    const canvas = $("heroCanvas");
    const ctx = canvas.getContext("2d");

    function resize(){
        const r=canvas.getBoundingClientRect();
        const d=Math.min(devicePixelRatio||1,2);

        canvas.width=r.width*d;
        canvas.height=r.height*d;

        ctx.setTransform(d,0,0,d,0,0);
    }

    resize();
    window.addEventListener("resize",resize);

    function loop(time){

        const w=canvas.clientWidth;
        const h=canvas.clientHeight;

        ctx.clearRect(0,0,w,h);

        const g=ctx.createRadialGradient(
            w*.5,h*.5,20,
            w*.5,h*.5,h*.65
        );

        g.addColorStop(0,"rgba(245,200,91,.18)");
        g.addColorStop(1,"rgba(0,0,0,0)");

        ctx.fillStyle=g;
        ctx.fillRect(0,0,w,h);

        const cx=w*.5;
        const cy=h*.5;

        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(time*.00015);

        for(let i=0;i<4;i++){

            ctx.strokeStyle =
                `rgba(245,200,91,${.2-i*.035})`;

            ctx.lineWidth=1+i;

            ctx.beginPath();
            ctx.ellipse(
                0,
                0,
                100+i*35,
                35+i*17,
                i*.6,
                0,
                Math.PI*2
            );
            ctx.stroke();
        }

        ctx.restore();

        const pulse=1+Math.sin(time*.002)*.06;

        circle(
            ctx,
            cx,
            cy,
            85*pulse,
            "#17130b"
        );

        ctx.strokeStyle="#f5c85b";
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.arc(cx,cy,84*pulse,0,Math.PI*2);
        ctx.stroke();

        ctx.fillStyle="#ffe59a";
        ctx.font="900 100px Arial";
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillText("V",cx,cy+5);

        heroFrame=requestAnimationFrame(loop);
    }

    cancelAnimationFrame(heroFrame);
    heroFrame=requestAnimationFrame(loop);
}


/* =========================================================
   GAME ENGINE
========================================================= */

function openGame(id){

    const game=games.find(g=>g.id===id);
    if(!game) return;

    state.currentGame=game;

    $("gameOverlay").classList.remove("hidden");
    $("gameTitle").textContent=game.title;
    $("gameCategory").textContent=game.subtitle;

    updateBalance();
    setupGameControls(game);

    startGameCanvas(game);
}

function closeGame(){

    $("gameOverlay").classList.add("hidden");

    if(state.animation){
        cancelAnimationFrame(state.animation);
        state.animation=null;
    }

    state.currentGame=null;
}

$("gameBack").onclick=closeGame;


/* =========================================================
   GAME CONTROLS
========================================================= */

function setupGameControls(game){

    const controls=$("gameControls");

    controls.innerHTML=`
        <button id="playGame">Грати</button>
        <button id="gamePlus" class="secondary">+ Кредити</button>
    `;

    $("playGame").onclick=()=>{
        playGame(game);
    };

    $("gamePlus").onclick=()=>{
        reward(500);
    };
}


/* =========================================================
   GENERIC GAME RESULT
========================================================= */

function playGame(game){

    const cost=100;

    if(!spend(cost)) return;

    const win=Math.random()<.46;

    setTimeout(()=>{
        if(win){

            const amount=
                150+
                Math.floor(
                    Math.random()*700
                );

            reward(amount);

        }else{
            toast("Раунд завершено");
        }
    },700);
}


/* =========================================================
   GAME CANVAS
========================================================= */

function startGameCanvas(game){

    const canvas=$("gameCanvas");
    const ctx=canvas.getContext("2d");

    function resize(){

        const r=canvas.getBoundingClientRect();
        const d=Math.min(devicePixelRatio||1,2);

        canvas.width=r.width*d;
        canvas.height=r.height*d;

        ctx.setTransform(d,0,0,d,0,0);
    }

    resize();

    const resizeHandler=()=>{
        if(state.currentGame===game) resize();
    };

    window.addEventListener("resize",resizeHandler);

    function render(time){

        if(state.currentGame!==game) return;

        const w=canvas.clientWidth;
        const h=canvas.clientHeight;

        ctx.clearRect(0,0,w,h);

        drawGameBackground(ctx,w,h,game.type,time);

        switch(game.type){

            case "jungle":
                drawJungleGame(ctx,w,h,time);
                break;

            case "pirate":
                drawPirateGame(ctx,w,h,time);
                break;

            case "candy":
                drawCandyGame(ctx,w,h,time);
                break;

            case "dragon":
                drawDragonGame(ctx,w,h,time);
                break;

            case "moon":
                drawMoonGame(ctx,w,h,time);
                break;

            case "robot":
                drawRobotGame(ctx,w,h,time);
                break;

            case "ocean":
                drawOceanGame(ctx,w,h,time);
                break;

            case "forest":
                drawForestGame(ctx,w,h,time);
                break;
        }

        state.animation=requestAnimationFrame(render);
    }

    state.animation=requestAnimationFrame(render);
}


/* =========================================================
   GAME BACKGROUNDS
========================================================= */

function drawGameBackground(ctx,w,h,type,time){

    const colors={
        jungle:["#07120b","#193b20"],
        pirate:["#070a1a","#1e2854"],
        candy:["#190918","#52204f"],
        dragon:["#180805","#5a1d10"],
        moon:["#070917","#252552"],
        robot:["#030c12","#08334b"],
        ocean:["#03131e","#07516c"],
        forest:["#06120b","#17472c"]
    };

    const c=colors[type]||["#090909","#202020"];

    const g=ctx.createLinearGradient(0,0,0,h);

    g.addColorStop(0,c[0]);
    g.addColorStop(1,c[1]);

    ctx.fillStyle=g;
    ctx.fillRect(0,0,w,h);

    const glow=ctx.createRadialGradient(
        w*.5,
        h*.42,
        10,
        w*.5,
        h*.42,
        h*.65
    );

    glow.addColorStop(
        0,
        "rgba(255,255,255,.08)"
    );

    glow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle=glow;
    ctx.fillRect(0,0,w,h);

    for(let i=0;i<25;i++){

        const x=(i*97+time*.01)%w;
        const y=(i*53)%h;

        circle(
            ctx,
            x,
            y,
            1+(i%3),
            "rgba(255,255,255,.15)"
        );
    }
}


/* =========================================================
   INDIVIDUAL GAMES
========================================================= */

function drawJungleGame(ctx,w,h,time){

    drawLeaves(ctx,w,h);

    const jump=Math.sin(time*.004)*10;

    drawMonkey(
        ctx,
        w*.5,
        h*.43+jump,
        Math.min(w,h)*.16
    );

    ctx.fillStyle="#3d7d48";
    ctx.fillRect(0,h*.72,w,h*.28);

    ctx.fillStyle="#6b452a";
    ctx.fillRect(w*.47,h*.55,w*.06,h*.25);

    ctx.fillStyle="#f5c85b";
    ctx.font="900 26px Arial";
    ctx.textAlign="center";
    ctx.fillText(
        "GORILA KING",
        w*.5,
        h*.13
    );
}

function drawPirateGame(ctx,w,h,time){

    drawStars(ctx,w,h);
    drawMoon(ctx,w*.78,h*.22,65);

    const wave=Math.sin(time*.002)*8;

    drawShip(
        ctx,
        w*.5,
        h*.58+wave,
        Math.min(w,h)*.32
    );

    for(let i=0;i<8;i++){

        circle(
            ctx,
            w*.2+i*w*.08,
            h*.74+Math.sin(time*.002+i)*6,
            10,
            "#e8b94d"
        );
    }
}

function drawCandyGame(ctx,w,h,time){

    for(let i=0;i<20;i++){

        const x=(i*83)%w;
        const y=(i*47+time*.025)%h;

        circle(
            ctx,
            x,
            y,
            10+(i%5)*2,
            [
                "#ff5e9c",
                "#ffd45a",
                "#7ce7d3",
                "#c982ff"
            ][i%4]
        );
    }

    const scale=1+Math.sin(time*.004)*.05;

    drawCandy(
        ctx,
        w*.5,
        h*.46,
        Math.min(w,h)*.18*scale
    );

    ctx.fillStyle="#fff0fa";
    ctx.font="900 27px Arial";
    ctx.textAlign="center";
    ctx.fillText(
        "CANDY RUSH",
        w*.5,
        h*.13
    );
}

function drawDragonGame(ctx,w,h,time){

    const breathe=
        1+Math.sin(time*.003)*.04;

    drawDragon(
        ctx,
        w*.5,
        h*.45,
        Math.min(w,h)*.28*breathe
    );

    for(let i=0;i<10;i++){

        drawFire(
            ctx,
            w*.25+i*w*.055,
            h*.76,
            12+Math.sin(time*.004+i)*4
        );
    }

    ctx.fillStyle="#ffcf5c";
    ctx.font="900 28px Arial";
    ctx.textAlign="center";
    ctx.fillText(
        "DRAGON FORGE",
        w*.5,
        h*.13
    );
}

function drawMoonGame(ctx,w,h,time){

    drawMoon(ctx,w*.78,h*.2,70);

    drawTemple(
        ctx,
        w*.5,
        h*.62,
        Math.min(w,h)*.4
    );

    for(let i=0;i<8;i++){

        const a=time*.0005+i;

        circle(
            ctx,
            w*.5+Math.cos(a)*130,
            h*.48+Math.sin(a)*70,
            4,
            "#a99cff"
        );
    }
}

function drawRobotGame(ctx,w,h,time){

    drawNeonLines(ctx,w,h);

    const x=
        w*.5+
        Math.sin(time*.002)*80;

    drawRobot(
        ctx,
        x,
        h*.47,
        Math.min(w,h)*.22
    );

    ctx.fillStyle="#64eaff";
    ctx.font="900 28px Arial";
    ctx.textAlign="center";
    ctx.fillText(
        "NEON ROBOTS",
        w*.5,
        h*.13
    );
}

function drawOceanGame(ctx,w,h,time){

    for(let i=0;i<5;i++){

        ctx.strokeStyle=
            "rgba(82,213,240,.3)";

        ctx.lineWidth=3;

        ctx.beginPath();

        for(let x=0;x<w;x+=15){

            const y=
                h*.7+
                Math.sin(
                    x*.02+
                    time*.001+
                    i
                )*12;

            if(x===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        }

        ctx.stroke();
    }

    drawFish(
        ctx,
        w*.5+Math.sin(time*.001)*120,
        h*.46,
        Math.min(w,h)*.2
    );

    drawBubbles(ctx,w,h);
}

function drawForestGame(ctx,w,h,time){

    drawTrees(ctx,w,h);

    const y=
        h*.45+
        Math.sin(time*.003)*9;

    drawSpirit(
        ctx,
        w*.5,
        y,
        Math.min(w,h)*.2
    );

    for(let i=0;i<10;i++){

        const a=time*.0004+i;

        circle(
            ctx,
            w*.5+Math.cos(a)*150,
            h*.48+Math.sin(a)*90,
            4,
            "#8dffc1"
        );
    }
}


/* =========================================================
   BONUS
========================================================= */

$("claimBonus").onclick=()=>{
    reward(1000);
};

$("claimBonus2").onclick=()=>{
    reward(750);
};


/* =========================================================
   SUPPORT
========================================================= */

$("supportForm").addEventListener("submit",e=>{
    e.preventDefault();

    toast("Звернення підготовлено");

    e.target.reset();
});


/* =========================================================
   STARTUP
========================================================= */

if(state.user){
    enterApp();
}else{
    $("authScreen").classList.remove("hidden");
    $("app").classList.add("hidden");
}

setAuthMode("login");