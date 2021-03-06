var board_xoffset     = 5;
var board_yoffset     = 5;
var sq_width          = 20;
var sq_height         = 20;
var alt_line_freq     = 5;
var board_font        = "italic 11pt Ariel";
var line_width        = 4;
var alt_line_width    = 18;
var alt_stroke_color  = "#000088";
var text_color        = "#000000";
var starting_color    = false;
var overwrite_color   = false;
var mouse_down        = false;
var mouse_button      = false;
var erase             = false;
var last_cell_color   = false;
var undo_stack        = [];
var this_move         = [];
var mouse_move_hash   = {};
var starting_id       = false;
var starting_square   = undefined;
var second_square     = undefined;
var to_state          = undefined;
var second_id         = false;
var last_id           = false;
var left_button       = 0;
var middle_button     = 1;
var right_button      = 2;
var empty_state       = 0;
var on_state          = 1;
var x_state           = 2;
var dirty             = false;
var canvas_dimensions = undefined;
var clue_row_spacer   = 5;
var clue_col_spacer   = 5;

function DrawLine(point, state) {

}

function DrawSquare(col, row, state) {
  var xpixel = GetX(col);
  var ypixel = GetY(row);
  board_ctx.fillStyle = "#FFFFFF"; 
  if (state == 1) {
    board_ctx.fillStyle = "#FF0000"; 
  }
  if (state == 2) {
    board_ctx.fillStyle = "#888888";
  }
  board_ctx.strokeStyle = "#0000FF";
  board_ctx.lineWidth = line_width;
  board_ctx.fillRect(xpixel+(line_width/2),ypixel+(line_width/2),sq_width-line_width,sq_height-line_width);
  board_ctx.strokeRect(xpixel,ypixel,sq_width,sq_height);
}

function GetCol(x){
  var board_x = x - (board_xoffset);
//  console.log(board_x);
  if (board_x < 0) {
    return undefined;
  };
  grouping = Math.floor(board_x / ((sq_width * alt_line_freq) + alt_line_width));
  remainder = Math.floor((board_x - (grouping * ((sq_width * alt_line_freq) + alt_line_width))) / sq_width);
  return (grouping * alt_line_freq) + remainder;
}

function GetColold(x){
  return Math.floor((x-board_xoffset) / (sq_width + Math.floor(alt_line_width / alt_line_freq)));
}

function GetRow(y){
  var clues_height = clue_row_spacer;// + canvas_dimensions.row_clues_height;
  var board_y = y - (clues_height + board_yoffset);
//  console.log(board_y);
  if (board_y < 0) {
    return undefined;
  };
  grouping = Math.floor(board_y / ((sq_height * alt_line_freq) + alt_line_width));
  remainder = Math.floor((board_y - (grouping * ((sq_height * alt_line_freq) + alt_line_width))) / sq_height);
  return (grouping * alt_line_freq) + remainder;
}

function GetX(col){
  return (col*(sq_width)) + board_xoffset + (alt_line_width * (Math.floor(col/alt_line_freq)));
}

function GetY(row){
  return (row*sq_height)  + board_yoffset + (alt_line_width * (Math.floor(row/alt_line_freq)));
}

function GetColRow(point){
  var col = GetCol(point.x);
  var row = GetRow(point.y);
  return { col:col,
           row:row };
}

