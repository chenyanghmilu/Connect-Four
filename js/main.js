/*----- constants -----*/
const COLORS = {
    '1': 'purple',
    '-1': 'lime',
    '0': 'white'
};

/*----- app's state (variables) -----*/
let board, winner, turn;

/*----- cached element references -----*/
// we save a reference to this element, because we use it to change the game message every render
const msgEl = document.getElementById('msg');

/*----- event listeners -----*/
// we listen for any click on the markers row and use event delegation to understand which marker was clicked
document.getElementById('markers').addEventListener('click', handleMarkerClick);

/*----- functions -----*/

init();

function handleMarkerClick(evt) {
    // get which marker was clicked
    const marker = evt.target;

    // we get the col number from the marker id - replace 'col' with '' and parse into an int
    const colIdx = parseInt(marker.id.replace('col', ''));

    // if it wasn't a marker that was clicked (just the marker row), or if game is already won, return early
    if (isNaN(colIdx) || winner) return;

    // get the index of the next available 0 in the marker's column, this is the row index
    const rowIdx = board[colIdx].indexOf(0);

    // if not more 0's in the column, player can't play here
    if (rowIdx === -1) return;

    // set the appropriate cell in the board to the player that played there
    board[colIdx][rowIdx] = turn;

    // check if there is a winner/tie
    winner = getWinner();

    // change which player's turn it is
    turn *= -1;

    // render the board/game again after all state has been updated
    render();
}

function getWinner() {
    let winner = null;
    let foundZero = false;
    // loop through the columns in the board, use for loop so we can break early if winner is found
    for (let colIdx = 0; colIdx < board.length; colIdx++) {
        // loop through the rows in each column, use for loop so we can break early if winner is found
        for (let rowIdx = 0; rowIdx < board[colIdx].length; rowIdx++) {
            // check up the column from the cell, check right from the cell, check diagonal right/up and diagonal right/down
            // if winner is found for any of these calls, it will be returned and set to winner
            // chaining the || means that if null (falsey) is returned from checkUp, it'll call checkRight, etc, until a truthy value (1 or -1) is found
            winner =
                checkUp(colIdx, rowIdx) ||
                checkRight(colIdx, rowIdx) ||
                checkDiag(colIdx, rowIdx, 1) ||
                checkDiag(colIdx, rowIdx, -1);
            if (winner) break;

            // if zero has been found, it'll stay true. If not, and the current cell is 0, foundZero flag will be flipped to true an stay true
            foundZero = foundZero || board[colIdx][rowIdx] === 0;
        }

        if (winner) break;
    }

    // if no winner was found, and no 0 was left on board, the game is a tie
    if (!winner && !foundZero) {
        winner = 'T';
    }
    return winner;
}

function checkUp(colIdx, rowIdx) {
    // if the row index is great than 2, a winner can't be found, so return early
    // 6 rows in board, so can only check up for winner from cells in the bottom 3 rows
    if (rowIdx > 2) return null;
    const colArr = board[colIdx]; // get the array we are checking, and check cells +1, +2 and +3 rows above

    // if the 4 cells add to absolute value 4, than the player in those cells is a winner, if not, we return null
    return Math.abs(colArr[rowIdx] + colArr[rowIdx + 1] + colArr[rowIdx + 2] + colArr[rowIdx + 3]) === 4 ? colArr[rowIdx] : null;
}

function checkRight(colIdx, rowIdx) {
    // if the colIdx is greater than 3, a winner can't be found, so return null early
    // 7 columns, so can only check right for a winner from cells in the left 4 columns
    if (colIdx > 3) return null;

    // this time increase the index on the column and keep the row index the same when checking the 4 cells
    // if 4 cells next to each other in the same row equal winner is found, if not, return null
    return Math.abs(board[colIdx][rowIdx] + board[colIdx + 1][rowIdx] + board[colIdx + 2][rowIdx] + board[colIdx + 3][rowIdx]) === 4 ? board[colIdx][rowIdx] : null;
}

