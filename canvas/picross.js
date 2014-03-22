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
var mouse_move_hash  = {};
var starting_id      = false;
var starting_square  = undefined;
var second_square    = undefined;
var to_state         = undefined;
var second_id        = false;
var last_id          = false;
var left_button      = 0;
var middle_button    = 1;
var right_button     = 2;
var empty_state      = 0;
var on_state         = 1;
var x_state          = 2;
var dirty            = false;

function CreateBoard(dimensions) {
  var board = [];
  for ( i=0; i<dimensions.width; i++ ) {
    var row = [];
    for ( j=0; j<dimensions.height; j++ ) {
      row.push(empty_state);
    }
    board.push(row);
  } 
  return board;
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

function DrawLine(point, state) {

}

function DrawSquare(row,col, state) {
  var xpixel = (row*sq_height) + board_yoffset + (alt_line_width * (Math.floor(row/5)));
  var ypixel = (col*sq_width)  + board_xoffset + (alt_line_width * (Math.floor(col/5)));
  ctx.fillStyle = "#FFFFFF"; 
  if (state == 1) {
    ctx.fillStyle = "#FF0000"; 
  }
  if (state == 2) {
    ctx.fillStyle = "#888888";
  }
  ctx.strokeStyle = "#0000FF";
  ctx.fillRect(xpixel,ypixel,sq_width,sq_height);
  ctx.strokeRect(xpixel,ypixel,sq_width,sq_height);
}

function GetCol(x){
  return Math.floor((x-board_xoffset+line_width) / (sq_width + (alt_line_width / 5)));
var dirty            = false;
}

function GetRow(y){
  return Math.floor((y-board_yoffset+line_width) / (sq_width + (alt_line_width / 5)));
}

function GetColRow(point){
  var col = GetCol(point.x);
  var row = GetRow(point.y);
  return { col:col,
           row:row };
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

function alertXY(point){
  alert("x:" + point.x + " y:" + point.y + " col:" + GetCol(point.x) + " row:" + GetRow(point.y));
}

function GetButtonIE(button){
  if (button == 1) return left_button;
  if (button == 4) return middle_button;
  if (button == 2) return right_button;
}

function GetButton(event) {
  var button = event.button;
  if (event.target) 
    var target = event.target;
  else if (event.srcElement) { //IE
    var target = event.srcElement;
    button = GetButtonIE(event.button);
  }
  return button;
}

function GetMouse(event) {
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

  return { x:x, 
           y:y,
           button:GetButton(event) };
}

function HandleClick(event) {
  if (!event)
    var event = window.event;
  var mouse = GetMouse(event);
  var col = GetCol(mouse.x);
  var row = GetRow(mouse.y);
  var state = ToggleState(board[col][row], mouse.button);
  board[col][row] = state;
  DrawSquare(col, row, state);
}

function ToggleMouse(tog, button) {
  //do final draw
  mouse_button = button;
  if (mouse_down && tog == "up") {
    GlobalMouseUp();
  }
  else if (!mouse_down && tog == "down") {
    mouse_down = true;
  }
}

function ToggleAndDrawBoardState(square, button) {
  if (to_state == undefined) {
    to_state = ToggleState(board[square.col][square.row], button);
  }
  board[square.col][square.row] = to_state;
  DrawSquare(square.col, square.row, to_state);
  return to_state;
}

function HandleMouseDown(event) {
  if (!event)
    var event = window.event;
  var mouse = GetMouse(event);
  var square = GetColRow(mouse);
  mouse_button = mouse.button;
  mouse_down = true;
  starting_square = square;
  this_move.push(square);
  mouse_move_hash[[square.col, square.row]] = true;
  to_state = ToggleAndDrawBoardState(square, mouse.button);
  canvas.addEventListener("mousemove", HandleMouseMoveList, false);
}

function DrawChanges() {
  if (!dirty) {
    return;
  }
  for (var key in mouse_move_hash) {
    var tmp = key.split(',');
    var square = { col:tmp[0],
                   row:tmp[1] };
    if (board[square.col][square.row] != empty_state  
        && to_state != empty_state) {
      continue;
    }
    board[square.col][square.row] = to_state;
    DrawSquare(square.col, square.row, to_state);
  }
  dirty = false;
  return;
}

function GetMoveAxis(first_square, second_square) {
  var col = first_square.col - second_square.col;
  var row = first_square.row - second_square.row;
  if (col)
    col = undefined;
  else
    col = first_square.col;
  if (row)
    row = undefined;
  else 
    row = first_square.row;
  return { col:col,
           row:row }
}

function GetMove(square) {
  var axis = GetMoveAxis(starting_square, second_square);
  if (axis.col)
    return { row:square.row,
             col:starting_square.col }
  if (axis.row)
    return { row:starting_square.row,
             col:square.col }
}

function HandleMouseMoveList(event) {
  var square = GetColRow(GetMouse(event));
  if (mouse_move_hash[[square.col, square.row]] == undefined) {
    if (second_square == undefined) {
      second_square = square;
    }
    var move = GetMove(square);
    this_move.push(move);
    mouse_move_hash[[move.col, move.row]] = true;
    dirty = true;
  }
  return;
}

function HandleMouseMove(event) {
  if (!mouse_down)
    return;
  var foo;
  var square = GetColRow(GetMouse(event));
  if (square.col == starting_square.col && square.row == starting_square.row) {
    return;
  }
  if (second_square == undefined) {
    second_square = square;
    this_move.push(square);
    ToggleAndDrawBoardState(square, mouse_button);
    return;
  }
  if (square.col == second_square.col && square.row == starting_square.row) {
    return;
  }
  var move = GetMove(square);
  this_move.push(move);
  ToggleAndDrawBoardState(move, mouse_button); 
}

function GlobalMouseUp() {
  canvas.removeEventListener("mousemove", HandleMouseMoveList, false);
  //do final draw
  mouse_move_hash = {};
  mouse_down = false;
  erase      = false;
  mouse_button    = undefined;
  starting_square = undefined;
  second_square   = undefined;
  last_square     = undefined;
  to_state        = undefined;
  if (this_move.length != 0)
    undo_stack.push(this_move);
  this_move = [];
  return false;
}

function UndoMove(){
  var move = undo_stack.pop();
  var cell;
  var move_value;
  var length = move.length;
  var i;
  for (i = 0; i < length; i++){
    move_value = move.pop()
    cell = document.getElementById(move_value[0]);
    cell.style.backgroundColor = move_value[1];
  }
}

function ToggleState(state, button) {
  if (button == left_button) {
    if (state == on_state)
      return empty_state;
    else
      return on_state;
  }
  if (button == right_button) {
    if (state == x_state)
      return empty_state;
    else
      return x_state;
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
  div.appendChild(canvas);
}

var board_dimensions = { width :25,
                         height:14 };
var board = CreateBoard(board_dimensions);
var foo = CalcCanvasSize(board_dimensions);
LoadCanvas('board', CalcCanvasSize(board_dimensions));
board[3][2] = on_state;
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.lineWidth = line_width;
DrawBoard(board);
canvas.addEventListener("mousedown", HandleMouseDown, false);
document.onmouseup = GlobalMouseUp;
document.oncontextmenu = function () { return false; };
var redraw_timer = setInterval(DrawChanges, 1000/20);

