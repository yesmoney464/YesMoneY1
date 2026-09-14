/* =========================================================
   VELORA — DEMO GAME ENGINE
   Virtual credits only.
========================================================= */

const state = {
  balance: 10000,
  bet: 20,
  spinning: false,
  turbo: false,
  auto: false,
  autoTimer: null,
  currentGame: "candy",
  lastWin: 0
};


/* =========================================================
   ELEMENTS
========================================================= */

const balanceEl = document.getElementById("balance");
const gameBalanceEl = document.getElementById("gameBalance");
const betValueEl = document.getElementById("betValue");
const winAmountEl = document.getElementById("winAmount");
const reelsEl = document.getElementById("reels");
const statusEl = document.getElementById("statusText");
const gameOverlay = document.getElementById("gameOverlay");
const gameTitle = document.getElementById("slotTitle");
const gameName = document.getElementById("gameName");
const slotCategory = document.getElementById("slotCategory");
const spinButton = document.getElementById("spinButton");


/* =========================================================
   GAME DATA
========================================================= */

const games = {

  candy: {
    title: "CANDY KINGDOM",
    category: "VELORA ORIGINAL • CASCADE",
    columns: 6,
    rows: 5,

    symbols: [
      { id: "A", class: "candy", value: 2 },
      { id: "B", class: "candy", value: 3 },
      { id: "C", class: "blue", value: 4 },
      { id: "D", class: "red", value: 5 },
      { id: "E", class: "gold", value: 8 },
      { id: "W", class: "green", value: 15 }
    ]
  },

  myth: {
    title: "OLYMPUS FATE",
    category: "VELORA ORIGINAL • MULTIPLIERS",
    columns: 6,
    rows: 5,

    symbols: [
      { id: "A", class: "gold", value: 2 },
      { id: "B", class: "blue", value: 3 },
      { id: "C", class: "myth", value: 4 },
      { id: "D", class: "red", value: 6 },
      { id: "E", class: "gold", value: 10 },
      { id: "M", class: "green", value: 20 }
    ]
  },

  jungle: {
    title: "JUNGLE FORTUNE",
    category: "VELORA ORIGINAL • WILDS",
    columns: 5,
    rows: 3,

    symbols: [
      { id: "A", class: "green", value: 2 },
      { id: "B", class: "green", value: 3 },
      { id: "C", class: "blue", value: 4 },
      { id: "D", class: "red", value: 6 },
      { id: "E", class: "gold", value: 10 },
      { id: "W", class: "green", value: 18 }
    ]
  }

};


/* =========================================================
   SYMBOL VISUALS
========================================================= */

const symbolVisuals = {
  A: "◆",
  B: "●",
  C: "✦",
  D: "♦",
  E: "◇",
  W: "W"
};


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(id) {

  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


document.querySelectorAll("[data-section]").forEach(button => {

  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });

});


document.getElementById("heroGames").addEventListener("click", () => {
  showSection("games");
});


document.getElementById("heroPlay").addEventListener("click", () => {
  openGame("candy");
});


/* =========================================================
   OPEN GAME
========================================================= */

function openGame(gameId) {

  const game = games[gameId];

  if (!game) return;

  state.currentGame = gameId;

  gameOverlay.classList.add("open");

  document.body.style.overflow = "hidden";

  gameTitle.textContent = game.title;
  gameName.textContent = "ORIGINAL";
  slotCategory.textContent = game.category;

  state.lastWin = 0;

  winAmountEl.textContent = "0";

  createReels();

  statusEl.textContent = "Зробіть обертання";

  updateUI();
}


/* =========================================================
   CLOSE GAME
========================================================= */

document.getElementById("closeGame").addEventListener("click", () => {

  stopAuto();

  gameOverlay.classList.remove("open");

  document.body.style.overflow = "";

});


/* =========================================================
   GAME CARDS
========================================================= */

document.querySelectorAll(".game-card").forEach(card => {

  card.addEventListener("click", event => {

    if (event.target.closest(".play-card")) {
      openGame(card.dataset.game);
      return;
    }

    if (card.dataset.game) {
      openGame(card.dataset.game);
    }

  });

});


/* =========================================================
   CREATE REELS
========================================================= */

function createReels() {

  const game = games[state.currentGame];

  reelsEl.innerHTML = "";

  for (let col = 0; col < game.columns; col++) {

    const column = document.createElement("div");

    column.className = "reel-column";

    for (let row = 0; row < game.rows; row++) {

      const symbol = randomSymbol();

      column.appendChild(createSymbolElement(symbol));

    }

    reelsEl.appendChild(column);
  }
}


/* =========================================================
   CREATE SYMBOL
========================================================= */

function createSymbolElement(symbol) {

  const el = document.createElement("div");

  el.className = `symbol ${symbol.class}`;

  el.dataset.symbol = symbol.id;

  el.textContent = symbolVisuals[symbol.id] || symbol.id;

  return el;
}


/* =========================================================
   RANDOM SYMBOL
========================================================= */

