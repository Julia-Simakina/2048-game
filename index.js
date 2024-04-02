const AvailableKeysEnum = {
  ArrowLeft: true,
  ArrowRight: true,
  ArrowUp: true,
  ArrowDown: true,
};

const StorageItemsEnum = {
  score: "score",
  matrix: "matrix",
  boardSize: "board-size",
  bestScore: "best-score",
};

const COMMON_NEW_VALUE = 2;
const RARE_NEW_VALUE = 4;
const PROBABILITY_COMMON_NEW_VALUE = 0.9;
const GAME_BOARD_SIDE_LENGTH = 470;
const CEIL_GAP = 15;
const INITIAL_BOARD_SIZE = 4;

const createEmptyMatrix = (size) => {
  return Array.from({ length: size }, () => new Array(size).fill(0));
};

const isValidNumber = (num) => {
  return typeof num === "number" && num !== NaN;
};

const getInitialValues = () => {
  const defaultValues = {
    scoreCounter: 0,
    gameMatrix: createEmptyMatrix(INITIAL_BOARD_SIZE),
    boardSize: INITIAL_BOARD_SIZE,
    bestScoreCounter: 0,
  };

  const storedValues = {
    scoreCounter:
      Number(localStorage.getItem(StorageItemsEnum.score)) ||
      defaultValues.scoreCounter,
    gameMatrix: localStorage.getItem(StorageItemsEnum.matrix)
      ? JSON.parse(localStorage.getItem(StorageItemsEnum.matrix))
      : defaultValues.gameMatrix,
    boardSize:
      Number(localStorage.getItem(StorageItemsEnum.boardSize)) ||
      defaultValues.boardSize,
    bestScoreCounter:
      Number(localStorage.getItem(StorageItemsEnum.bestScore)) ||
      defaultValues.bestScoreCounter,
  };

  const { scoreCounter, gameMatrix, boardSize, bestScoreCounter } =
    storedValues;

  const isScoreCounterValid = isValidNumber(scoreCounter);
  const isBoardSizeValid = boardSize > 3 || boardSize < 8;
  const isBestScoreCounterValid = isValidNumber(bestScoreCounter);
  const isGameMatrixValid =
    Array.isArray(gameMatrix) && gameMatrix.length === boardSize;

  const isStoredValuesValid =
    isScoreCounterValid &&
    isGameMatrixValid &&
    isBoardSizeValid &&
    isBestScoreCounterValid;

  if (!isStoredValuesValid) {
    return defaultValues;
  }

  return storedValues;
};

let { scoreCounter, gameMatrix, boardSize, bestScoreCounter } =
  getInitialValues();

const gameContainer = document.getElementById("game-container");
const newGameBtn = document.getElementById("new-game-btn");
const gameOverTitle = document.getElementById("game-over-title");
const gameField = document.getElementById("game-field");
const scoreElement = document.getElementById(StorageItemsEnum.score);
const bestScoreElement = document.getElementById(StorageItemsEnum.bestScore);

const ceilSideLength = `${
  (GAME_BOARD_SIDE_LENGTH - (boardSize - 1) * CEIL_GAP) / boardSize
}px`;
const ceilSideTemplate = `repeat(${boardSize}, 1fr)`;

gameField.style.gridTemplateColumns = ceilSideTemplate;
gameField.style.gridTemplateRows = ceilSideTemplate;

scoreElement.textContent = scoreCounter;
bestScoreElement.textContent = bestScoreCounter;

const askBoardSize = () => {
  let boardSize;
  do {
    boardSize = +prompt("Введите ширину игрового поля от 3 до 8", "4");
  } while (boardSize < 3 || boardSize > 8);

  localStorage.setItem(StorageItemsEnum.boardSize, boardSize);
  return boardSize;
};

//Ячейки grid
const initializeGameBoard = () => {
  for (let row = 0; row < gameMatrix.length; row++) {
    for (let col = 0; col < gameMatrix[row].length; col++) {
      const ceil = document.createElement("div");
      ceil.classList.add("game-container__ceil");
      ceil.setAttribute("id", `ceil_${[row]}_${[col]}`);
      gameField.append(ceil);
    }
  }
};

const getRandomCeilCoords = (matrix) => {
  const newArr = [];
  matrix.forEach((row, indexRow) => {
    row.forEach((col, indexCol) => {
      if (matrix[indexRow][indexCol] > 0) {
        return;
      }

      newArr.push({ row: indexRow, col: indexCol });
    });
  });

  const randomItem = newArr[Math.floor(Math.random() * newArr.length)];

  return randomItem;
};

const addNumInRandomCeil = () => {
  const newCeil = getRandomCeilCoords(gameMatrix);
  gameMatrix[newCeil.row][newCeil.col] =
    Math.random() > PROBABILITY_COMMON_NEW_VALUE
      ? RARE_NEW_VALUE
      : COMMON_NEW_VALUE;
};

const getCeilClassNames = (num) => {
  if (num > 1024) {
    return "game-container__ceil_title game-container__ceil_title_big-num";
  }
  return `game-container__ceil_title game-container__ceil_title_${num}`;
};

// Перерисовка поля при кажом изменении
const rerender = () => {
  for (let row = 0; row < gameMatrix.length; row++) {
    for (let col = 0; col < gameMatrix[row].length; col++) {
      const ceil = document.getElementById(`ceil_${row}_${col}`);
      const value = gameMatrix[row][col];
      const classes = getCeilClassNames(value);
      ceil.className = classes;
      ceil.textContent = value || "";
      ceil.style.width = ceilSideLength;
      ceil.style.height = ceilSideLength;
      ceil.style.lineHeight = ceil.style.height;
      if (boardSize > 4) {
        ceil.style.fontSize = "35px";
      }
      if (boardSize > 6) {
        ceil.style.fontSize = "22px";
      }
    }
  }
};

