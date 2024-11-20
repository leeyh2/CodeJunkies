/* 
 * Tetris
 * 
 * Base game created by straker on GitHub
 *  https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1
 * 
 * Implemented by Richard Cashion and Dylan Cowell
 * 
 * Fall 2023, ETSU
 * 
 */

// https://tetris.fandom.com/wiki/Tetris_Guideline

// get a random integer between the range of [min,max]
// see https://stackoverflow.com/a/1527820/2124254

let score = 0; //Overall score variable
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// generate a new tetromino sequence
// see https://tetris.fandom.com/wiki/Random_Generator
function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (sequence.length) {
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

// get the next tetromino in the sequence
function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }

    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];

    // I and O start centered, all others start in left-middle
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

    // I starts on row 21 (-1), all others start on row 22 (-2)
    const row = name === 'I' ? -1 : -2;

    return {
        name: name,      // name of the piece (L, O, etc.)
        matrix: matrix,  // the current rotation matrix
        row: row,        // current row (starts offscreen)
        col: col         // current col
    };
}

// rotate an NxN matrix 90deg
// see https://codereview.stackexchange.com/a/186834
function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );

    return result;
}

// check to see if the new matrix/row/col is valid
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                // outside the game bounds
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                // collides with another piece
                playfield[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }

    return true;
}

// place the tetromino on the playfield
function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {

                // game over if piece has any part offscreen
                if (tetromino.row + row < 0) {
                    return showGameOver();
                }

                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }

    lineCount = 0; //Counts the number of lines cleared for the current tetronimo

    // check for line clears starting from the bottom and working our way up
    for (let row = playfield.length - 1; row >= 0;) {
        if (playfield[row].every(cell => !!cell)) {

            lineCount++; //Increase the number of cleared lines by one
            // drop every row above this one
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r - 1][c];
                }
            }
        }
        else {
            row--;
        }
    }

    //Increases the score based on the number of lines cleared
    switch (lineCount) {
        case 1:
            score = score + 40;
            break;
        case 2:
            score = score + 100;
            break;
        case 3:
            score = score + 300;
            break;
        case 4:
            score = score + 1200;
            break;
    }

    // Show score to website, updated after the above code runs
    const playerScore = document.getElementById("playerScore");

    playerScore.textContent = `Current Score: ${score}`;

    tetromino = getNextTetromino();
}

// show the game over screen
function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;

    // Draw more translucent dark background overlay
    context.fillStyle = 'rgba(0, 0, 0, 0.35)'; // Adjusted opacity to 0.5 for more translucency
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Create a multi-color gradient for "TETRIS" text
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');      // Start with red
    gradient.addColorStop(0.2, 'orange'); // Add orange at 20% of the width
    gradient.addColorStop(0.4, 'yellow'); // Add yellow at 40% of the width
    gradient.addColorStop(0.6, 'green');  // Add green at 60% of the width
    gradient.addColorStop(0.8, 'blue');   // Add blue at 80% of the width
    gradient.addColorStop(1, 'purple');   // End with purple

    // Add glow effect for "TETRIS"
    context.shadowColor = 'black';  // Glow color
    context.shadowBlur = 20;

    // Display "TETRIS" message with the multi-color gradient
    context.fillStyle = gradient; // Apply gradient color to TETRIS text
    context.font = 'bold 90px "Blox 2", sans-serif'; // Increase the font size for TETRIS
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('TETRIS', canvas.width / 2, canvas.height / 2 - 120); // Adjust vertical position

    // Reset shadow for other text
    context.shadowBlur = 0;

    // Add glow effect for "GAME OVER"
    context.shadowColor = 'cyan';
    context.shadowBlur = 20;

    // Display "GAME OVER" message with large, eye-catching font
    context.fillStyle = 'white';
    context.font = 'bold 58px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2); // Adjust vertical position

    // Reset shadow for other text
    context.shadowBlur = 0;

    // Add glow effect for the score text
    context.shadowColor = 'cyan';  // Glow color for score
    context.shadowBlur = 10;      // Less blur for score compared to other texts

    // Display the final score with a glowing effect
    context.fillStyle = 'white';
    context.font = '30px monospace'; // Increase the font size for score
    context.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40); // Adjust vertical position

    // Reset shadow for other text
    context.shadowBlur = 0;
}

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoSequence = [];

