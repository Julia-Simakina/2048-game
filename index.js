const BOARD_SIZE = 4;
const COMMON_NEW_VALUE = 2;
const RARE_NEW_VALUE = 4;
const GAMEOVER_TEXT = '=('

const AvailableKeysEnum = {
  ArrowLeft: true,
  ArrowRight: true,
  ArrowUp: true,
  ArrowDown: true,
};

const gameField = document.querySelector(".game-container__field");
const score = document.getElementsByClassName(
  "game-container__scores-counter"
)[0];
let gameMatrix = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(0));

let counter = 0;
score.textContent = counter;

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
  gameMatrix[newCeil.row][newCeil.col] = Math.random() > 0.9 ? 4 : 2;
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

  if (isGameOver(gameMatrix)) {
    setTimeout(() => alert("Game over!"), 1000);
  }
};

const getGameMAtrixClone = () => {
  return JSON.parse(JSON.stringify(gameMatrix));
};

const increaseScore = (value) => {
  counter += value;
  score.textContent = counter;
};

function mergeRow(row) {
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
}

function isGameOver(matrix) {
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
}

function moveCell() {
  addNumInRandomCell();
  rerender();
}

const shakeDat = (originalArr, shouldReverse = false) => {
  let arr = [...originalArr];
  arr = shouldReverse ? slideRow(arr).reverse() : slideRow(arr);
  arr = mergeRow(arr);
  arr = shouldReverse ? slideRow(arr).reverse() : slideRow(arr);

  return arr;
};

function moveLeft(matrixClone) {
  for (let row = 0; row < matrixClone.length; row++) {
    matrixClone[row] = shakeDat(matrixClone[row]);
  }
}

function moveRight(matrixClone) {
  for (let row = 0; row < matrixClone.length; row++) {
    matrixClone[row] = shakeDat(matrixClone[row], true);
  }
}

function moveUp(matrixClone) {
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
}

function moveDown(matrixClone) {
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
}

const move = (event) => {
  if (!AvailableKeysEnum[event.code]) {
    return;
  }

  let matrixClone = getGameMAtrixClone();

  switch (event.code) {
    case AvailableKeysEnum.ArrowLeft:
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
};

const startGame = () => {

  initializeGameBoard();
  addNumInRandomCell();
  moveCell();
};

startGame();

document.addEventListener("keydown", move);
