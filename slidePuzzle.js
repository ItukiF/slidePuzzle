const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const pieceSize = 100;
const column = 3;
const raw = 3;

canvas.width = pieceSize * raw;
canvas.height = pieceSize * column;

canvas.setAttribute(
  "style",
  "display:block;margin:auto;background-color: #776644;border: 10px solid;border-color: #887755"
);

document.body.appendChild(canvas);

class piece {
  constructor(n, x, y) {
    this.number = n;
    this.pieceX = x;
    this.pieceY = y;
    this.width = pieceSize;
    this.height = pieceSize;
  }

  update = function () {
    if (this.number) {
      ctx.fillStyle = "#ddcc99";
      ctx.fillRect(this.pieceX, this.pieceY, this.width, this.height);
      ctx.fillStyle = "#000000";
      ctx.font = "40pt Arial";
      if (this.number < 10) {
        ctx.fillText(this.number, this.pieceX + 36, this.pieceY + 66);
      } else {
        ctx.fillText(this.number, this.pieceX + 22, this.pieceY + 66);
      }
    }
    ctx.strokeRect(this.pieceX, this.pieceY, this.width, this.height);
    ctx.strokeStyle = "4px #776644";
    ctx.fill();
  };
}

const board = {
  pieceExist: [],
  puzzleGoal: [],

  //空白の方向へピースが移動可能化を確認
  checkMove: function (moveX, moveY) {
    for (let y = 0; y < column; y++) {
      for (let x = 0; x < raw; x++) {
        if (this.pieceExist[y][x].number === 0) {
          if (
            x + moveX >= 0 &&
            y + moveY >= 0 &&
            x + moveX < column &&
            y + moveY < raw
          )
            return true;
        }
      }
    }
    return false;
  },

  //空白のマスへピースを移動
  swapPiece: function (moveX, moveY) {
    for (let y = 0; y < column; y++) {
      for (let x = 0; x < raw; x++) {
        if (this.pieceExist[y][x].number === 0) {
          this.pieceExist[y][x].number =
            this.pieceExist[y + moveY][x + moveX].number;
          this.pieceExist[y + moveY][x + moveX].number = 0;

          return;
        }
      }
    }
  },
};

const shuffle = () => {
  let puzzleStart = board.puzzleGoal;
  let pieceChange = 0;
  let pathSpace = 0;

  canvas.ariaDisabled = true;

  for (;;) {
    let swap1 = Math.floor(Math.random() * (raw * column));
    let swap2 =
      (swap1 + Math.floor(Math.random() * (raw * column - 1) + 1)) %
      (raw * column);
    let temp;

    temp = puzzleStart[swap1];
    puzzleStart[swap1] = puzzleStart[swap2];
    puzzleStart[swap2] = temp;

    //偶奇法にて8パズルの解が存在するかを計算
    pieceChange++;
    for (let i = 0; i < raw * column; i++) {
      if (puzzleStart[i] === 0) {
        pathSpace = Math.floor(i / raw) + (i % raw);
      }
    }

    //解が存在するならシャッフルを終了
    if (pieceChange > raw * column * 3) {
      if (pieceChange % 2 === pathSpace % 2) break;
    }
  }

  for (let y = 0; y < column; y++) {
    for (let x = 0; x < raw; x++) {
      board.pieceExist[y][x].number = puzzleStart[y * raw + x];
    }
  }

  canvas.ariaDisabled = false;
};

const init = () => {
  let shuffleButton;
  //ボードの初期化
  for (let y = 0; y < column; y++) {
    board.pieceExist[y] = [];
    for (let x = 0; x < raw; x++) {
      board.pieceExist[y][x] = new piece(
        (y * raw + x + 1) % (raw * column),
        x * pieceSize,
        y * pieceSize
      );
      board.puzzleGoal[y * raw + x] = board.pieceExist[y][x].number;
    }
  }

  console.log(board.pieceExist);

  shuffleButton = document.createElement("button");
  shuffleButton.textContent = "シャッフル";
  document.body.appendChild(shuffleButton);
  shuffleButton.addEventListener("click", shuffle);
};
const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < column; y++) {
    for (let x = 0; x < raw; x++) {
      board.pieceExist[y][x].update();
    }
  }

  window.requestAnimationFrame(loop);
};

init();
loop();

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      if (board.checkMove(1, 0)) board.swapPiece(1, 0);
      break;
    case "ArrowRight":
      if (board.checkMove(-1, 0)) board.swapPiece(-1, 0);
      break;
    case "ArrowUp":
      if (board.checkMove(0, 1)) board.swapPiece(0, 1);
      break;
    case "ArrowDown":
      if (board.checkMove(0, -1)) board.swapPiece(0, -1);
      break;
  }
});

canvas.addEventListener("click", (e) => {
  //クリックした座標
  let clientRect = canvas.getBoundingClientRect();
  let clickPieceX = e.pageX - clientRect.left - window.pageXOffset - 10;
  let clickPieceY = e.pageY - clientRect.top - window.pageYOffset - 10;

  //空白位置に対するクリックしたピースの相対位置
  let moveX;
  let moveY;

  //moveX, moveYの計算
  clickPieceX = Math.floor(clickPieceX / pieceSize);
  clickPieceY = Math.floor(clickPieceY / pieceSize);
  for (let y = 0; y < column; y++) {
    for (let x = 0; x < raw; x++) {
      if (board.pieceExist[y][x].number === 0) {
        moveX = clickPieceX - x;
        moveY = clickPieceY - y;
      }
    }
  }

  //クリック位置が空白位置の隣ならピースを移動
  if (Math.abs(moveX) + Math.abs(moveY) === 1) board.swapPiece(moveX, moveY);
});
