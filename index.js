const gameField = document.querySelector(".game-container__field");

const gameMatrix = Array.from({ length: 4 }, () => new Array(4).fill(0));

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

const foo = (matrix) => {
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
  const newCeil = foo(gameMatrix);

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
      }
    }
  }
};

function moveLeft(event) {
  if (event.code !== "ArrowLeft"){
    return
  } 
  if (event.code == "ArrowLeft") {
    for (let row = 0; row < gameMatrix.length; row++) {
      gameMatrix[row] = slideRow(gameMatrix[row]);
      gameMatrix[row] = mergeRow(gameMatrix[row]);
      // gameMatrix[row] = slideRow(gameMatrix[row]);
    }

    function slideRow(row) {
      const arr = row.filter((num) => num !== 0);
      const missing = row.length - arr.length;
      const zeros = Array(missing).fill(0);
      return arr.concat(zeros);
    }

    function mergeRow(row) {
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
          row[i] *= 2;
          row[i + 1] = 0;
        }
      }
      return row;
    }
  } 
  addNumInRandomCell();
  rerender();
}

document.addEventListener("keydown", moveLeft);

const startGame = () => {
  initializeGameBoard();
  addNumInRandomCell();
  addNumInRandomCell();
  rerender();
};

startGame();