// keep track of what is in every cell of the game using a 2d array
// tetris playfield is 10x20, with a few rows offscreen
const playfield = [];

// populate the empty state
for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

// how to draw each tetromino
// see https://tetris.fandom.com/wiki/SRS
const tetrominos = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'O': [
        [1, 1],
        [1, 1],
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ]
};


// color of each tetromino
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;  // keep track of the animation frame so we can cancel it
let gameOver = false;

// game loop
function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw the playfield
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];

                // drawing 1 px smaller than the grid creates a grid effect
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    // draw the active tetromino
    if (tetromino) {

        // tetromino falls every 35 frames
        if (++count > 35) {
            tetromino.row++;
            count = 0;

            // place piece if it runs into anything
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        context.fillStyle = colors[tetromino.name];

        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {

                    // drawing 1 px smaller than the grid creates a grid effect
                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
}

// Function to trigger a glow effect around the tetromino
// shows that the spacebar has been triggered
function glowEffect() {
    context.shadowBlur = 20; // Adjust for glow intensity
    context.shadowColor = colors[tetromino.name]; // Use tetromino color for glow
    drawTetromino(); // Draw with glow effect

    // Remove glow after a short delay
    setTimeout(() => {
        context.shadowBlur = 0; // Reset glow
        context.shadowColor = 'transparent';
        drawTetromino(); // Redraw without glow
    }, 100); // Short glow duration
}

// Draw tetromino function to handle rendering
function drawTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                context.fillStyle = colors[tetromino.name];
                context.fillRect(
                    (tetromino.col + col) * grid,
                    (tetromino.row + row) * grid,
                    grid - 1, grid - 1
                );
            }
        }
    }
}

// listen to keyboard events to move the active tetromino
document.addEventListener('keydown', function (e) {
    if (gameOver) return;

    // left and right arrow keys (move)
    if (e.which === 37 || e.which === 39) {
        const col = e.which === 37
            ? tetromino.col - 1
            : tetromino.col + 1;

        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    }

    // up arrow key (rotate)
    if (e.which === 38) {
        e.preventDefault(); // prevents the "default" action from happening, in this case, scrolling down.
        const matrix = rotate(tetromino.matrix);
        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
            tetromino.matrix = matrix;
        }
    }

    // spacebar(instant drop)
    if (e.which == 32) {
        e.preventDefault(); // prevents the "default" action from happening, in this case, scrolling down.
        let row = tetromino.row;
        while (isValidMove(tetromino.matrix, row + 1, tetromino.col)) {
            row++;
        }
        tetromino.row = row;
        placeTetromino();
        glowEffect(); // Trigger a quick glow effect to indicate the instant drop
    }

    // down arrow key (drop)
    if (e.which === 40) {
        e.preventDefault(); // prevents the "default" action from happening, in this case, scrolling down.
        const row = tetromino.row + 1;
        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
            tetromino.row = row - 1;

            placeTetromino();
            return;
        }

        tetromino.row = row;
    }
});

// will display an instruction for the player in order to trigger the loop of the game
function showStartScreen() {
    context.font = '36px Arial';
    context.textAlign = 'center';
    context.fillText('Press Enter to Start', canvas.width / 2, canvas.height / 1.2);

    const gameOverImage = new Image();
    gameOverImage.src = '/images/tetris.png'; // Replace with your image path
    gameOverImage.onload = () => {
        context.drawImage(
            gameOverImage,
            canvas.width / 2 - gameOverImage.width / 4,
            canvas.height / 5 - 30,
            gameOverImage.width / 2,
            gameOverImage.height / 2
        );
    };
}

// on keyboard press of space, start the game.
document.body.onkeyup = function (e) {
    if (e.keyCode == 13) {
        rAF = requestAnimationFrame(loop);
    }
}

showStartScreen();