const slideRow = (row) => {
  const arr = row.filter((num) => num);
  const missing = row.length - arr.length;
  const zeros = Array(missing).fill(0);

  return arr.concat(zeros);
};

const isGameValuesChanged = (originalMatrix, updatedMatrix) => {
  return JSON.stringify(originalMatrix) !== JSON.stringify(updatedMatrix);
};

const showGameOverLayout = () => {
  gameOverTitle.style.display = "block";
  gameContainer.classList.add("after");
};

const finishTurn = (originalMatrix, updatedMatrix) => {
  if (!isGameValuesChanged(originalMatrix, updatedMatrix)) {
    return;
  }

  gameMatrix = updatedMatrix;
  addNumAndRerender();

  if (!isGameOver(gameMatrix)) {
    return;
  }

  showGameOverLayout();
};

const getGameMatrixClone = () => {
  return JSON.parse(JSON.stringify(gameMatrix));
};

const increaseScore = (value) => {
  scoreCounter += value;
  scoreElement.textContent = scoreCounter;
  localStorage.setItem(StorageItemsEnum.score, scoreCounter);

  if (scoreCounter > bestScoreCounter) {
    bestScoreCounter = scoreCounter;
    bestScoreElement.textContent = bestScoreCounter;
    localStorage.setItem(StorageItemsEnum.bestScore, bestScoreCounter);
  }
};

const mergeRow = (row) => {
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i - 1]) {
      row[i - 1] *= 2;
      increaseScore(row[i - 1]);
      row[i] = 0;
    } else if (row[i] === row[i + 1]) {
      row[i] *= 2;

      increaseScore(row[i]);
      row[i + 1] = 0;
    }
  }

  return row;
};

const isGameOver = (matrix) => {
  // Проверить возможность объединения двух соседних клеток по горизонтали и вертикали
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const current = matrix[row][col];
      if (!current) {
        return false;
      }

      if (col < matrix[row].length - 1 && current === matrix[row][col + 1]) {
        return false;
      }

      if (row < matrix.length - 1 && current === matrix[row + 1][col]) {
        return false;
      }
    }
  }

  return true;
};

const addNumAndRerender = () => {
  addNumInRandomCeil();
  rerender();
};

const getMergedArr = (originalArr, shouldReverse = false) => {
  let arr = [...originalArr];
  arr = shouldReverse ? slideRow(arr).reverse() : slideRow(arr);
  arr = mergeRow(arr);
  arr = shouldReverse ? slideRow(arr).reverse() : slideRow(arr);

  return arr;
};

const moveLeft = (matrixClone) => {
  for (let row = 0; row < matrixClone.length; row++) {
    matrixClone[row] = getMergedArr(matrixClone[row]);
  }
};

const moveRight = (matrixClone) => {
  for (let row = 0; row < matrixClone.length; row++) {
    matrixClone[row] = getMergedArr(matrixClone[row], true);
  }
};

const moveUp = (matrixClone) => {
  for (let col = 0; col < matrixClone[0].length; col++) {
    let column = [];
    for (let row = 0; row < matrixClone.length; row++) {
      column.push(matrixClone[row][col]);
    }
    column = getMergedArr(column);
    for (let row = 0; row < matrixClone.length; row++) {
      matrixClone[row][col] = column[row];
    }
  }
};

const moveDown = (matrixClone) => {
  for (let col = 0; col < matrixClone[0].length; col++) {
    let column = [];
    for (let row = 0; row < matrixClone.length; row++) {
      column.push(matrixClone[row][col]);
    }

    column = getMergedArr(column, true);

    for (let row = 0; row < matrixClone.length; row++) {
      matrixClone[row][col] = column[row];
    }
  }
};

const handleKeydown = (event) => {
  if (!AvailableKeysEnum[event.code]) {
    return;
  }

  let matrixClone = getGameMatrixClone();

  switch (event.code) {
    case "ArrowLeft":
      moveLeft(matrixClone);
      break;
    case "ArrowRight":
      moveRight(matrixClone);
      break;
    case "ArrowUp":
      moveUp(matrixClone);
      break;
    case "ArrowDown":
      moveDown(matrixClone);
      break;
  }

  finishTurn(gameMatrix, matrixClone);
  localStorage.setItem(StorageItemsEnum.mat, JSON.stringify(gameMatrix));
};

const startGame = () => {
  initializeGameBoard();

  const isStoredMatrixEmpty = !gameMatrix.flat().filter((e) => e).length;

  if (isStoredMatrixEmpty) {
    addNumInRandomCeil();
    addNumAndRerender();
  } else {
    rerender();
  }
};

const handleNewGameClick = () => {
  if (!isGameOver(gameMatrix)) {
    let isRestart = confirm(
      "Вы уверены, что хотите начать новую игру? Весь прогресс будет потерян."
    );
    if (!isRestart) {
      return false;
    }
  }

  localStorage.removeItem(StorageItemsEnum.score);
  localStorage.removeItem(StorageItemsEnum.boardSize);
  localStorage.removeItem(StorageItemsEnum.matrix);
  location.reload();

  const newBoardSize = askBoardSize();
  boardSize = newBoardSize;
  gameMatrix = createEmptyMatrix(boardSize);
  localStorage.setItem(StorageItemsEnum.matrix, JSON.stringify(gameMatrix));
};

if (isGameOver(gameMatrix)) {
  showGameOverLayout();
}

startGame();

document.addEventListener("keydown", handleKeydown);
newGameBtn.onclick = handleNewGameClick;
