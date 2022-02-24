// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoresArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

function displayBestScores() {
  bestScores.forEach((bestScore, i) => {
    bestScore.textContent = `${bestScoresArray[i].bestScore}s`;
  });
}

// check localstorage for best score
function getBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoresArray = JSON.parse(localStorage.getItem("bestScores"));
  } else {
    bestScoresArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay }
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoresArray));
  }
  displayBestScores();
}

// update best scores array
function updateBestScoresArray() {
  bestScoresArray.forEach((score, i) => {
    // select the correct best score to update
    if (questionAmount == score.questions) {
      const savedBestScore = Number(bestScoresArray[i].bestScore);
      // checking if update is better than already existing best score
      if (savedBestScore === 0 || savedBestScore < finalTime) {
        bestScoresArray[i].bestScore = finalTimeDisplay;
      }
    }
  });
  displayBestScores();
  localStorage.setItem("bestScores", JSON.stringify(bestScoresArray));
}

function showScorePage() {
  setTimeout(() => (playAgainBtn.hidden = false), 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
}

// Reset game
function playAgain() {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

// format and display score page
function displayScores() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;

  updateBestScoresArray();

  // scroll to top & go to score page
  itemContainer.scrollTo({ top: 0, behavior: "instant" });
  showScorePage();
}

// stop timer ,process results & go to score page
function checkTime() {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);
    // check for wrong guesses and add penalty time
    equationsArray.forEach((equation, i) => {
      if (equation.evaluated !== playerGuessArray[i]) {
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    displayScores();
  }
}

// add time every 10s to timeplayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// start timer when game page is clicked
function startTimer() {
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

// scroll & store user selection
function select(guessedTrue) {
  // Scroll 80px up
  valueY += 80;
  itemContainer.scroll({ top: valueY, left: 0, behavior: "smooth" });
  // Add player guess to array
  return guessedTrue ? playerGuessArray.push("true") : playerGuessArray.push("false");
}

function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// Get random number for incorrect/correct questions
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);

  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;

  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

function passEquationsToDOM() {
  equationsArray.forEach((equation) => {
    const item = document.createElement("div");
    item.classList.add("item");
    // Equation text
    const equationText = document.createElement("h1");
    equationText.textContent = equation.value;
    // appending...
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  passEquationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

function startCountdown() {
  let count = 3;
  countdown.textContent = count;
  const timeCountdown = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = "GO!";
    } else if (count === -1) {
      showGamePage;
      clearInterval(timeCountdown);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
}

// Navigate from splash page to countdown page
function showCountdown() {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  populateGamePage();
  startCountdown();
}

// Get value form selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) radioValue = radioInput.value;
  });
  return radioValue;
}

function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  if (questionAmount) showCountdown();
}

startForm.addEventListener("click", () => {
  radioContainers.forEach((radioEl) => {
    // Remove selected label styling
    radioEl.classList.remove("selected-label");
    // Add back styling if radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add("selected-label");
    }
  });
});

// Event Listeners
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);

getBestScores();
