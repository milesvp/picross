var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var board_xoffset = 1;
var board_yoffset = 1;
var sq_width = 20;
var sq_height = 20;
ctx.lineWidth = 1;
var line_width = 1;
var alt_line_width = 2;
var alt_stroke_color = "#000088";

function CreateBoard(width, height) {
  var board = [];
  for ( i=0; i<height; i++ ) {
    var row = [];
    for ( j=0; j<width; j++ ) {
      row.push(0);
    }
    board.push(row);
  } 
  return board;
}
function DrawSquare(col,row, state) {
  var xpixel = (col*sq_width)  + board_xoffset + (alt_line_width * (Math.floor(col/5)));
  var ypixel = (row*sq_height) + board_yoffset + (alt_line_width * (Math.floor(row/5)));
  ctx.fillStyle = "#FFFFFF"; 
  if (state == 1) {
    ctx.fillStyle = "#FF0000"; 
  }
  ctx.strokeStyle = "#0000FF";
  ctx.fillRect(xpixel,ypixel,sq_width,sq_height);
  ctx.strokeRect(xpixel,ypixel,sq_width,sq_height);
}

function GetCol(x){
  return col = Math.floor((x-board_xoffset+line_width) / (sq_width + (alt_line_width / 5)));
}

function GetColRow(x,y){
  var col = GetCol(x);
  var row = GetRow(y);
  return col,row;
}

function DrawBoard(board){
  for (col=0; col<board[0].length; col++){
    for (row=0; row<board.length; row++){ 
      DrawSquare(col,row,board[row][col]);
    }
  }
  DrawAltLines(board);
}

function DrawAltLines(board) {

}


function getPosition(event)
{
  var x = 0;
  var y = 0;
  if (event.x != undefined && event.y != undefined)
  {
    x = event.x;
    y = event.y;
  }
  else // Firefox method to get the position
  {
    x = event.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft;
    y = event.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
  }

  var canvas = document.getElementById("myCanvas");

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  
  alert("x:" + x + " y:" + y + " col:" + GetCol(x));
} 

var board = CreateBoard(25,14);
board[3][2] = 1;
DrawBoard(board);
canvas.addEventListener("mousedown", getPosition, false);