function DrawBoard(board, solution){
  var row_clues = CalcRowClues(solution);
  for (var i=0; i<row_clues.length; i++){ 
    clues_ctx.fillStyle = text_color;
    clues_ctx.font = '13px Ariel';//board_font;
    clues_ctx.textAlign = 'right';
    clues_ctx.fillText(row_clues[i], canvas_dimensions.row_clues_width + board_xoffset, 16 + GetY(i));
  }
  for (var row=0; row<board.length; row++){
    for (var col=0; col<board[0].length; col++){ 
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

  x -= board_canvas.offsetLeft;
  y -= board_canvas.offsetTop;

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
  console.log(mouse);
  starting_square = square;
  this_move.push(square);
  mouse_move_hash[[square.col, square.row]] = true;
  to_state = ToggleAndDrawBoardState(square, mouse.button);
  board_canvas.addEventListener("mousemove", HandleMouseMoveList, false);
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
  if (axis.col !== undefined)
    return { row:square.row,
             col:starting_square.col }
  if (axis.row !== undefined)
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
  board_canvas.removeEventListener("mousemove", HandleMouseMoveList, false);
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

function Load3Canvas(id) {
  var canvas = document.createElement('canvas');
  var row_canvas = document.createElement('canvas');
  var col_canvas = document.createElement('canvas');
  div = document.getElementById(id); 
  col_canvas.id     = "colCanvas";
  col_canvas.width  = 200;
  col_canvas.height = 50;
  col_canvas.style.zIndex   = 8;
  col_canvas.style.position = "absolute";
  div.appendChild(col_canvas);
  row_canvas.id     = "rowCanvas";
  row_canvas.width  = 100;
  row_canvas.height = 100;
  row_canvas.style.zIndex   = 8;
  row_canvas.style.position = "absolute";
  div.appendChild(row_canvas);
  canvas.id     = "myCanvas";
  canvas.width  = 1;
  canvas.height = 1;
  canvas.style.zIndex   = 8;
  canvas.style.position = "absolute";
  div.appendChild(canvas);
  return canvas;
}

function LoadCanvas(div_id, canvas_name) {
  var canvas = document.createElement('canvas');
  div = document.getElementById(div_id); 
  canvas.id     = canvas_name;
  canvas.width  = 1;
  canvas.height = 1;
  canvas.style.zIndex   = 8;
  canvas.style.position = "absolute";
  div.appendChild(canvas);
  return canvas;
}

function CreateBoard(dimensions, chance) {
  //This function determines the color values of all spaces
  //chance is a float
  var board = new Array(dimensions.cols);
  for (var col=0;col<dimensions.cols;col++){
    board[col] = new Array(dimensions.rows);
    for (var row=0;row<dimensions.rows;row++){
      if (Math.random()<chance) 
        board[col][row] = on_state;
      else 
        board[col][row] = empty_state;
    }
  }
  return board;
}

function CalcRowClues(board) {
  var final_clues = [];
  var curr_clues = [];
  for (var i = 0; i < board[0].length; i++) {
    final_clues[i] = [];
    curr_clues[i] = 0;
  }
  for (var x = 0; x < board.length; x++) {
    for (var y = 0; y < board[x].length; y++) {
      if (board[x][y] != on_state) {
        if (curr_clues[y] == 0) {
          continue;
        }
        else {
          final_clues[y].push(curr_clues[y]);
          curr_clues[y] = 0;
        }
      }
      else {
        curr_clues[y] += 1;
      }
    }
  } 
  for (var i = 0; i < curr_clues.length; i++) {
    if (final_clues[i].length == 0) {
      final_clues[i].push(curr_clues[i]);
    }
  }
  return final_clues; 
}

function CalcColClues(board) {
  var final_clues = [];
  var curr_clues = [];
  for (var i = 0; i < board.length; i++) {
    final_clues.push([]);
    curr_clues.push(0);
  }
  for (var x = 0; x < board.length; x++) {
    for (var y = 0; y < board[x].length; y++) {
      if  (board[x][y] != on_state) {
        if (curr_clues[x] == 0) {
          continue;
        }
        else {
          final_clues[x].push(curr_clues[x]);
          curr_clues[x] = 0;
        }
      }
      else {
        curr_clues[x] += 1;
      }
    }
  }
  for (var i = 0; i < curr_clues.length; i++) {
    if (curr_clues[i]) {
      final_clues[i].push(curr_clues[i]);
    }
  }
  return final_clues; 
}

function CalcRowCluesSize(clues) {
  var longest_text_size = 0;
  var text_size;
  for (var i = 0; i < clues.length; i++) {
    text_size = clues_ctx.measureText(clues[i]);
    if (text_size.width > longest_text_size) {
      longest_text_size = text_size.width;
    }
  }
  return longest_text_size;
}

function CalcColCluesSize(clues) {
  return width;
}

function CalcCanvasSize(board) {
  var pixel_width  = GetX(board.length) + line_width;
  var pixel_height = GetY(board[0].length) + line_width;
  if (board.length % alt_line_freq == 0) 
    pixel_width -= alt_line_width;
  if (board[0].length % alt_line_freq == 0) 
    pixel_height -= alt_line_height;
  
  var row_clues_width = CalcRowCluesSize(CalcRowClues(board));
  return { width: pixel_width,
           height: pixel_height,
           row_clues_width: row_clues_width }; 
}

function ResizeCanvas(dimensions) {
  board_canvas.width  = dimensions.width;
  board_canvas.height = dimensions.height;
  clues_canvas.width  = clue_row_spacer + dimensions.row_clues_width;;
  clues_canvas.height = dimensions.height;
  document.getElementById('clues').style.width = clues_canvas.width; 
  document.getElementById('board').style.marginLeft = clues_canvas.width;
}


var clues_canvas = LoadCanvas('gamediv', 'clues');
var board_canvas = LoadCanvas('gamediv', 'board');
var board_ctx = board_canvas.getContext("2d");
var clues_ctx = clues_canvas.getContext("2d");
board_ctx.lineWidth = line_width;
board_canvas.addEventListener("mousedown", HandleMouseDown, false);

document.onmouseup = GlobalMouseUp;
document.oncontextmenu = function () { return false; };
var redraw_timer = setInterval(DrawChanges, 1000/20);


var board_dimensions = { cols:29,
                         rows:24 };
var board = CreateBoard(board_dimensions, 0);
var solution = CreateBoard(board_dimensions, .5);
clues_ctx.font = board_font;
var canvas_dimensions = CalcCanvasSize(solution);
ResizeCanvas(canvas_dimensions);
DrawBoard(board, solution);
board_ctx.lineWidth = line_width;
board_ctx.fillStyle = "#FF0000";
//board_ctx.fillRect(8,8,sq_width,sq_height);
//board_ctx.strokeRect(28,8,sq_width,sq_height);
//board_ctx.fillRect(8,28,sq_width,sq_height);



