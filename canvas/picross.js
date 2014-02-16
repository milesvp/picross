var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var board_xoffset = 4;
var board_yoffset = 4;
var sq_width = 20;
var sq_height = 20;
ctx.lineWidth = 1;
var line_width = 1;
var alt_line_width = 2;
var alt_stroke_color = "#000088";

function CreateBoard(width, height) {
  var board = [];
  for ( y=0; y<height; y++ ) {
    var row = [];
    for ( x=0; x<width; x++ ) {
      row.push(0);
    }
    board.push(row);
  } 
  return board;
}
function DrawSquare(x,y, state) {
  var xpixel = (x*sq_width)  + board_xoffset + (alt_line_width * (Math.floor(x/5)));
  var ypixel = (y*sq_height) + board_yoffset + (alt_line_width * (Math.floor(y/5)));
  ctx.fillStyle = "#FFFFFF"; 
  if (state == 1) {
    ctx.fillStyle = "#FF0000"; 
  }
  ctx.strokeStyle = "#0000FF";
  ctx.fillRect(xpixel,ypixel,sq_width,sq_height);
  ctx.strokeRect(xpixel,ypixel,sq_width,sq_height);
}

function DrawBoard(board){
  for (x=0; x<board[0].length; x++){
    for (y=0; y<board.length; y++){ 
      DrawSquare(x,y,board[x][y]);
    }
  }
  DrawAltLines(board);
}

function DrawAltLines(board) {

}

var board = CreateBoard(12,14);
board[3][2] = 1;
DrawBoard(board)
