var board_xoffset    = 1;
var board_yoffset    = 1;
var sq_width         = 20;
var sq_height        = 20;
var line_width       = 1;
var alt_line_width   = 2;
var alt_stroke_color = "#000088";
var starting_color   = false;
var overwrite_color  = false;
var mouse_down       = false;
var mouse_button     = false;
var erase            = false;
var last_cell_color  = false;
var undo_stack       = [];
var this_move        = [];
var starting_id      = false;
var second_id        = false;
var last_id          = false;

function CreateBoard(dimensions) {
  var board = [];
  for ( i=0; i<dimensions.width; i++ ) {
    var row = [];
    for ( j=0; j<dimensions.height; j++ ) {
      row.push(0);
    }
    board.push(row);
  } 
  return board;
}

function DrawSquare(row,col, state) {
  var xpixel = (row*sq_height) + board_yoffset + (alt_line_width * (Math.floor(row/5)));
  var ypixel = (col*sq_width)  + board_xoffset + (alt_line_width * (Math.floor(col/5)));
  ctx.fillStyle = "#FFFFFF"; 
  if (state == 1) {
    ctx.fillStyle = "#FF0000"; 
  }
  ctx.strokeStyle = "#0000FF";
  ctx.fillRect(xpixel,ypixel,sq_width,sq_height);
  ctx.strokeRect(xpixel,ypixel,sq_width,sq_height);
}

function GetCol(x){
  return Math.floor((x-board_xoffset+line_width) / (sq_width + (alt_line_width / 5)));
}

function GetRow(y){
  return Math.floor((y-board_yoffset+line_width) / (sq_width + (alt_line_width / 5)));
}

function GetColRow(x,y){
  var col = GetCol(x);
  var row = GetRow(y);
  return col,row;
}

function DrawBoard(board){
  for (row=0; row<board.length; row++){
    for (col=0; col<board[0].length; col++){ 
      DrawSquare(row,col,board[row][col]);
    }
  }
  DrawAltLines(board);
}

function DrawAltLines(board) {

}

function alertXY(x,y){
  alert("x:" + x + " y:" + y + " col:" + GetCol(x) + " row:" + GetRow(y));
}

function handleClick(event) {
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
  
  var col = GetCol(x);
  var row = GetRow(y);
  DrawSquare(col, row, 1);
} 

function CalcCanvasSize(board) {
  var pixel_width  = (board.width*sq_height)  + (2 * board_xoffset)
                     + (alt_line_width * (Math.floor(board.width/5 )));
  var pixel_height = (board.height*sq_width)  + (2 * board_yoffset)
                     + (alt_line_width * (Math.floor(board.height/5)));
  if (board.width % 5 == 0) 
    pixel_width -= alt_line_width;
  if (board.height % 5 == 0) 
    pixel_height -= alt_line_height;
  
  return { width: pixel_width,
           height: pixel_height }; 
}

function GlobalMouseUp() {
  mouse_down = false;
  mouse_button = undefined;
  erase = false;
  starting_id = '';
  second_id = '';
  starting_id_state = '';
  last_id = '';
  overwrite_color = false;
  if (this_move.length != 0)
    undo_stack.push(this_move);
  this_move = [];
  return false;
}

function ToggleMouse(tog, button) {
  mouse_button = button;
  if (mouse_down && tog == "up") {
    GlobalMouseUp();
  }
  else if (!mouse_down && tog == "down") {
    mouse_down = true;
  }
}

function LoadCanvas(id, size) {
  var canvas = document.createElement('canvas');
  div = document.getElementById(id); 
  canvas.id     = "myCanvas";
  canvas.width  = size.width;
  canvas.height = size.height;
  canvas.style.zIndex   = 8;
  canvas.style.position = "absolute";
  div.appendChild(canvas)
}
var board_dimensions = { width :25,
                         height:14 };
var board = CreateBoard(board_dimensions);
var foo = CalcCanvasSize(board_dimensions);
LoadCanvas('board', CalcCanvasSize(board_dimensions));
board[3][2] = 1;
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.lineWidth = line_width;
DrawBoard(board);
canvas.addEventListener("mousedown", handleClick, false);
document.onmouseup = GlobalMouseUp;
document.oncontextmenu = GlobalMouseUp;