function randomSymbol() {

  const game = games[state.currentGame];

  const pool = game.symbols;

  const index = Math.floor(Math.random() * pool.length);

  return pool[index];
}


/* =========================================================
   SPIN
========================================================= */

async function spin() {

  if (state.spinning) return;

  if (state.balance < state.bet) {

    statusEl.textContent = "Недостатньо віртуальних кредитів";

    return;
  }

  state.spinning = true;

  spinButton.classList.add("disabled");

  state.balance -= state.bet;

  updateUI();

  winAmountEl.textContent = "0";

  statusEl.textContent = "Барабани обертаються...";

  clearWinningSymbols();

  const duration = state.turbo ? 420 : 1050;

  await animateSpin(duration);

  const result = generateResult();

  renderResult(result);

  const win = calculateWin(result);

  await sleep(state.turbo ? 80 : 250);

  state.lastWin = win;

  if (win > 0) {

    state.balance += win;

    winAmountEl.textContent = formatMoney(win);

    statusEl.textContent = "Виграш!";

    highlightWins(result);

  } else {

    winAmountEl.textContent = "0";

    statusEl.textContent = "Спробуйте ще раз";

  }

  updateUI();

  state.spinning = false;

  spinButton.classList.remove("disabled");

  if (state.auto) {

    state.autoTimer = setTimeout(() => {

      spin();

    }, state.turbo ? 180 : 700);

  }

}


/* =========================================================
   SPIN ANIMATION
========================================================= */

function animateSpin(duration) {

  return new Promise(resolve => {

    const start = performance.now();

    function frame(now) {

      const progress = Math.min((now - start) / duration, 1);

      document.querySelectorAll(".symbol").forEach((symbol, index) => {

        const offset = (index % 6) * 25;

        symbol.style.transform =
          `translateY(${Math.sin(progress * 40 + offset) * 12}px)`;

        symbol.style.filter =
          `blur(${progress < .8 ? 1.5 : 0}px)`;

      });

      if (progress < 1) {

        requestAnimationFrame(frame);

      } else {

        document.querySelectorAll(".symbol").forEach(symbol => {

          symbol.style.transform = "";
          symbol.style.filter = "";

        });

        resolve();

      }
    }

    requestAnimationFrame(frame);
  });
}


/* =========================================================
   GENERATE RESULT
========================================================= */

function generateResult() {

  const game = games[state.currentGame];

  const result = [];

  for (let row = 0; row < game.rows; row++) {

    const currentRow = [];

    for (let col = 0; col < game.columns; col++) {

      currentRow.push(randomSymbol());

    }

    result.push(currentRow);
  }

  /*
    Small chance of producing a strong combination.
    This is only a local demo mechanic.
  */

  const roll = Math.random();

  if (roll < 0.18) {

    const symbol =
      game.symbols[
        Math.floor(Math.random() * (game.symbols.length - 1))
      ];

    const count =
      state.currentGame === "jungle" ? 3 : 4;

    for (let row = 0; row < Math.min(game.rows, count); row++) {

      result[row][0] = symbol;

    }

  }

  return result;
}


/* =========================================================
   RENDER RESULT
========================================================= */

function renderResult(result) {

  const game = games[state.currentGame];

  reelsEl.innerHTML = "";

  for (let col = 0; col < game.columns; col++) {

    const column = document.createElement("div");

    column.className = "reel-column";

    for (let row = 0; row < game.rows; row++) {

      const symbol = result[row][col];

      column.appendChild(createSymbolElement(symbol));

    }

    reelsEl.appendChild(column);
  }
}


/* =========================================================
   CALCULATE WIN
========================================================= */

function calculateWin(result) {

  const game = games[state.currentGame];

  let total = 0;

  /*
    Simple cluster/line style demo:
    checks each symbol's count across the board.
  */

  game.symbols.forEach(symbol => {

    let count = 0;

    result.forEach(row => {

      row.forEach(cell => {

        if (cell.id === symbol.id) {
          count++;
        }

      });

    });

    const required =
      state.currentGame === "jungle" ? 3 : 5;

    if (count >= required) {

      let multiplier = symbol.value;

      if (state.currentGame === "myth") {

        if (Math.random() < 0.35) {
          multiplier *= Math.floor(Math.random() * 5) + 2;
        }

      }

      total += state.bet * multiplier;

    }

  });

  /*
    Hard cap keeps demo balances reasonable.
  */

  return Math.min(Math.floor(total), state.bet * 250);
}


/* =========================================================
   HIGHLIGHT WINS
========================================================= */

