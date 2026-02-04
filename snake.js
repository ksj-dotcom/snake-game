const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playtimeDiv = document.getElementById('playtime');
const restartBtn = document.getElementById('restartBtn');
const rankingList = document.getElementById('rankingList');

const grid = 20;
let snake, apple, score, speed, gameInterval, isGameOver, playtime, playtimeTimer, isStarted;
let ranking = [];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function initGame() {
  snake = { x: 160, y: 160, dx: 0, dy: 0, cells: [], maxCells: 4 };
  apple = { x: getRandomInt(0, 20) * grid, y: getRandomInt(0, 20) * grid };
  score = 0;
  isGameOver = false;
  isStarted = false;
  playtime = 0;
  updatePlaytime();
  restartBtn.style.display = 'none';
  document.addEventListener('keydown', keydownHandler);
  if (gameInterval) clearInterval(gameInterval);
  if (playtimeTimer) clearInterval(playtimeTimer);
  gameInterval = setInterval(gameLoop, getSpeedMs());
  playtimeTimer = setInterval(() => {
    if (!isGameOver && isStarted) {
      playtime++;
      updatePlaytime();
    }
  }, 1000);
}

function getSpeedMs() {
  switch (speed) {
    case 1: return 200;
    case 2: return 150;
    case 3: return 100;
    case 4: return 70;
    case 5: return 40;
    default: return 100;
  }
}

function setSpeed(s) {
  speed = s;
  if (!isGameOver) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, getSpeedMs());
  }
}

function updatePlaytime() {
  playtimeDiv.textContent = `플레이타임: ${playtime}초`;
}

function drawRanking() {
  rankingList.innerHTML = '';
  ranking.slice(0, 5).forEach((item, idx) => {
    const li = document.createElement('li');
    li.textContent = `${item.score}점 (${item.time}초)`;
    rankingList.appendChild(li);
  });
}

function saveRanking() {
  ranking.push({ score, time: playtime });
  ranking.sort((a, b) => b.score - a.score || a.time - b.time);
  ranking = ranking.slice(0, 5);
  localStorage.setItem('snake_ranking', JSON.stringify(ranking));
  drawRanking();
}

function loadRanking() {
  const data = localStorage.getItem('snake_ranking');
  if (data) {
    ranking = JSON.parse(data);
    drawRanking();
  }
}

function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(playtimeTimer);
  document.removeEventListener('keydown', keydownHandler);
  restartBtn.style.display = 'inline-block';
  saveRanking();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '36px Arial';
  ctx.fillText('게임 오버', 110, 200);
}

function restartGame() {
  initGame();
}

function keydownHandler(e) {
  if (isGameOver) return;
  if (!isStarted) {
    // 첫 방향키 입력 시 시작
    if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(e.key)) {
      isStarted = true;
      if (e.key === 'ArrowLeft') {
        snake.dx = -grid; snake.dy = 0;
      } else if (e.key === 'ArrowUp') {
        snake.dy = -grid; snake.dx = 0;
      } else if (e.key === 'ArrowRight') {
        snake.dx = grid; snake.dy = 0;
      } else if (e.key === 'ArrowDown') {
        snake.dy = grid; snake.dx = 0;
      }
    }
    return;
  }
  if (e.key === 'ArrowLeft' && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  } else if (e.key === 'ArrowUp' && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  } else if (e.key === 'ArrowRight' && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  } else if (e.key === 'ArrowDown' && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isStarted) {
    // 시작 전에는 뱀, 사과, 안내만 그림
    ctx.fillStyle = 'green';
    ctx.fillRect(snake.x, snake.y, grid-2, grid-2);
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x, apple.y, grid-2, grid-2);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('방향키를 눌러 시작하세요!', 80, 200);
    ctx.font = '18px Arial';
    ctx.fillText('Score: ' + score, 10, 390);
    return;
  }

  snake.x += snake.dx;
  snake.y += snake.dy;

  // 벽에 부딪히면 게임 오버
  if (
    snake.x < 0 || snake.x >= canvas.width ||
    snake.y < 0 || snake.y >= canvas.height
  ) {
    gameOver();
    return;
  }

  snake.cells.unshift({ x: snake.x, y: snake.y });
  if (snake.cells.length > snake.maxCells) snake.cells.pop();

  ctx.fillStyle = 'red';
  ctx.fillRect(apple.x, apple.y, grid-2, grid-2);

  ctx.fillStyle = 'green';
  snake.cells.forEach((cell, index) => {
    ctx.fillRect(cell.x, cell.y, grid-2, grid-2);
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score++;
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
    }
    // 자기 몸에 부딪히면 게임 오버
    for (let i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        gameOver();
        return;
      }
    }
  });

  ctx.fillStyle = 'black';
  ctx.font = '18px Arial';
  ctx.fillText('Score: ' + score, 10, 390);
}

// 최초 실행
speed = 3;
loadRanking();
initGame();

// 전역 함수로 노출
window.setSpeed = setSpeed;
window.restartGame = restartGame;
