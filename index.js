const AvailableKeysEnum = {
  ArrowLeft: true,
  ArrowRight: true,
  ArrowUp: true,
  ArrowDown: true,
};

const checkBoardSize = () => {
  let boardSize;
  do {
    boardSize = +prompt("Введите ширину игрового поля от 3 до 8", "4");
  } while (boardSize < 3 || boardSize > 8);

  localStorage.setItem("board-size", boardSize);
  return boardSize;
};

const COMMON_NEW_VALUE = 2;
const RARE_NEW_VALUE = 4;
const GAMEOVER_TEXT = "Конец игры!";
const GAME_BOARD_SIDE_LENGTH = 470;
const CEIL_GAP = 15;
const INITIAL_BOARD_SIZE = 4;

const gameContainer = document.getElementById("game-container");
const newGameBtn = document.getElementById("new-game-btn");
const gameOverTitle = document.getElementById("game-over-title");

const storedBoardSize = localStorage.getItem("board-size");
const storedMatrix = localStorage.getItem("matrix");
const storedGameOver = localStorage.getItem("game-over");

let boardSize = storedBoardSize ? +storedBoardSize : INITIAL_BOARD_SIZE;
const ceilSideLength = `${
  (GAME_BOARD_SIDE_LENGTH - (boardSize - 1) * CEIL_GAP) / boardSize
}px`;

const gameField = document.getElementById("game-field");
gameField.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`; //размер ячейки
gameField.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");

const initialValues = () => {
  const storedValues = {
    scoreCounter: Number(localStorage.getItem("score")), // 0
    gameMatrix: JSON.parse(localStorage.getItem("matrix")), // 1 exist, []
    boardSize: localStorage.getItem("board-size"), // 3-8
    bestScoreCounter: Number(localStorage.getItem("best-score")),
  };

  const isScoreCounterValid = typeof storedValues.scoreCounter === "number";
  const isGameMatrixValid =
    storedValues.gameMatrix && Array.isArray(storedValues.gameMatrix);
  const isBoardSizeValid =
    storedValues.boardSize > 3 || storedValues.boardSize < 8;
  const isBestScoreCounterValid =
    typeof storedValues.bestScoreCounter === "number";

  const isStoredValuesValid =
    isScoreCounterValid &&
    isGameMatrixValid &&
    isBoardSizeValid &&
    isBestScoreCounterValid;
  console.log("isStoredValuesValid", isStoredValuesValid);

  if (!storedValues.gameMatrix?.length) {
    return {
      scoreCounter: 0,
      gameMatrix: Array.from({ length: boardSize }, () =>
        new Array(boardSize).fill(0)
      ),
      boardSize: 0,
      bestScoreCounter: 0,
    };
  }

  return storedValues;

  if (!storedValues) {
    return {
      scoreCounter: 0,
      gameMatrix: Array.from({ length: boardSize }, () =>
        new Array(boardSize).fill(0)
      ),
      boardSize: 0,
      bestScoreCounter: 0,
    };
  } else {
    return storedValues;
  }
};

console.log(">>>>>>>>>>>>", initialValues());

// Достать матрицу из localStorage или создать её
let gameMatrix;

if (storedMatrix) {
  gameMatrix = JSON.parse(storedMatrix);
} else {
  gameMatrix = Array.from({ length: boardSize }, () =>
    new Array(boardSize).fill(0)
  );
}

//Достать счёт из localStorage или создать его
let scoreCounter = +localStorage.getItem("score");
if (!scoreCounter) {
  localStorage.setItem("score", 0);
}
scoreElement.textContent = localStorage.getItem("score");

let bestScoreCounter = localStorage.getItem("best-score");
if (!bestScoreCounter) {
  localStorage.setItem("best-score", 0);
}
bestScoreElement.textContent = localStorage.getItem("best-score");

//Ячейки grid
const initializeGameBoard = () => {
  for (let row = 0; row < gameMatrix.length; row++) {
    for (let col = 0; col < gameMatrix[row].length; col++) {
      const ceil = document.createElement("div");
      ceil.classList.add("game-container__cell");
      ceil.setAttribute("id", `ceil_${[row]}_${[col]}`);
      gameField.append(ceil);
    }
  }
};

const getRandomCellCoords = (matrix) => {
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

const addNumInRandomCell = () => {
  const newCeil = getRandomCellCoords(gameMatrix);
  gameMatrix[newCeil.row][newCeil.col] =
    Math.random() > 0.9 ? RARE_NEW_VALUE : COMMON_NEW_VALUE;
};

const getCellClassNames = (num) => {
  return `game-container__cell_title game-container__cell_title_${num}`;
};

// Перерисовка поля при кажом изменении
const rerender = () => {
  for (let row = 0; row < gameMatrix.length; row++) {
    for (let col = 0; col < gameMatrix[row].length; col++) {
      const ceil = document.getElementById(`ceil_${row}_${col}`);
      const value = gameMatrix[row][col];
      const classes = getCellClassNames(value);
      ceil.className = classes;
      ceil.textContent = value || "";
      ceil.style.width = ceilSideLength;
      ceil.style.height = ceilSideLength;
      ceil.style.lineHeight = ceil.style.height;
      if (boardSize > 4) {
        ceil.style.fontSize = "35px";
      }
      if (boardSize > 6) {
        ceil.style.fontSize = "25px";
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

const setGameOver = () => {
  gameOverTitle.textContent = GAMEOVER_TEXT;
  gameContainer.classList.add("after");
};

const finishTurn = (originalMatrix, updatedMatrix) => {
  if (!isGameValuesChanged(originalMatrix, updatedMatrix)) {
    return;
  }

  gameMatrix = updatedMatrix;
  moveCell();

  if (isGameOver(gameMatrix)) {
    setGameOver();
  }
};

const getGameMAtrixClone = () => {
  return JSON.parse(JSON.stringify(gameMatrix));
};

const increaseScore = (value) => {
  scoreCounter += value;
  scoreElement.textContent = scoreCounter;
  localStorage.setItem("score", scoreCounter);

  if (scoreCounter > bestScoreCounter) {
    bestScoreCounter = scoreCounter;
    bestScoreElement.textContent = bestScoreCounter;
    localStorage.setItem("best-score", bestScoreCounter);
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
  localStorage.setItem("game-over", "true");
  return true;
};

const moveCell = () => {
  addNumInRandomCell();
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

  let matrixClone = getGameMAtrixClone();

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
  localStorage.setItem("matrix", JSON.stringify(gameMatrix));
};

const startGame = () => {
  initializeGameBoard();
  if (!storedMatrix) {
    addNumInRandomCell();
    moveCell();
  } else {
    rerender();
  }
};

const startBoard = () => {
  initializeGameBoard();

  rerender();
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

  localStorage.removeItem("score");
  localStorage.removeItem("board-size");
  localStorage.removeItem("matrix");
  localStorage.removeItem("game-over");
  location.reload();

  checkBoardSize();
};

if (storedGameOver) {
  setGameOver();
}

!storedBoardSize ? startBoard() : startGame();

document.addEventListener("keydown", handleKeydown);
newGameBtn.onclick = handleNewGameClick;
