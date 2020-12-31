export default class GameUI {
  constructor(game, announceOutcome, toggleTimer, setMineCount, clearAlert) {
    this.game = game;
    this.announceOutcome = announceOutcome;
    this.toggleTimer = toggleTimer;
    this.setMineCount = setMineCount;
    this.clearAlert = clearAlert;
  }

  create() {
    const table = document.createElement("table");
    table.id = "ms-js-board";
    table.classList.add("board");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("cellpadding", "0");
    for(let i=0; i<this.game.getLength(); i++) {
      table.appendChild(this.row(i));
    }
    let hoveredCell = null;
    let leftMouse = false;
    let rightMouse = false;
    let ctrlKey = false;
    let mouseWheel = false;
    table.addEventListener("contextmenu", (e) => { e.preventDefault(); return false; });
    table.addEventListener("mousewheel", (e) => { e.preventDefault(); return false; });
    table.addEventListener("mouseover", (e) => {
      // if button -> not the table
      if(e.target.classList.contains("cell-btn")) {
        hoveredCell = e.target;
        // if left and right click, depress all neighboring cells
        if((leftMouse && rightMouse) || (mouseWheel) || (leftMouse && ctrlKey)) {
          // press cell and neighbors
          this.pressNeighbors(hoveredCell);
        } else if (leftMouse && !hoveredCell.classList.contains("disabled") && !hoveredCell.classList.contains("flag")) {
          // press current cell
          hoveredCell.classList.add("active");
        }
      }
    });
    table.addEventListener("mouseout", (e) => {
      hoveredCell = null;
      //if leaving game area clear clicks
      if(e.target.classList.contains("board")) {
        leftMouse = false;
        rightMouse = false;
      // if leaving button, remove depressions
      } else if (e.target.classList.contains("cell-btn")) {
        if((leftMouse && rightMouse) || (mouseWheel) || (leftMouse && ctrlKey)) {
          // unpress cell and neighbors
          this.unpressNeighbors(e.target);
        } else if (leftMouse) {
          // unpress current cell
          e.target.classList.remove("active");
        }
      }
    });
    table.addEventListener("mousedown", (e) => {
      // if button -> not the table
      if(e.target.classList.contains("cell-btn")) {
        if(e.button===0) {
          leftMouse = true;
        } else if (e.button===1) {
          mouseWheel = true;
        } else if(e.button===2) {
          rightMouse = true;
        }
        ctrlKey = e.ctrlKey;

        if((leftMouse && rightMouse) || (mouseWheel) || (leftMouse && ctrlKey)) {
          // press cell and neighbors
          this.pressNeighbors(hoveredCell);
        } else if (leftMouse && !hoveredCell.classList.contains("disabled") && !hoveredCell.classList.contains("flag")) {
          // press current cell
          hoveredCell.classList.add("active");
        }
      }
    });

    let firstMove = true;
    table.addEventListener("mouseup", (e) => {
      // if button -> not the table
      if(e.target.classList.contains("cell-btn")) {
        // clear no moves alert if set
        this.clearAlert();

        if(firstMove) {
          firstMove = false;
          this.toggleTimer();
        }

        // process the click
        this.processClick(hoveredCell, leftMouse, rightMouse, mouseWheel, ctrlKey);

        // unset mouse click state
        if(e.button===0) {
          leftMouse = false;
        } else if (e.button===1) {
          mouseWheel = false;
        } else if(e.button===2) {
          rightMouse = false;
        }
        ctrlKey = e.ctrlKey;
        return false;
      }
    });

    return table;
  }

  /**
   * Presses down on the current cell and all neightbors
   * @param {HTMLELement} cell
   */
  pressNeighbors(cell) {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    this.getNeighbors(x, y).forEach((cell) => {
      if(!cell.classList.contains("disabled") && !cell.classList.contains("flag")) {
        cell.classList.add("active");
      }
    });
  }

  /**
   * Unpresses down on the current cell and all neightbors
   * @param {HTMLELement} cell
   */
  unpressNeighbors(cell) {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    this.getNeighbors(x, y).forEach((cell) => {
      cell.classList.remove("active");
    });
  }

  /**
   * Returns this cell and all its neighbors
   * @param {Number} x
   * @param {Number} y
   */
  getNeighbors(x, y) {
    let neighbors = [];
    for(let i=Math.max(0, y-1); i<Math.min(this.game.getLength(), y+2); i++) {
      for(let j=Math.max(0, x-1); j<Math.min(this.game.getWidth(), x+2); j++) {
        neighbors.push(document.getElementById("ms-js-cell-" + j + "-" + i));
      }
    }
    return neighbors;
  }

  /**
   * Controller for what actions should be taken for a click on a cell
   * @param {HTMLElement} cell
   * @param {Boolean} leftMouse
   * @param {Boolean} rightMouse
   * @param {Boolean} mouseWheel
   * @param {Boolean} ctrlKey
   */
  processClick(cell, leftMouse, rightMouse, mouseWheel, ctrlKey) {
    let outcomes = [];
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    // if both click, mousewheel click, or left+ctrl click, then clear all neighbors
    if((leftMouse && rightMouse) || (mouseWheel) || (leftMouse && ctrlKey)) {
      this.unpressNeighbors(cell);
      outcomes = this.game.clearNeighbors(x, y);
    } else if (leftMouse) {
      if(!cell.classList.contains("disabled") && !cell.classList.contains("flag")) {
        outcomes = this.game.click(x, y);
      }
    } else if (rightMouse) {
      if(!cell.classList.contains("disabled")) {
        outcomes = this.game.toggleFlag(x, y);
      }
    }

    // process outcomes
    outcomes.forEach(outcome => {
      this.processOutcome(outcome);
    });
  }

  /**
   * Makes the adjustment to the board inidicated by
   * the outcome of a click in the game
   * @param {Object} outcome
   */
  processOutcome(outcome) {
    // if has state outcome, then indictates win or loss
    if(outcome.state) {
      if(outcome.state==="LOSE") {
        let tempCell = document.getElementById("ms-js-cell-"+outcome.x+"-"+outcome.y);
        tempCell.classList.add("mine", "losing-move", "disabled");
        this.announceOutcome(false);
      } else if(outcome.state==="WIN") {
        this.announceOutcome(true);
      }

      // stop timer
      this.toggleTimer();

    // else reveal or flag
    } else {
      // if value is boolean then indicates toggle flag state
      if(typeof outcome.value==="boolean") {
        if(outcome.value) {
          let tempCell = document.getElementById("ms-js-cell-"+outcome.x+"-"+outcome.y);
          tempCell.classList.add("flag");
          this.setMineCount("-");
        } else {
          let tempCell = document.getElementById("ms-js-cell-"+outcome.x+"-"+outcome.y);
          tempCell.classList.remove("flag");
          this.setMineCount("+");
        }
      // else is reveal cell
      } else {
        let tempCell = document.getElementById("ms-js-cell-"+outcome.x+"-"+outcome.y);
        if(outcome.value==="X") {
          tempCell.classList.add("mine", "disabled");
        } else if (outcome.value===0) {
          tempCell.classList.add("zero", "disabled");
        } else {
          tempCell.classList.add(this.getNumberClass(outcome.value), "disabled");
          tempCell.innerHTML = outcome.value;
        }
      }
    }
  }

  /**
   * Returns the style class for a cell value
   * @param {Number} number
   */
  getNumberClass(number) {
    const numberClass = [
      "zero", "one", "two", "three", "four",
      "five", "six", "seven", "eight"
    ];
    return numberClass[number];
  }

  /**
   * Creates a cell row in the ui
   * @param {Number} y
   */
  row(y) {
    const row = document.createElement("tr");
    for(let i=0; i<this.game.getWidth(); i++) {
      row.appendChild(this.cell(i, y));
    }
    return row;
  }

  /**
   * Creates a cell in the ui
   * @param {Number} x
   * @param {Number} y
   */
  cell(x, y) {
    const cell = document.createElement("td");
    cell.id = "ms-js-cell-" + x + "-" + y;
    cell.dataset.x = x;
    cell.dataset.y = y;
    cell.classList = "cell-btn";

    return cell;
  }
}