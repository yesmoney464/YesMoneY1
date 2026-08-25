const games = [

    {
        id:"jungle",
        name:"Jungle King",
        subtitle:"Король джунглів",
        type:"jungle",
        colors:["#06140a","#397a3f","#e4c35f"]
    },

    {
        id:"candy",
        name:"Candy Rush",
        subtitle:"Солодкий світ",
        type:"candy",
        colors:["#25072d","#c44b91","#ffd477"]
    },

    {
        id:"pirate",
        name:"Golden Pirate",
        subtitle:"Полювання за скарбом",
        type:"pirate",
        colors:["#061325","#84652c","#e3c970"]
    },

    {
        id:"dragon",
        name:"Dragon Fortune",
        subtitle:"Скарби дракона",
        type:"dragon",
        colors:["#250707","#9e2b20","#efc15c"]
    },

    {
        id:"neon",
        name:"Neon City",
        subtitle:"Ніч великого міста",
        type:"neon",
        colors:["#050a1c","#315bb8","#64e0cc"]
    },

    {
        id:"temple",
        name:"Mystic Temple",
        subtitle:"Таємниця храму",
        type:"temple",
        colors:["#110f07","#77612c","#dfc976"]
    },

    {
        id:"space",
        name:"Space Fortune",
        subtitle:"Космічний джекпот",
        type:"space",
        colors:["#040617","#424a9d","#cad9ff"]
    },

    {
        id:"west",
        name:"Wild West Gold",
        subtitle:"Золото Дикого Заходу",
        type:"west",
        colors:["#1c1008","#985521","#efc665"]
    }

];


let state = JSON.parse(
    localStorage.getItem("velora_state") ||
    '{"balance":10000,"user":null}'
);

let authMode = "register";
let activeGame = null;
let stake = 100;
let spinning = false;


/* HELPERS */

function $(selector){
    return document.querySelector(selector);
}

function $all(selector){
    return [...document.querySelectorAll(selector)];
}

function money(value){
    return Math.max(
        0,
        Math.floor(value)
    ).toLocaleString("uk-UA");
}

function saveState(){
    localStorage.setItem(
        "velora_state",
        JSON.stringify(state)
    );

    updateBalance();
}

function updateBalance(){

    $("#balanceValue").textContent =
        money(state.balance);

    $("#gameBalance").textContent =
        money(state.balance);
}

function toast(message){

    const element = $("#toast");

    element.textContent = message;

    element.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(
        ()=>{
            element.classList.remove("show");
        },
        2300
    );
}


/* NAVIGATION */

function showPage(page){

    $all(".page").forEach(
        element=>{
            element.classList.toggle(
                "active",
                element.id === `page-${page}`
            );
        }
    );

    $all("[data-page]").forEach(
        button=>{
            button.classList.toggle(
                "active",
                button.dataset.page === page
            );
        }
    );

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}


$all("[data-page]").forEach(
    button=>{
        button.addEventListener(
            "click",
            ()=>{
                showPage(button.dataset.page);
            }
        );
    }
);


$("#homeButton").onclick =
    ()=>{
        showPage("home");
    };


$("#profileButton").onclick =
    ()=>{
        showPage("profile");
    };


/* AUTH */

function openAuth(mode){

    authMode = mode;

    $("#authModal")
        .classList.remove("hidden");

    const register =
        mode === "register";

    $("#authTitle").textContent =
        register
        ? "Створити акаунт"
        : "Вхід";

    $("#authDescription").textContent =
        register
        ? "Створи локальний тестовий профіль."
        : "Увійди до свого профілю.";

    $("#authName").style.display =
        register
        ? "block"
        : "none";

    $("#authSubmit").textContent =
        register
        ? "Зареєструватися"
        : "Увійти";

    $("#switchAuth").textContent =
        register
        ? "Вже маєш акаунт? Увійти"
        : "Створити новий акаунт";
}


$("#loginOpen").onclick =
    ()=>{
        openAuth("login");
    };


