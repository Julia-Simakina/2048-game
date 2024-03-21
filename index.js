const gameField = document.querySelector(".game-container__field");

let gameMatrix = Array.from({ length: 4 }, () => new Array(4).fill(0));

//Ячейки grid
function initializeGameBoard() {
  for (let row = 0; row < gameMatrix.length; row++) {
    for (let col = 0; col < gameMatrix[row].length; col++) {
      const maxCeilCoordX = gameMatrix[row].length;
      const maxCeilCoordY = gameMatrix[col].length;

      // console.log("x >>", maxCeilCoordX);
      // console.log("y >>", maxCeilCoordY);
      const ceil = document.createElement("div");
      ceil.classList.add("game-container__cell");
      // ceil.textContent = gameMatrix[row][col];
      ceil.setAttribute("id", `ceil_${[row]}_${[col]}`);
      gameField.append(ceil);
    }
  }
}

const getRandomItem = (matrix) => {
  const newArr = [];
  matrix.forEach((row, indexRow) => {
    row.forEach((col, indexCol) => {
      if (matrix[indexRow][indexCol] > 0) {
        return;
      } else {
        newArr.push({ row: indexRow, col: indexCol });
      }
    });
  });
  const randomItem = newArr[Math.floor(Math.random() * newArr.length)];
  return randomItem;
};

function addNumInRandomCell() {
  const newCeil = getRandomItem(gameMatrix);

  //  console.log(newCeil)
  if (newCeil === undefined) {
    return alert("Game over!");
  }
  gameMatrix[newCeil.row][newCeil.col] = 2;
}

console.log(gameMatrix);

// Перерисовка поля при кажом изменении
const rerender = () => {
  for (let row = 0; row < gameMatrix.length; row++) {
    for (let col = 0; col < gameMatrix[row].length; col++) {
      let ceil = document.getElementById(`ceil_${[row]}_${[col]}`);

      switch (gameMatrix[row][col]) {
        case 0:
          ceil.removeAttribute("class");
          ceil.classList.add("game-container__cell");
          ceil.textContent = "";
          break;
        case 2:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_2");
          ceil.textContent = "2";
          break;
        case 4:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_4");
          ceil.textContent = "4";
          break;
        case 8:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_8");
          ceil.textContent = "8";
          break;
        case 16:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_16");
          ceil.textContent = "16";
          break;
        case 32:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_32");
          ceil.textContent = "32";
          break;
        case 64:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_64");
          ceil.textContent = "64";
          break;
        case 128:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_128");
          ceil.textContent = "128";
          break;
        case 256:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_256");
          ceil.textContent = "256";
          break;
        case 512:
          ceil.classList.add("game-container__cell_title");
          ceil.classList.add("game-container__cell_title_512");
          ceil.textContent = "512";
          break;
      }
    }
  }
};

function moveLeft(event) {
  if (event.code !== "ArrowLeft") {
    return;
  }
  let matrixClone = [...gameMatrix];
  for (let row = 0; row < matrixClone.length; row++) {
    matrixClone[row] = slideRow(matrixClone[row]);
    matrixClone[row] = mergeRow(matrixClone[row]);
    matrixClone[row] = slideRow(matrixClone[row]);
  }

  if ( isEqualArray2(gameMatrix, matrixClone)) {
    return;
  } else {
    gameMatrix = matrixClone;
    addNumInRandomCell();
    rerender();
  }
}

function moveRight(event) {
  if (event.code !== "ArrowRight") {
    return;
  }
  let matrixClone = [...gameMatrix];
  // console.log(gameMatrixClone);

  for (let row = 0; row < matrixClone.length; row++) {
    matrixClone[row] = slideRow(matrixClone[row]).reverse();
    matrixClone[row] = mergeRow(matrixClone[row]);
    matrixClone[row] = slideRow(matrixClone[row]).reverse();
  }

 
 
  if ( isEqualArray2(gameMatrix, matrixClone)) {
    return;
  } else {
    gameMatrix = matrixClone;
    addNumInRandomCell();
    rerender();
  }
}

function moveUp(event) {
  if (event.code !== "ArrowUp") {
    return;
  }

  for (let col = 0; col < gameMatrix[0].length; col++) {
    let column = [];
    for (let row = 0; row < gameMatrix.length; row++) {
      column.push(gameMatrix[row][col]);
    }
    column = slideRow(column);
    column = mergeRow(column);
    column = slideRow(column);
    for (let row = 0; row < gameMatrix.length; row++) {
      gameMatrix[row][col] = column[row];
    }
  }

  addNumInRandomCell();
  rerender();
  return gameMatrix;
}

function moveDown(event) {
  if (event.code !== "ArrowDown") {
    return;
  }
  let matrixClone = [...gameMatrix];
  console.log(gameMatrix)

  for (let col = 0; col < matrixClone[0].length; col++) {
    let column = [];
    for (let row = 0; row < matrixClone.length; row++) {
      column.push(matrixClone[row][col]);
    }
    column = slideRow(column).reverse();
    column = mergeRow(column);
    column = slideRow(column).reverse();
    for (let row = 0; row < matrixClone.length; row++) {
      matrixClone[row][col] = column[row];
    }
  }
  // if ( isEqualArray2(gameMatrix, matrixClone)) {
  //   return;
  // } else {
    gameMatrix = matrixClone;
    addNumInRandomCell();
    rerender();
  //  }

  // return gameMatrix;
}

function slideRow(row) {
  const arr = row.filter((num) => num !== 0);
  const missing = row.length - arr.length;
  const zeros = Array(missing).fill(0);
  return arr.concat(zeros);
}

function mergeRow(row) {
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i - 1]) {
      row[i - 1] *= 2;
      row[i] = 0;
    } else if (row[i] === row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;
    }
  }
  return row;
}

//Сравнение двух массивов
function isEqualArray1(a1, a2) {
  return a1.length === a2.length && a1.every((v,i)=> v === a2[i]);
}
//Сравнение двух  массивов
function isEqualArray2(a1, a2) {
  return a1.length === a2.length && a1.every((v,i)=> isEqualArray1(v, a2[i]));
}



document.addEventListener("keydown", moveDown);
document.addEventListener("keydown", moveUp);
document.addEventListener("keydown", moveLeft);
document.addEventListener("keydown", moveRight);

const startGame = () => {
  initializeGameBoard();
  addNumInRandomCell();
  addNumInRandomCell();
  rerender();
};

startGame();