function highlightWins(result) {

  const game = games[state.currentGame];

  const elements =
    document.querySelectorAll(".symbol");

  let index = 0;

  game.symbols.forEach(symbol => {

    let count = 0;

    result.forEach(row => {

      row.forEach(cell => {

        if (cell.id === symbol.id) {
          count++;
        }

      });

    });

    const required =
      state.currentGame === "jungle" ? 3 : 5;

    if (count >= required) {

      result.forEach(row => {

        row.forEach(cell => {

          if (cell.id === symbol.id && elements[index]) {
            elements[index].classList.add("win");
          }

          index++;
        });

      });

    } else {

      index += result.length * game.columns;

      index = 0;

      /*
        Recalculate visual index cleanly below.
      */

      document.querySelectorAll(".symbol").forEach((element, i) => {

        const row = Math.floor(
          i / game.columns
        );

        const col = i % game.columns;

        if (
          result[row] &&
          result[row][col] &&
          result[row][col].id === symbol.id &&
          count >= required
        ) {
          element.classList.add("win");
        }

      });

    }

  });

}


/* =========================================================
   CLEAR WINS
========================================================= */

function clearWinningSymbols() {

  document.querySelectorAll(".symbol").forEach(symbol => {
    symbol.classList.remove("win");
  });

}


/* =========================================================
   BET
========================================================= */

document.getElementById("betMinus").addEventListener("click", () => {

  if (state.spinning) return;

  state.bet = Math.max(5, state.bet - 5);

  updateUI();

});


document.getElementById("betPlus").addEventListener("click", () => {

  if (state.spinning) return;

  state.bet = Math.min(500, state.bet + 5);

  updateUI();

});


/* =========================================================
   SPIN BUTTON
========================================================= */

spinButton.addEventListener("click", spin);


/* =========================================================
   TURBO
========================================================= */

document.getElementById("turboButton").addEventListener("click", event => {

  state.turbo = !state.turbo;

  event.currentTarget.classList.toggle(
    "active",
    state.turbo
  );

});


/* =========================================================
   AUTO
========================================================= */

document.getElementById("autoButton").addEventListener("click", event => {

  state.auto = !state.auto;

  event.currentTarget.classList.toggle(
    "active",
    state.auto
  );

  if (!state.auto) {

    stopAuto();

    return;
  }

  if (!state.spinning) {
    spin();
  }

});


function stopAuto() {

  state.auto = false;

  clearTimeout(state.autoTimer);

  state.autoTimer = null;

  const button = document.getElementById("autoButton");

  if (button) {
    button.classList.remove("active");
  }
}


/* =========================================================
   UI
========================================================= */

function updateUI() {

  balanceEl.textContent = formatMoney(state.balance);

  gameBalanceEl.textContent = formatMoney(state.balance);

  betValueEl.textContent = formatMoney(state.bet);

}


/* =========================================================
   PAYTABLE
========================================================= */

document.getElementById("paytableButton").addEventListener("click", () => {

  const game = games[state.currentGame];

  const content =
    document.getElementById("paytableContent");

  content.innerHTML = "";

  game.symbols.forEach(symbol => {

    const row = document.createElement("div");

    row.className = "pay-row";

    row.innerHTML = `
      <span>${symbolVisuals[symbol.id]} ${symbol.id}</span>
      <span>x${symbol.value}</span>
    `;

    content.appendChild(row);

  });

  document.getElementById("paytable").classList.add("open");

});


document.getElementById("closePaytable").addEventListener("click", () => {

  document.getElementById("paytable").classList.remove("open");

});


/* =========================================================
   AUTH
========================================================= */

let registerMode = false;

document.getElementById("loginBtn").addEventListener("click", () => {

  registerMode = false;

  openAuth();

});


document.getElementById("registerBtn").addEventListener("click", () => {

  registerMode = true;

  openAuth();

});


function openAuth() {

  document.getElementById("authTitle").textContent =
    registerMode ? "Реєстрація" : "Вхід";

  document.getElementById("switchAuth").textContent =
    registerMode
      ? "У мене вже є акаунт"
      : "Створити акаунт";

  document.getElementById("authModal").classList.add("open");

}


document.getElementById("closeAuth").addEventListener("click", () => {

  document.getElementById("authModal").classList.remove("open");

});


document.getElementById("switchAuth").addEventListener("click", () => {

  registerMode = !registerMode;

  openAuth();

});


document.getElementById("authSubmit").addEventListener("click", () => {

  const email =
    document.getElementById("authEmail").value.trim();

  const password =
    document.getElementById("authPassword").value.trim();

  if (!email || !password) {

    alert("Заповніть email та пароль.");

    return;
  }

  document.getElementById("authModal").classList.remove("open");

  alert(
    registerMode
      ? "Демо-реєстрацію завершено."
      : "Демо-вхід виконано."
  );

});


/* =========================================================
   SUPPORT
========================================================= */

document.getElementById("supportSend").addEventListener("click", () => {

  alert(
    "Повідомлення підготовлено. У реальній версії тут буде відправка на сервер."
  );

});


/* =========================================================
   HELPERS
========================================================= */

function formatMoney(value) {

  return Math.floor(value)
    .toLocaleString("uk-UA");

}


function sleep(ms) {

  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });

}


/* =========================================================
   INITIALIZE
========================================================= */

createReels();

updateUI();