const AvailableKeysEnum = {
  ArrowLeft: true,
  ArrowRight: true,
  ArrowUp: true,
  ArrowDown: true,
};

const checkBoardSize = () => {
  let boardSizePrompt;
  do {
    boardSizePrompt = +prompt("Введите ширину игрового поля от 3 до 8", "4");
  } while (boardSizePrompt < 3 || boardSizePrompt > 8);

  return boardSizePrompt;
};

const BOARD_SIZE = checkBoardSize();

const COMMON_NEW_VALUE = 2;
const RARE_NEW_VALUE = 4;
const GAMEOVER_TEXT = "Конец игры!";

const gameContainer = document.getElementById("game-container");
const newGameBtn = document.querySelector(".game-container__reset-btn");
const gameOverTitle = document.getElementById("game-over-title");

const gameField = document.querySelector(".game-container__field");
gameField.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`; //размер ячейки
gameField.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");

// Достать матрицу из localStorage или создать её
let gameMatrix;
if (localStorage.getItem("matrix")) {
  gameMatrix = JSON.parse(localStorage.getItem("matrix"));
} else {
  gameMatrix = Array.from({ length: BOARD_SIZE }, () =>
    new Array(BOARD_SIZE).fill(0)
  );
}

// Достать счёт из localStorage или создать его
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
      let ceil = document.getElementById(`ceil_${row}_${col}`);
      let value = gameMatrix[row][col];
      let classes = getCellClassNames(value);
      ceil.className = classes;
      ceil.textContent = value || "";
      ceil.style.width = `${(470 - (BOARD_SIZE - 1) * 15) / BOARD_SIZE}px`;
      ceil.style.height = `${(470 - (BOARD_SIZE - 1) * 15) / BOARD_SIZE}px`;
      ceil.style.lineHeight = ceil.style.height;
      if (BOARD_SIZE > 4) {
        ceil.style.fontSize = "35px";
      }
      if (BOARD_SIZE > 6) {
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

const finishTurn = (originalMatrix, updatedMatrix) => {
  if (!isGameValuesChanged(originalMatrix, updatedMatrix)) {
    return;
  }

  gameMatrix = updatedMatrix;
  moveCell();

  // let content = getComputedStyle(gameContainer, '::after').display;

  if (isGameOver(gameMatrix)) {
    setTimeout(
      () => {
        gameOverTitle.textContent = GAMEOVER_TEXT;
        gameContainer.classList.add("after");
      },

      1000
    );
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

  return true;
};

const moveCell = () => {
  addNumInRandomCell();
  rerender();
};

const shakeDat = (originalArr, shouldReverse = false) => {
  let arr = [...originalArr];
  arr = shouldReverse ? slideRow(arr).reverse() : slideRow(arr);
  arr = mergeRow(arr);
  arr = shouldReverse ? slideRow(arr).reverse() : slideRow(arr);

  return arr;
};

const moveLeft = (matrixClone) => {
  for (let row = 0; row < matrixClone.length; row++) {
    matrixClone[row] = shakeDat(matrixClone[row]);
  }
};

const moveRight = (matrixClone) => {
  for (let row = 0; row < matrixClone.length; row++) {
    matrixClone[row] = shakeDat(matrixClone[row], true);
  }
};

const moveUp = (matrixClone) => {
  for (let col = 0; col < matrixClone[0].length; col++) {
    let column = [];
    for (let row = 0; row < matrixClone.length; row++) {
      column.push(matrixClone[row][col]);
    }
    column = shakeDat(column);
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

    column = shakeDat(column, true);

    for (let row = 0; row < matrixClone.length; row++) {
      matrixClone[row][col] = column[row];
    }
  }
};

const move = (event) => {
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
  if (!localStorage.getItem("matrix")) {
    addNumInRandomCell();
    moveCell();
  } else {
    rerender();
  }
};

startGame();

const isNewGame = () => {
  let isReload = confirm(
    "Вы уверены, что хотите начать новую игру? Весь прогресс будет потерян."
  );
  if (!isReload) {
    return false;
  } else {
    localStorage.removeItem("score");
    localStorage.removeItem("matrix");
    location.reload();
  }
};

document.addEventListener("keydown", move);
newGameBtn.onclick = isNewGame;