// vertical offset is -1 for down, and 1 for up
function checkDiag(colIdx, rowIdx, vertOffset) {
    // since diagonal check is to the right, can only start the check from cells in the left 4 columns
    // if diagonal offset is positive (checking up) we can only check starting from cells in the bottom 3 rows
    // if diagonal offset is negative (checking down) we can only check starting from the cells in the top 3 rows
    if (colIdx > 3 || (vertOffset > 0 && rowIdx > 2) || (vertOffset < 0 && rowIdx < 3)) return null;

    // when checking the four cells, we use the verticalOffset (1 or -1) to either increment or decrement the row index (+1, +2, +3 or -1, -2, -3)
    // when vertOffset === -1, row index will decrement each cell, so we are checking down rows
    // when vertOffset === 1, row index will increment each cell, so we are checking up rows
    // column index will always increment because we are checking to the right
    return Math.abs(
            board[colIdx][rowIdx] +
            board[colIdx + 1][rowIdx + vertOffset] +
            board[colIdx + 2][rowIdx + vertOffset * 2] +
            board[colIdx + 3][rowIdx + vertOffset * 3]
        ) === 4 ?
        board[colIdx][rowIdx] :
        null;
}

// call render after every turn once state has all been updated
function render() {
    // iterate through the board columns
    board.forEach((colArray, colIdx) => {
        // get the column marker
        const marker = document.getElementById(`col${colIdx}`);
        // if column no longer has any 0s, it is full, so "hide" the column marker by changing the border-top to white
        // could also just set the visibility to "hidden", but we can't set display to "none" b/c it needs to take up the space
        marker.style.borderTopColor = colArray.includes(0) ? 'lightgrey' : 'white';

        // iterate through each row in the column
        colArray.forEach((cell, rowIdx) => {
            // get the div that corresponds to this column and row
            let el = document.getElementById(`c${colIdx}r${rowIdx}`);
            // set the backgroundColor using the COLORS constant and which player is in the cell
            el.style.backgroundColor = COLORS[cell];
        });
    });

    // change the message based on if there is a winner or which player's turn it is
    if (winner) {
        if (winner === 'T') {
            msgEl.textContent = "It's a Tie!";
        } else {
            msgEl.innerHTML = `<span style="color:${COLORS[winner]}">${COLORS[
        winner
    ].toUpperCase()}</span> Wins!`;
        }
    } else {
        msgEl.innerHTML = `<span style="color:${COLORS[turn]}">${COLORS[
    turn
    ].toUpperCase()}</span>'s Turn`;
    }
}

function init() {
    // board is array of 7 columns, each column has 6 rows
    board = [
        [0, 0, 0, 0, 0, 0], // col0
        [0, 0, 0, 0, 0, 0], // col1
        [0, 0, 0, 0, 0, 0], // col2
        [0, 0, 0, 0, 0, 0], // col3
        [0, 0, 0, 0, 0, 0], // col4
        [0, 0, 0, 0, 0, 0], // col5
        [0, 0, 0, 0, 0, 0] // col6
    ];
    winner = null;
    turn = 1;

    render();
    console.log('new game started...');
}

/********************
Win Logic Examples
*********************
checkUp winner:
  0  0  0  0  0  0  0
  0  0  0  0  0  0  0
  1  0  0  0  0  0  0
  1  0  0  0  0  0  0
  1  0  0  0  0 -1  0
  1  0  0  0 -1 -1  0
cells c0r0, c0r1, c0r2, & c0r3 add to 4 (absolute value) --> 1 is the winner
checkRight winner:
  0  0  0  0  0  0  0
  0  0  0  0  0  0  0
  0  0  0  0  0  0  0
  1  0  0  0  0  0  0
  1  1  0  0  0 -1  0
  1  1  0 -1 -1 -1 -1
cells c3r0, c4r0, c5r0, & c6r0 add to 4 (absolute value) --> -1 is the winner
Note: absolute value of -4 is 4
checkDiag (vertOffset 1) winner:
  0  0  0  0  0  0  0
  0  0  0  0  0  0  0
  0  0  0  1  0  0  0
  0  0  1 -1  0  0  0
  0  1 -1 -1  0  0  0
  1  1 -1  1 -1  0  0
cells c0r0, c1r1, c2r2, & c3r3 add to 4 (absolute value) --> 1 is the winner
checkDiag (vertOffset -1) winner:
  0  0  0  0  0  0  0
  0  0  0  0  0  0  0
  0 -1  0  1  0  0  0
  0 -1 -1  1  0  0  0
  0  1  1 -1  0 -1  0
  1  1 -1  1 -1 -1  1
cells c1r3, c2r2, c3r1, & c4r0 add to 4 (absolute value) --> -1 is the winner
Note: absolute value of -4 is 4
*/