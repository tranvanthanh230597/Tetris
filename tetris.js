//tạo  canvas không gian game
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const img = new Image();
img.src = "tanjiro.png";
const audioMove =  new Audio();
audioMove.src = "audio/move.mp4";
const audioRotate = new Audio();
audioRotate.src = "audio/Rotate.mp4";
const audioDrop = new Audio();
audioDrop.src = "audio/drop.mp4";

context.scale(20, 20);
//xử lý đầy hàng
function arenaSweep() {
    let rowCount = 1;
    outer: for(let y = arena.length -1; y > 0; --y){
       for(let x = 0; x < arena[y].length; ++x){
        if (arena[y][x] === 0) {
            continue outer;
        }
       }

       const row = arena.splice(y, 1)[0].fill(0);
       arena.unshift(row); 
       ++y;
       player.score += rowCount *10;
       rowCount *= 2;
       audioDrop.play();
    }
}

//kiểm tra thử coi khối player đã ở cuối cùng của màn arena chưa
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for(let y = 0; y < m.length; ++y){
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && 
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0 ) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === "T") {
        return[
                [0, 0, 0 ],
                [1, 1, 1 ],
                [0, 1, 0 ],
            ];
    } 
    else if (type === "O") {
         return[
                [2, 2],
                [2, 2],
            ];
    }
    else if (type === "L") {
         return[
                [0, 3, 0 ],
                [0, 3, 0 ],
                [0, 3, 3 ],
            ];
    }
    else if (type === "J") {
         return[
                [0, 4, 0 ],
                [0, 4, 0 ],
                [4, 4, 0 ],
            ];
    }
    else if (type === "I") {
         return[
                [0, 5, 0, 0 ],
                [0, 5, 0, 0 ],
                [0, 5, 0, 0 ],
                [0, 5, 0, 0 ],
            ];
    }
    else if (type === "S") {
         return[
                [0, 6, 6 ],
                [6, 6, 0 ],
                [0, 0, 0 ],
            ];
    }
    else if (type === "Z") {
         return[
                [7, 7, 0 ],
                [0, 7, 7 ],
                [0, 0, 0 ],
            ];
    }
}

function draw() {
    context.drawImage(img, 0,0,12,20);
    drawMatrix(arena,{ x: 0 , y: 0}); //vẽ được khối player khi nó được cố định ở màn arena 
    drawMatrix(player.matrix, player.pos );
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) =>{
    row.forEach((value, x) => {
        if (value !== 0) {
            context.fillStyle = colors[value];
            context.fillRect(x + offset.x,
                             y + offset.y,
                              1, 1);
            } 
        });
    });
}

//dùng để vẽ khối player lên arena
function merge(arena, player) {
    player.matrix.forEach((row, y) =>{
        row.forEach((value, x) =>{
          if (value !== 0) {
            arena[y + player.pos.y][x + player.pos.x] = value;
          }
        });
    });  
}
//xử ký khối player rớt xuống
function playerDrop() {
    player.pos.y ++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena,player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}
//di chuyển qua về ko bị chạy ra khỏi màn arena
function playerMove(dir) {  
    player.pos.x += dir;
    if (collide(arena,player)) {
        player.pos.x -= dir;
    }
}
//reset khối player
function playerReset() {
    const pieces = 'IJLOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - 
                    (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }               
}
//hàm quay khối player
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix,dir);
    while(collide(arena,player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix,-dir);
            player.pos.x = pos;
            return;
        }
    }
}

//hàm xử lý quay
function rotate(matrix, dir) {
    for(let y = 0; y < matrix.length; y++){
        for( let x = 0 ; x < y; x++ ){
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0 ) {
        matrix.forEach(row => row.reserse());
    }
    else{
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById("score").innerHTML = player.score;
}

const colors = [
    null,
    "red",
    "pink",
    "blue",
    "violet",
    "purple",
    "green",
    "orange",
]

const arena = createMatrix(12, 20);
console.table(arena);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
}

//xử lý bàn phím
document.addEventListener("keydown", event =>{
   if (event.keyCode === 37 ) {
    audioMove.play();
    playerMove(-1);
   }
   else if (event.keyCode === 39) {
    audioMove.play();
    playerMove(1);
   } 
   else if (event.keyCode === 40) {
    audioMove.play();
    playerDrop();
   }
   else if (event.keyCode === 81) {
    audioRotate.play();
    playerRotate(-1);
   }
   else if (event.keyCode === 87) {
    audioRotate.play();
    playerRotate(1);
   }

});

playerReset();
updateScore();
update();