$("#registerOpen").onclick =
    ()=>{
        openAuth("register");
    };


$("#closeAuth").onclick =
    ()=>{
        $("#authModal")
            .classList.add("hidden");
    };


$("#switchAuth").onclick =
    ()=>{
        openAuth(
            authMode === "register"
            ? "login"
            : "register"
        );
    };


$("#authForm").onsubmit =
    event=>{

        event.preventDefault();

        const email =
            $("#authEmail")
            .value
            .trim();

        const name =
            $("#authName")
            .value
            .trim();

        if(!email){
            return;
        }

        state.user = {

            name:
                authMode === "register"
                ? (name || "Гравець")
                : "Гравець",

            email:email

        };

        saveState();

        $("#authModal")
            .classList.add("hidden");

        $("#loadingScreen")
            .classList.remove("hidden");

        setTimeout(
            ()=>{
                $("#loadingScreen")
                    .classList.add("hidden");

                $("#welcomeScreen")
                    .classList.add("hidden");

                $("#app")
                    .classList.remove("hidden");

                $("#profileName")
                    .textContent =
                    state.user.name;

                $("#profileEmail")
                    .textContent =
                    state.user.email;

                showPage("home");

                toast(
                    "Ласкаво просимо до VELORA"
                );

            },
            3400
        );
    };


/* SUPPORT */

$("#welcomeSupport").onclick =
    ()=>{

        $("#welcomeScreen")
            .classList.add("hidden");

        $("#app")
            .classList.remove("hidden");

        showPage("support");
    };


$("#supportForm").onsubmit =
    event=>{

        event.preventDefault();

        localStorage.setItem(
            "velora_support",
            JSON.stringify({
                email:
                    $("#supportEmail").value,

                subject:
                    $("#supportSubject").value,

                message:
                    $("#supportMessage").value
            })
        );

        event.target.reset();

        toast(
            "Звернення збережено"
        );
    };


/* GAME CARDS */

function gameCard(game){

    return `

        <article class="game-card">

            <div class="game-art">

                <canvas
                    data-scene="${game.type}"
                ></canvas>

            </div>

            <div class="game-info">

                <h3>
                    ${game.name}
                </h3>

                <p>
                    ${game.subtitle}
                </p>

                <button
                    class="play-button"
                    data-game="${game.id}"
                >
                    Грати
                </button>

            </div>

        </article>

    `;
}


function renderGames(){

    $("#homeGames").innerHTML =
        games
        .slice(0,4)
        .map(gameCard)
        .join("");

    $("#allGames").innerHTML =
        games
        .map(gameCard)
        .join("");

    $all("canvas[data-scene]")
        .forEach(
            canvas=>{
                drawCard(canvas);
            }
        );
}


/* CARD ART */

function setupCanvas(canvas){

    const ratio =
        window.devicePixelRatio || 1;

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    canvas.width =
        width * ratio;

    canvas.height =
        height * ratio;

    const ctx =
        canvas.getContext("2d");

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    return {
        ctx,
        width,
        height
    };
}


function background(
    ctx,
    width,
    height,
    first,
    second
){

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            width,
            height
        );

    gradient.addColorStop(
        0,
        first
    );

    gradient.addColorStop(
        1,
        second
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );
}


