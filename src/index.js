import "./assets/sass/minesweeper-js.scss";
import HeaderUI from "./headerui";
import SolverUI from "./solverui";
import GameUI from "./gameui";

export default class AllUI {
  constructor(game, solver, difficulty) {
    this.game = game;
    this.solver = solver;
    this.difficulty = difficulty;
  }

  /**
   * Creates the UI for the complete game
   * ... the header, game board, and solver
   */
  create() {
    this.headerUI = new HeaderUI(this.newGame.bind(this), this.difficulty);
    this.gameUI = new GameUI(this.game, this.announceOutcome, this.toggleTimer.bind(this), this.setMineCount, this.clearAlert);
    if(this.solver) {
      this.solverUI = new SolverUI(this.solver, this.setClickable, this.setMineable);
    }

    const minesweeper = document.createElement("div");
    minesweeper.classList.add("minesweeper-js");
    const container = document.createElement("div");
    container.id = "ms-js-game-container";
    container.appendChild(this.headerUI.create());
    container.appendChild(this.gameUI.create());
    minesweeper.appendChild(container);
    if(this.solver) {
      const solverContainer = document.createElement("div");
      solverContainer.id = "ms-js-solver-container";
      solverContainer.appendChild(this.solverUI.create());
      minesweeper.appendChild(solverContainer);
    }

    return minesweeper;
  }

  /**
   * Resets the board and solver and starts a new game
   * @param {Number} x
   * @param {Number} y
   * @param {Number} mines
   */
  newGame(x, y, mines) {
    this.game.newGame(x, y, mines);
    document.getElementById("ms-js-game-container").replaceChild(this.gameUI.create(), document.getElementById("ms-js-board"));
    this.stopTimer();
    this.setTime(0);
    this.setMineCount(mines);

    if(this.solver) {
      this.solver.newGame(this.game);
      document.getElementById("ms-js-solver-container").replaceChild(this.solverUI.create(), document.getElementById("ms-js-solver"));
    }
  }

  /**
   * Changes the icon on the new game button to indicate a win or loss
   * @param {Boolean} win
   */
  announceOutcome(win) {
    const outcomeBtn = document.getElementById("ms-js-new-game");
    if(win) {
      outcomeBtn.classList.add("win");
    } else {
      outcomeBtn.classList.add("loss");
    }
  }

  /**
   * Stops the game timer
   */
  stopTimer() {
    if(this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Starts and stops the game timer
   */
  toggleTimer() {
    if(this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    } else {
      this.time = 0;
      this.timer = setInterval(() => {
        this.time++;
        this.setTime(this.time);
      }, 1000);
    }
  }

  /**
   * Sets the game time in the UI
   * @param {Number} time
   */
  setTime(time) {
    if(time>=999) {
      time = 999;
    }
    document.getElementById("ms-js-timer").innerHTML = (""+time).padStart(3, "0");
  }

  /**
   * Sets the mine count in the UI
   * @param {Number} mineCount
   */
  setMineCount(mineCount) {
    const mineEl = document.getElementById("ms-js-mines");
    if(mineCount==="+") {
      mineCount = parseInt(mineEl.innerHTML)+1;
    } else if (mineCount==="-") {
      mineCount = parseInt(mineEl.innerHTML)-1;
    }
    mineEl.innerHTML = (""+mineCount).padStart(2, "0");
  }

  /**
   * Clears alerts from the solver
   */
  clearAlert() {
    if(this.solver) {
      const warning = document.getElementById("ms-js-no-move-warning");
      warning.innerHTML = "";
    }
  }

  /**
   * Marks a cell as safely clickable
   * @param {Number} x
   * @param {Number} y
   */
  setClickable(x, y) {
    let cell = document.getElementById("ms-js-cell-"+x+"-"+y);
    if(!cell.classList.contains("disabled")) {
      cell.classList.add("clickable");
    }
  }

  /**
   * Marks a cell as safely flaggable
   * @param {Number} x
   * @param {Number} y
   */
  setMineable(x, y) {
    const cell = document.getElementById("ms-js-cell-"+x+"-"+y);
    if(!cell.classList.contains("disabled")) {
      cell.classList.add("mineable");
    }
  }
}