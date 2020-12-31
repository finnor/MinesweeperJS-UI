import gameDifficulties from "./config/difficulties";

export default class HeaderUI
{
  constructor(newGame, initialDifficulty) {
    this.newGame = newGame;
    this.selectedDifficulty = gameDifficulties.find(current => current.name.toLowerCase()===(initialDifficulty ?? "").toLowerCase()) ?? 0;
    this.difficulties = gameDifficulties;
  }

  /**
   * Creates the ui for the header of the game that displays metrics
   * and allows the changing of difficulty or restarting the game
   */
  create() {
    const headerContainer = document.createElement("div");
    headerContainer.classList.add("header", "flex-container", "align-center");

    headerContainer.appendChild(this.createMetrics());

    headerContainer.appendChild(this.createNewGameButton());

    headerContainer.appendChild(this.createDifficultySelect());

    return headerContainer;
  }

  /**
   * Create the UI for displaying the mine count and game time
   */
  createMetrics() {
    const metrics = document.createElement("div");
    metrics.classList.add("flex-container", "align-center");

    // Mine count
    const mineIcon = document.createElement("div");
    mineIcon.classList.add("mine");
    mineIcon.innerHTML = "&nbsp;";
    metrics.appendChild(mineIcon);
    const mines = document.createElement("div");
    mines.id = "ms-js-mines";
    mines.classList.add("padding-right", "font-weight-bold");
    mines.innerHTML = ("" + this.difficulties[this.selectedDifficulty].mines).padStart(2, "0");
    metrics.appendChild(mines);

    // Timer
    const timeIcon = document.createElement("div");
    timeIcon.classList.add("timer");
    timeIcon.innerHTML = "&nbsp;";
    metrics.appendChild(timeIcon);
    const timer = document.createElement("div");
    timer.id = "ms-js-timer";
    timer.classList.add("padding-right", "font-weight-bold");
    timer.innerHTML = "000";
    metrics.appendChild(timer);

    return metrics;
  }

  /**
   * Creates the UI for the new game button that also
   * displays if a game is won or lost
   */
  createNewGameButton() {
    const newGame = document.createElement("div");
    newGame.id = "ms-js-new-game";
    newGame.classList.add("new-game", "padding-right");
    newGame.addEventListener("click", () => {
      const difficulty = this.difficulties[this.selectedDifficulty];
      this.newGame(difficulty.x, difficulty.y, difficulty.mines);
      newGame.classList.remove("win", "loss");
    });

    return newGame;
  }

  /**
   * Creates the UI for the game difficulty select
   */
  createDifficultySelect() {
    const difficultySelect = document.createElement("select");
    difficultySelect.id = "ms-js-difficulty";
    for(let i=0; i<this.difficulties.length; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.text = this.difficulties[i].name;
      if(i===this.selectedDifficulty) {
        option.setAttribute("selected", true);
      }
      difficultySelect.appendChild(option);
    }

    difficultySelect.addEventListener("change", () => {
      const selected = parseInt(difficultySelect.value);
      if(selected!==this.selectedDifficulty) {
        const difficulty = this.difficulties[selected];
        this.newGame(difficulty.x, difficulty.y, difficulty.mines);
        this.selectedDifficulty = selected;
      }
    });

    return difficultySelect;
  }
}