function circle(
    ctx,
    x,
    y,
    radius,
    color
){

    ctx.fillStyle =
        color;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


function drawCard(canvas){

    const game =
        games.find(
            item =>
                item.type ===
                canvas.dataset.scene
        );

    if(!game){
        return;
    }

    const {
        ctx,
        width,
        height
    } = setupCanvas(canvas);

    background(
        ctx,
        width,
        height,
        game.colors[0],
        game.colors[1]
    );

    drawDecor(
        ctx,
        width,
        height,
        game
    );

    switch(game.type){

        case "jungle":
            drawJungle(
                ctx,
                width,
                height,
                game
            );
            break;

        case "candy":
            drawCandy(
                ctx,
                width,
                height,
                game
            );
            break;

        case "pirate":
            drawPirate(
                ctx,
                width,
                height,
                game
            );
            break;

        case "dragon":
            drawDragon(
                ctx,
                width,
                height,
                game
            );
            break;

        case "neon":
            drawNeon(
                ctx,
                width,
                height,
                game
            );
            break;

        case "temple":
            drawTemple(
                ctx,
                width,
                height,
                game
            );
            break;

        case "space":
            drawSpace(
                ctx,
                width,
                height,
                game
            );
            break;

        case "west":
            drawWest(
                ctx,
                width,
                height,
                game
            );
            break;
    }
}


function drawDecor(
    ctx,
    width,
    height,
    game
){

    for(
        let i=0;
        i<18;
        i++
    ){

        const x =
            (i * 71) % width;

        const y =
            (i * 37) % height;

        circle(
            ctx,
            x,
            y,
            1 + i % 3,
            game.colors[2]
        );
    }
}


/* JUNGLE */

function drawJungle(
    ctx,
    w,
    h,
    game
){

    circle(
        ctx,
        w*.5,
        h*.45,
        48,
        "#5b3826"
    );

    circle(
        ctx,
        w*.5,
        h*.38,
        36,
        "#70472d"
    );

    circle(
        ctx,
        w*.45,
        h*.37,
        4,
        "#e9cc72"
    );

    circle(
        ctx,
        w*.55,
        h*.37,
        4,
        "#e9cc72"
    );

    ctx.fillStyle =
        "#20140f";

    ctx.fillRect(
        w*.45,
        h*.48,
        w*.1,
        6
    );

    ctx.fillStyle =
        game.colors[2];

    ctx.beginPath();

    ctx.moveTo(
        w*.42,
        h*.28
    );

    ctx.lineTo(
        w*.47,
        h*.17
    );

    ctx.lineTo(
        w*.51,
        h*.27
    );

    ctx.lineTo(
        w*.56,
        h*.17
    );

    ctx.lineTo(
        w*.61,
        h*.29
    );

    ctx.fill();
}


/* CANDY */

function drawCandy(
    ctx,
    w,
    h,
    game
){

    circle(
        ctx,
        w*.5,
        h*.48,
        48,
        "#f2a7d0"
    );

    circle(
        ctx,
        w*.46,
        h*.43,
        5,
        "#37163b"
    );

    circle(
        ctx,
        w*.54,
        h*.43,
        5,
        "#37163b"
    );

    ctx.fillStyle =
        "#8c2c68";

    ctx.fillRect(
        w*.45,
        h*.53,
        w*.1,
        5
    );

    for(
        let i=0;
        i<5;
        i++
    ){

        ctx.strokeStyle =
            "#ffd477";

        ctx.lineWidth=7;

        ctx.beginPath();

        ctx.arc(
            25+i*60,
            35+(i%2)*35,
            13,
            0,
            Math.PI*1.4
        );

        ctx.stroke();
    }
}


/* PIRATE */

function drawPirate(
    ctx,
    w,
    h,
    game
){

    ctx.fillStyle =
        "#121b23";

    ctx.beginPath();

    ctx.moveTo(
        w*.16,
        h*.63
    );

    ctx.lineTo(
        w*.84,
        h*.63
    );

    ctx.lineTo(
        w*.68,
        h*.79
    );

    ctx.lineTo(
        w*.32,
        h*.79
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle =
        "#d6c27e";

    ctx.fillRect(
        w*.49,
        h*.2,
        4,
        h*.5
    );

    ctx.fillStyle =
        "#e8dfc4";

    ctx.beginPath();

    ctx.moveTo(
        w*.51,
        h*.22
    );

    ctx.lineTo(
        w*.75,
        h*.35
    );

    ctx.lineTo(
        w*.51,
        h*.5
    );

    ctx.closePath();

    ctx.fill();

    circle(
        ctx,
        w*.78,
        h*.24,
        18,
        "#d8b650"
    );
}


/* DRAGON */

function drawDragon(
    ctx,
    w,
    h,
    game
){

    ctx.fillStyle =
        "#68140e";

    ctx.beginPath();

    ctx.moveTo(
        w*.28,
        h*.7
    );

    ctx.quadraticCurveTo(
        w*.28,
        h*.25,
        w*.55,
        h*.33
    );

    ctx.quadraticCurveTo(
        w*.8,
        h*.18,
        w*.7,
        h*.7
    );

    ctx.quadraticCurveTo(
        w*.5,
        h*.8,
        w*.28,
        h*.7
    );

    ctx.fill();

    circle(
        ctx,
        w*.52,
        h*.4,
        25,
        "#ad3022"
    );

    ctx.fillStyle =
        "#efc35e";

    ctx.beginPath();

    ctx.moveTo(
        w*.48,
        h*.42
    );

    ctx.lineTo(
        w*.52,
        h*.28
    );

    ctx.lineTo(
        w*.56,
        h*.42
    );

    ctx.fill();
}


/* NEON */

function drawNeon(
    ctx,
    w,
    h,
    game
){

    for(
        let i=0;
        i<9;
        i++
    ){

        ctx.fillStyle =
            i%2
            ? "#162a58"
            : "#0d1937";

        ctx.fillRect(
            i*w/9,
            h*.35-(i%3)*12,
            w/11,
            h*.5
        );
    }

    ctx.strokeStyle =
        "#62e2cf";

    ctx.lineWidth=4;

    ctx.beginPath();

    ctx.moveTo(
        0,
        h*.72
    );

    ctx.lineTo(
        w*.25,
        h*.58
    );

    ctx.lineTo(
        w*.48,
        h*.7
    );

    ctx.lineTo(
        w*.75,
        h*.48
    );

    ctx.lineTo(
        w,
        h*.62
    );

    ctx.stroke();

    circle(
        ctx,
        w*.75,
        h*.25,
        25,
        "#4775ff"
    );
}


/* TEMPLE */

function drawTemple(
    ctx,
    w,
    h,
    game
){

    ctx.fillStyle =
        "#574622";

    ctx.fillRect(
        w*.18,
        h*.3,
        w*.64,
        h*.5
    );

    ctx.fillStyle =
        "#a58a46";

    for(
        let i=0;
        i<4;
        i++
    ){

        ctx.fillRect(
            w*(.23+i*.17),
            h*.38,
            25,
            h*.42
        );
    }

    ctx.fillStyle =
        "#090907";

    ctx.beginPath();

    ctx.moveTo(
        w*.42,
        h*.8
    );

    ctx.lineTo(
        w*.5,
        h*.55
    );

    ctx.lineTo(
        w*.58,
        h*.8
    );

    ctx.fill();

    circle(
        ctx,
        w*.5,
        h*.25,
        35,
        "#d9c26f"
    );
}


/* SPACE */

function drawSpace(
    ctx,
    w,
    h,
    game
){

    circle(
        ctx,
        w*.5,
        h*.5,
        52,
        "#4b62bb"
    );

    circle(
        ctx,
        w*.5,
        h*.5,
        39,
        "#7185d5"
    );

    ctx.strokeStyle =
        "#cbd9ff";

    ctx.lineWidth=2;

    ctx.beginPath();

    ctx.ellipse(
        w*.5,
        h*.5,
        85,
        27,
        -.2,
        0,
        Math.PI*2
    );

    ctx.stroke();

    circle(
        ctx,
        w*.78,
        h*.28,
        17,
        "#d8dfff"
    );
}


/* WEST */

function drawWest(
    ctx,
    w,
    h,
    game
){

    ctx.fillStyle =
        "#8b4e1e";

    ctx.fillRect(
        w*.16,
        h*.44,
        w*.68,
        h*.34
    );

    ctx.fillStyle =
        "#3b2110";

    ctx.fillRect(
        w*.22,
        h*.53,
        16,
        h*.25
    );

    ctx.fillRect(
        w*.7,
        h*.53,
        16,
        h*.25
    );

    circle(
        ctx,
        w*.5,
        h*.4,
        34,
        "#d69b42"
    );

    ctx.fillStyle =
        "#5a3216";

    ctx.fillRect(
        w*.44,
        h*.35,
        w*.12,
        8
    );
}


/* GAME */

function openGame(id){

    const game =
        games.find(
            item=>item.id===id
        );

    if(!game){
        return;
    }

    activeGame = game;

    $("#gameTitle")
        .textContent =
        game.name.toUpperCase();

    $("#gameModal")
        .classList.remove("hidden");

    buildGame(game);

    updateBalance();
}


function closeGame(){

    $("#gameModal")
        .classList.add("hidden");

    $("#gameContainer")
        .innerHTML="";

    activeGame=null;

    spinning=false;
}


$("#gameBack").onclick =
    closeGame;


document.addEventListener(
    "click",
    event=>{

        const button =
            event.target.closest(
                "[data-game]"
            );

        if(
            button &&
            !spinning
        ){

            openGame(
                button.dataset.game
            );
        }
    }
);


/* GAME ENGINE */

function buildGame(game){

    $("#gameContainer").innerHTML = `

        <div class="game-stage">

            <div class="game-board">

                <canvas
                    id="gameCanvas"
                ></canvas>

                <div
                    class="game-result"
                    id="gameResult"
                ></div>

                <div class="game-controls">

                    <div class="stake-control">
                        Ставка:
                        <b id="stakeValue">
                            ${money(stake)}
                        </b>
                    </div>

                    <button
                        class="dark-button"
                        id="stakeMinus"
                    >
                        −
                    </button>

                    <button
                        class="dark-button"
                        id="stakePlus"
                    >
                        +
                    </button>

                    <button
                        class="spin-button"
                        id="spinButton"
                    >
                        ЗАПУСТИТИ
                    </button>

                </div>

            </div>

        </div>

    `;

    drawGameBoard(
        game,
        0
    );

    $("#stakeMinus").onclick =
        ()=>{
            stake =
                Math.max(
                    50,
                    stake-50
                );

            $("#stakeValue")
                .textContent =
                money(stake);
        };

    $("#stakePlus").onclick =
        ()=>{
            stake =
                Math.min(
                    1000,
                    stake+50
                );

            $("#stakeValue")
                .textContent =
                money(stake);
        };

    $("#spinButton").onclick =
        spin;
}


function drawGameBoard(
    game,
    shift
){

    const canvas =
        $("#gameCanvas");

    if(!canvas){
        return;
    }

    const {
        ctx,
        width,
        height
    } =
        setupCanvas(canvas);

    background(
        ctx,
        width,
        height,
        game.colors[0],
        game.colors[1]
    );

    drawGameCharacter(
        ctx,
        width,
        height,
        game
    );

    drawReels(
        ctx,
        width,
        height,
        shift,
        game
    );
}


function drawReels(
    ctx,
    w,
    h,
    shift,
    game
){

    const columns=5;
    const rows=3;

    const reelWidth =
        Math.min(
            120,
            w*.72/columns
        );

    const reelHeight =
        Math.min(
            82,
            h*.38/rows
        );

    const startX =
        (w-columns*reelWidth)/2;

    const startY =
        h*.18;

    ctx.fillStyle =
        "rgba(0,0,0,.55)";

    ctx.fillRect(
        startX-10,
        startY-10,
        reelWidth*columns+20,
        reelHeight*rows+20
    );

    const symbols =
        [
            "A",
            "K",
            "Q",
            "J",
            "7",
            "9"
        ];

    for(
        let col=0;
        col<columns;
        col++
    ){

        for(
            let row=0;
            row<rows;
            row++
        ){

            const x =
                startX+
                col*reelWidth;

            const y =
                startY+
                row*reelHeight;

            ctx.fillStyle =
                "rgba(255,255,255,.045)";

            ctx.fillRect(
                x+3,
                y+3,
                reelWidth-6,
                reelHeight-6
            );

            const index =
                (
                    col*3+
                    row+
                    Math.floor(
                        shift/8
                    )
                ) %
                symbols.length;

            const symbol =
                symbols[index];

            ctx.textAlign="center";

            ctx.textBaseline="middle";

            ctx.font=
                `900 ${Math.floor(
                    reelHeight*.4
                )}px Arial`;

            ctx.fillStyle =
                row===1
                ? game.colors[2]
                : "#f1eee5";

            ctx.fillText(
                symbol,
                x+reelWidth/2,
                y+reelHeight/2
            );
        }
    }

    ctx.strokeStyle =
        "rgba(238,201,105,.5)";

    ctx.lineWidth=2;

    ctx.strokeRect(
        startX,
        startY+reelHeight,
        reelWidth*columns,
        reelHeight
    );
}


function drawGameCharacter(
    ctx,
    w,
    h,
    game
){

    const x =
        w*.5;

    const y =
        h*.08;

    if(game.type==="jungle"){

        circle(
            ctx,
            x,
            y+15,
            27,
            "#6b442b"
        );

    }

    if(game.type==="candy"){

        circle(
            ctx,
            x,
            y+15,
            28,
            "#f1a8cf"
        );

    }

    if(game.type==="pirate"){

        circle(
            ctx,
            x,
            y+15,
            27,
            "#d4a06b"
        );

        ctx.fillStyle="#111";

        ctx.fillRect(
            x-28,
            y-12,
            56,
            12
        );

    }

    if(game.type==="dragon"){

        circle(
            ctx,
            x,
            y+15,
            30,
            "#a82f22"
        );

    }

    if(game.type==="neon"){

        circle(
            ctx,
            x,
            y+15,
            26,
            "#4f7dff"
        );

    }

    if(game.type==="temple"){

        circle(
            ctx,
            x,
            y+15,
            28,
            "#d0b96b"
        );

    }

    if(game.type==="space"){

        circle(
            ctx,
            x,
            y+15,
            28,
            "#7186d8"
        );

    }

    if(game.type==="west"){

        circle(
            ctx,
            x,
            y+15,
            27,
            "#d69b42"
        );

    }
}


/* SPIN */

function spin(){

    if(spinning){
        return;
    }

    if(state.balance<stake){

        toast(
            "Недостатньо віртуальних кредитів"
        );

        return;
    }

    spinning=true;

    state.balance -= stake;

    saveState();

    $("#gameResult")
        .textContent="";

    let frame=0;

    const timer =
        setInterval(
            ()=>{

                if(!activeGame){
                    clearInterval(timer);
                    spinning=false;
                    return;
                }

                drawGameBoard(
                    activeGame,
                    frame
                );

                frame+=3;

                if(frame>60){

                    clearInterval(timer);

                    finishSpin();
                }

            },
            55
        );
}


function finishSpin(){

    const won =
        Math.random()<.38;

    let multiplier=0;

    if(won){

        const values =
            [1,2,3,5,8];

        multiplier =
            values[
                Math.floor(
                    Math.random()*
                    values.length
                )
            ];
    }

    const win =
        stake*multiplier;

    state.balance += win;

    saveState();

    if(win){

        $("#gameResult")
            .textContent =
            `Виграш +${money(win)}`;

        toast(
            `Виграш +${money(win)}`
        );

    }else{

        $("#gameResult")
            .textContent =
            "Цього разу без виграшу";

    }

    spinning=false;
}


/* BONUSES */

$all(".bonus-button")
    .forEach(
        button=>{

            button.onclick =
                ()=>{

                    const amount =
                        Number(
                            button.dataset.bonus
                        );

                    state.balance +=
                        amount;

                    saveState();

                    toast(
                        `Додано ${money(amount)}`
                    );
                };
        }
    );


/* START */

renderGames();

updateBalance();