const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gridSize = 25;              // number of cells horizontally
let cellSize;                   // actual pixel size, computed from canvas width

const score = document.getElementById("score");
const highScore = document.getElementById("highScore");

let hs = localStorage.getItem("highScoreBrowser") || 0;
highScore.textContent = hs;

let snake, direction, apple = { x: 0, y: 0 };
let gameOn = false;

let startX, startY;

function resizeCanvas() {
  let size = Math.min(window.innerWidth, window.innerHeight) * 0.95;

  // Make canvas size a multiple of gridSize to align cells
  size = Math.floor(size / gridSize) * gridSize;

  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  canvas.width = size;
  canvas.height = size;

  cellSize = Math.floor(canvas.width / gridSize);

  startX = Math.floor(gridSize / 2) * cellSize;
  startY = Math.floor(gridSize / 2) * cellSize;


  snake = [
    { x: startX, y: startY },
    { x: startX - cellSize, y: startY },
    { x: startX - 2 * cellSize, y: startY }
  ];

  direction = "right";
  gameOn = false;
  score.textContent = 0;

  showStartMessage();
}


resizeCanvas();
window.addEventListener("resize", resizeCanvas);

ctx.fillStyle = "#444";         
ctx.fillRect(0, 0, canvas.width, canvas.height);

// -----------------------------------------------------------------------------------------------------------

function gameBreak() {
    clearCanvas();
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";      // center horizontally
    ctx.textBaseline = "top";      // align to top vertically

    if (isTouchDevice()) {
      ctx.fillText("Game Over! Tap anywhere to start", canvas.width / 2, 20);
    } else {
      ctx.fillText("Game Over! Press Space to start", canvas.width / 2, 20);
    }

    gameOn = false;
    snake = [
        { x: startX, y: startY },
        { x: startX - cellSize, y: startY },
        { x: startX - 2 * cellSize, y: startY }
    ];
    tail = { x: startX - 3 * cellSize, y: startY };
    direction = "right";
    drawSnake();

    
}

// --------------------------------------------------------------------------------------------------------

document.addEventListener('keydown', event => {
    if (event.code === 'Space' && !gameOn) {
        gameOn = true;
        score.textContent = 0;
        updateApple();
        playLoop();
    }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp" && direction !== "down") {
    direction = "up";
  } else if (event.key === "ArrowDown" && direction !== "up") {
    direction = "down";
  } else if (event.key === "ArrowLeft" && direction !== "right") {
    direction = "left";
  } else if (event.key === "ArrowRight" && direction !== "left") {
    direction = "right";
  }
});

// --------------------------------------------------------------------------------------------------------

function playLoop() {
  clearCanvas();
  updateSnake();

  if(snake[0].x == apple.x && snake[0].y == apple.y) {
    score.textContent = parseInt(score.textContent) + 1;
    if (parseInt(score.textContent) > hs) {
      hs = parseInt(score.textContent); 
      localStorage.setItem("highScoreBrowser", hs);
      highScore.textContent = hs;
    }
    growSnake();
    updateApple();
    drawApple();
  } else {
    drawApple();
  }

  if (
    snake[0].x < 0 ||
    snake[0].y < 0 ||
    snake[0].x >= canvas.width ||
    snake[0].y >= canvas.height
  ) {
    gameBreak();
    return;
  }


  for(let i = 1; i < snake.length; i++) {
    if(snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
      gameBreak();
      return;
    }
  }

  drawSnake();
  setTimeout(playLoop, 150);
}


function clearCanvas() {
  ctx.fillStyle = "#444";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function drawSnake() {
  ctx.fillStyle = "#0f0";
  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, cellSize, cellSize);
  });
}

function drawApple() {
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(apple.x, apple.y, cellSize, cellSize);
}


function updateSnake() {
  
  for (let i = snake.length - 1; i > 0; i--) {
    snake[i] = { ...snake[i - 1] };
  }

  
  switch (direction) {
    case "right":
      snake[0].x += cellSize;
      break;
    case "left":
      snake[0].x -= cellSize;
      break;
    case "up":
      snake[0].y -= cellSize;
      break;
    case "down":
      snake[0].y += cellSize;
      break;
  }
}

function updateApple() {
  const cols = Math.floor(canvas.width / cellSize);
  const rows = Math.floor(canvas.height / cellSize);

  let x, y, collision;

  do {
    x = Math.floor(Math.random() * cols) * cellSize;
    y = Math.floor(Math.random() * rows) * cellSize;

    // Check if apple is on the snake
    collision = snake.some(segment => segment.x === x && segment.y === y);

  } while (collision);

  apple.x = x, apple.y = y;
}

function growSnake() {
  let n = snake.length;

  snake.push({ ...snake[n-1]});
}


// --------------------------------------------------------------------------------------------------

// Start game on tap anywhere on screen (not just canvas)
window.addEventListener("click", () => {
  if (!gameOn) {
    gameOn = true;
    score.textContent = 0;
    updateApple();
    playLoop();
  }
});

// Swipe detection on full screen
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

window.addEventListener("touchend", e => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && direction !== "left") direction = "right";
    else if (dx < -30 && direction !== "right") direction = "left";
  } else {
    if (dy > 30 && direction !== "up") direction = "down";
    else if (dy < -30 && direction !== "down") direction = "up";
  }
});

// Disable scrolling & pull-to-refresh for touch swipes
window.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

// ---------------------------------------------------------------------------------------------

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function showStartMessage() {
  clearCanvas();
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  if (isTouchDevice()) {
    ctx.fillText("Tap anywhere to start the game!", canvas.width / 2, 20);
  } else {
    ctx.fillText("Press Space to start the game!", canvas.width / 2, 20);
  }
}

// -----------------------------------------------------------------------------------------