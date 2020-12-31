export default class SolverUI {
  constructor(solver, setClickable, setMineable) {
    this.solver = solver;
    this.setClickable = setClickable;
    this.setMineable = setMineable;
  }

  /**
   * Creates the UI for the solver
   */
  create() {
    const solverDiv = document.createElement("div");
    solverDiv.id = "ms-js-solver";
    solverDiv.classList.add("solver");

    const btnDiv = document.createElement("div");
    btnDiv.classList.add("w-100");
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.classList.add("solver-btn");
    btn.innerHTML = "Help";
    btnDiv.appendChild(btn);

    let moves = [];
    let movesIndex = 0;
    btn.addEventListener("click", () => {
      // if game over, do nothing
      if(this.solver.game.over) {
        return false;
      }

      // if this position wasn"t already scouted, then fetch moves
      if(this.solver.game.lastXPlayed!==this.solver.lastXScouted || this.solver.game.lastYPlayed!==this.solver.lastYScouted) {
        moves = this.solver.getAllPlays();
      }

      // if no moves then alert
      if(moves.length===0) {
        this.alertNoMoves();
      } else {
        // if shown all moves, reset back to beginning
        if(movesIndex>=moves.length) {
          movesIndex = 0;
        }

        this.displayMove(moves[movesIndex]);
        movesIndex++;
      }
    });

    solverDiv.appendChild(btnDiv);

    const noMovesWarning = document.createElement("div");
    noMovesWarning.id = "ms-js-no-move-warning";
    noMovesWarning.classList.add("w-100", "text-emphasize", "padding-top");
    solverDiv.appendChild(noMovesWarning);

    const tipSection = document.createElement("div");
    tipSection.id = "ms-js-tip";
    tipSection.classList.add("tip", "flex-container");
    const tipBoardState = document.createElement("div");
    tipBoardState.id = "ms-js-tip-board-state";
    tipSection.appendChild(tipBoardState);
    const tipPattern = document.createElement("div");
    tipPattern.id = "ms-js-tip-pattern";
    tipSection.appendChild(tipPattern);
    const tipMove = document.createElement("div");
    tipMove.id = "ms-js-tip-move";
    tipSection.appendChild(tipMove);
    solverDiv.appendChild(tipSection);
    return solverDiv;
  }

  alertNoMoves() {
    const warning = document.getElementById("ms-js-no-move-warning");
    warning.innerHTML = "Not sure of any moves at the moment. Take a guess";
  }

  displayMove(move)
  {
    const tip = document.getElementById("ms-js-tip");
    const rule = this.solver.rules.getRule(move.ruleKey);
    let size = 3;
    if(rule) {
      size = rule.pattern[0].length;
    }
    let gameTemplate = this.solver.getArea(move.x, move.y, size);
    tip.replaceChild(this.createGameTemplate(gameTemplate), document.getElementById("ms-js-tip-board-state"));
    if(rule) {
      let patternTemplate = rule.pattern;
      let moveTemplate = rule.solution;
      //rotate move template until in correct position
      for(let i=0; i<move.rotation; i++) {
        patternTemplate = this.solver.rules.rotate(patternTemplate);
        moveTemplate = this.solver.rules.rotate(moveTemplate);
      }
      tip.replaceChild(this.createPatternTemplate(patternTemplate, moveTemplate), document.getElementById("ms-js-tip-pattern"));
    } else {
      const tipEmptyPattern = document.createElement("div");
      tipEmptyPattern.id = "ms-js-tip-pattern";
      const title = document.createElement("h5");
      title.innerHTML = "Rule #"+(move.ruleKey+3)+":";
      tipEmptyPattern.appendChild(title);
      const description = document.createElement("p");
      description.classList.add("text-sm", "text-emphasize");
      const directive = document.createElement("span");
      directive.classList.add("font-weight-bold");
      if(move.ruleKey===-2) {
        description.innerHTML = "This space has the number of mines flagged in neighbors. ";
        directive.innerHTML = "Can click all unflagged neighbors.";
      } else {
        description.innerHTML = "The number of unrevealed spaces equals this space. ";
        directive.innerHTML = "Can flag all neighbors.";
      }
      description.appendChild(directive);
      tipEmptyPattern.appendChild(description);
      tip.replaceChild(tipEmptyPattern, document.getElementById("ms-js-tip-pattern"));
    }
    tip.replaceChild(this.createMoveTemplate(gameTemplate, move), document.getElementById("ms-js-tip-move"));


    // add move to game
    this.addMoveToGameBoard(move);
  }

  addMoveToGameBoard(move) {
    move.canClick.forEach((clickMove) => {
      this.setClickable(clickMove.x, clickMove.y);
    });
    move.canMine.forEach((mineMove) => {
      this.setMineable(mineMove.x, mineMove.y);
    });

    // remove solver-focus from previous look if exists
    let cells = document.getElementsByClassName("solver-focus");
    for(let i=0; i<cells.length; i++) {
      cells[i].classList.remove("solver-focus");
    }
    let cell = document.getElementById("ms-js-cell-"+move.x+"-"+move.y);
    cell.classList.add("solver-focus");
  }

  createGameTemplate(template) {
    const templateUI = document.createElement("div");
    templateUI.id = "ms-js-tip-board-state";
    const title = document.createElement("h5");
    title.innerHTML = "Board State:";
    templateUI.appendChild(title);
    for(let y=0; y<template.length; y++) {
      let templateRow = document.createElement("tr");
      for(let x=0; x<template[y].length; x++) {
        let templateCell = document.createElement("td");
        let yRadius = Math.floor(template.length/2);
        let xRadius = Math.floor(template[y].length/2);
        if(x===xRadius && y===yRadius) {
          templateCell.classList.add("solver-focus");
        }
        switch (template[y][x]) {
          case "E":
            templateCell.classList.add("dead");
            break;
          case "?":
            templateCell.classList.add("cell-btn");
            break;
          case "F":
            templateCell.classList.add("cell-btn", "flag");
            break;
          default:
            templateCell.classList.add(this.getNumberClass(template[y][x]), "cell-btn", "disabled");
            if(template[y][x]>0) {
              templateCell.innerHTML = "" + template[y][x];
            }
        }
        templateRow.appendChild(templateCell);
      }
      templateUI.appendChild(templateRow);
    }
    return templateUI;
  }

  createPatternTemplate(patternTemplate, moveTemplate) {
    const templateUI = document.createElement("div");
    templateUI.id = "ms-js-tip-pattern";
    const title = document.createElement("h5");
    title.innerHTML = "Pattern Match:";
    templateUI.appendChild(title);
    for(let y=0; y<patternTemplate.length; y++) {
      let templateRow = document.createElement("tr");
      for(let x=0; x<patternTemplate[y].length; x++) {
        let templateCell = document.createElement("td");
        let yRadius = Math.floor(patternTemplate.length/2);
        let xRadius = Math.floor(patternTemplate[y].length/2);
        if(x===xRadius && y===yRadius) {
          templateCell.classList.add("solver-focus");
        }

        switch (patternTemplate[y][x]) {
          // anything
          case " ":
            // if has a move show
            if(moveTemplate[y][x]==="+") {
              templateCell.classList.add("cell-btn", "clickable");
            } else if(moveTemplate[y][x]==="X") {
              templateCell.classList.add("cell-btn", "mineable");
            } else {
              templateCell.classList.add("dead");
            }
            break;
          case "-":
            templateCell.classList.add("cell-btn", "zero", "disabled");
            break;
          // not visible
          case "?":
            // if has a move show
            if(moveTemplate[y][x]==="+") {
              templateCell.classList.add("cell-btn", "clickable");
            } else if(moveTemplate[y][x]==="X") {
              templateCell.classList.add("cell-btn", "mineable");
            } else {
              templateCell.classList.add("cell-btn");
            }
            break;
          // flagged as mine
          case "F":
            templateCell.classList.add("cell-btn", "flag");
            break;
          // else number
          default:
            templateCell.classList.add(this.getNumberClass(patternTemplate[y][x]), "cell-btn", "disabled");
            if(patternTemplate[y][x]>0) {
              templateCell.innerHTML = "" + patternTemplate[y][x];
            }
        }
        templateRow.appendChild(templateCell);
      }
      templateUI.appendChild(templateRow);
    }
    return templateUI;
  }

  createMoveTemplate(gameTemplate, move) {
    const templateUI = document.createElement("div");
    templateUI.id = "ms-js-tip-move";
    const title = document.createElement("h5");
    title.innerHTML = "Moves:";
    templateUI.appendChild(title);
    for(let y=0; y<gameTemplate.length; y++) {
      let templateRow = document.createElement("tr");
      for(let x=0; x<gameTemplate[y].length; x++) {
        let templateCell = document.createElement("td");
        let yRadius = Math.floor(gameTemplate.length/2);
        let xRadius = Math.floor(gameTemplate[y].length/2);
        if(x===xRadius && y===yRadius) {
          templateCell.classList.add("solver-focus");
        }
        switch (gameTemplate[y][x]) {
          case "E":
            templateCell.classList.add("dead");
            break;
          case "?":
            if(move.canMine.find(pos => ((pos.x-move.x+xRadius)===x && (pos.y-move.y+yRadius)===y))) {
              templateCell.classList.add("cell-btn", "mineable");
            } else if (move.canClick.find(pos => ((pos.x-move.x+xRadius)===x && (pos.y-move.y+yRadius)===y))) {
              templateCell.classList.add("cell-btn", "clickable");
            }
            templateCell.classList.add("cell-btn");
            break;
          case "F":
            templateCell.classList.add("cell-btn, flag");
            break;
          default:
            templateCell.classList.add(this.getNumberClass(gameTemplate[y][x]), "cell-btn", "disabled");
            if(gameTemplate[y][x]>0) {
              templateCell.innerHTML = "" + gameTemplate[y][x];
            }
        }
        templateRow.appendChild(templateCell);
      }
      templateUI.appendChild(templateRow);
    }
    return templateUI;
  }

  getNumberClass(number) {
    const numberClass = [
      "zero", "one", "two", "three", "four",
      "five", "six", "seven", "eight"
    ];
    return numberClass[number];
  }
}