// === Canvas & UI ===
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const sizeSlider = document.getElementById("sizeSlider");
const angleSlider = document.getElementById("angleSlider");
const colorPicker = document.getElementById("colorPicker");
const difficultySel = document.getElementById("difficulty");
const previewBtn = document.getElementById("previewBtn");
const applyBtn = document.getElementById("applyBtn");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const scoreSpan = document.getElementById("score");
const timerSpan = document.getElementById("timer");
const statusEl = document.getElementById("status");

// === Game State ===
let pacman = { x: 1, y: 1, size: 20, angle: 40, color: "#ffff00" };
let maze = [];
let smallBalls = [];
let goalBall = { x: 0, y: 0 };
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let mode = "stopped";
let level = 1;

const cellSize = 30;

// === Maze Levels ===
const levels = [
  [ // LEVEL 1
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,0,1,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,1,1,0,0,0,0,1,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
// --- Level 2 ---
[ // LEVEL 2
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,1,0,0,1,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1],
  [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,2,1], // 👈 Golden ball here, reachable
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
],






  [ // LEVEL 3
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
];

// === Functions ===
function resetGame() {
  maze = levels[level - 1].map(r => [...r]);
  pacman.x = 1;
  pacman.y = 1;
  score = 0;
  scoreSpan.textContent = score;
  smallBalls = [];
  timeLeft = 60;
  timerSpan.textContent = timeLeft;
  statusEl.textContent = "";

  // Generate small balls
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 0 && !(x === 1 && y === 1)) {
        smallBalls.push({ x, y, collected: false });
      }
    }
  }

  // Logical goal positions per level
  const goalPositions = [
    { x: 18, y: 8 },
    { x: 17, y: 7 },
    { x: 18, y: 7 },
  ];
  goalBall = goalPositions[level - 1];
  drawGame();
}

function drawMaze() {
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#0033cc";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawBalls() {
  ctx.fillStyle = "white";
  smallBalls.forEach(b => {
    if (!b.collected) {
      ctx.beginPath();
      ctx.arc(b.x * cellSize + 15, b.y * cellSize + 15, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawGoal() {
  ctx.beginPath();
  ctx.arc(goalBall.x * cellSize + 15, goalBall.y * cellSize + 15, 10, 0, Math.PI * 2);
  ctx.fillStyle = "gold";
  ctx.fill();
}

function drawPacman() {
  const px = pacman.x * cellSize + 15;
  const py = pacman.y * cellSize + 15;
  const mouthRad = (pacman.angle * Math.PI) / 180;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(px, py, pacman.size, mouthRad, 2 * Math.PI - mouthRad);
  ctx.closePath();
  ctx.fillStyle = pacman.color;
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(px + pacman.size / 3, py - pacman.size / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawBalls();
  drawGoal();
  drawPacman();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerSpan.textContent = timeLeft;
    if (timeLeft <= 0) endGame(false);
  }, 1000);
}

// === Movement: step-by-step per key press ===
document.addEventListener("keydown", e => {
  if (mode !== "playing") return;

  let nx = pacman.x;
  let ny = pacman.y;

  if (e.key === "ArrowUp") ny--;
  if (e.key === "ArrowDown") ny++;
  if (e.key === "ArrowLeft") nx--;
  if (e.key === "ArrowRight") nx++;

  // Check valid move
  if (maze[ny] && maze[ny][nx] === 0) {
    pacman.x = nx;
    pacman.y = ny;
  }

  // Collect small balls
  smallBalls.forEach(b => {
    if (!b.collected && b.x === pacman.x && b.y === pacman.y) {
      b.collected = true;
      score++;
      scoreSpan.textContent = score;
    }
  });

  // Check all small balls collected
  const allCollected = smallBalls.every(b => b.collected);

  // Check golden ball condition
  if (pacman.x === goalBall.x && pacman.y === goalBall.y) {
    if (allCollected) {
      endGame(true);
    } else {
      statusEl.textContent = "⚠️ Collect all small balls first!";
    }
  }

  drawGame();
});

function endGame(win) {
  clearInterval(timerInterval);
  mode = "stopped";
  statusEl.textContent = win
    ? `🏆 You won Level ${level}!`
    : "⏰ Time’s up!";
}

// === Controls ===
startBtn.onclick = () => {
  resetGame();
  mode = "playing";
  startTimer();
};

resetBtn.onclick = () => {
  resetGame();
  drawGame();
};

previewBtn.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pacman.size = parseInt(sizeSlider.value);
  pacman.angle = parseInt(angleSlider.value);
  pacman.color = colorPicker.value;
  drawPacman();
  ctx.fillStyle = "white";
  ctx.font = "16px Poppins";
  ctx.fillText("Preview Mode", 250, 20);
};

applyBtn.onclick = () => {
  pacman.size = parseInt(sizeSlider.value);
  pacman.angle = parseInt(angleSlider.value);
  pacman.color = colorPicker.value;
};

difficultySel.onchange = e => {
  level = parseInt(e.target.value);
  resetGame();
  drawGame();
};

// === Init ===
resetGame();
drawGame();
