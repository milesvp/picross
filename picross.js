
//Firefox: element.style.backgroundColor returns an rgb string value
var rgb_color       = "rgb(255, 68, 255)";
var rgb_alt_color   = "rgb(0, 0, 0)";
var hex_color       = "#ff44ff";
var hex_alt_color   = "#000000";
var starting_color  = "";
var overwrite_color = false;
var mou;
var mouse_down      = false;
var mouse_button    = 0;
var erase           = false;
var last_cell_color = "";
var undo_stack      = [];
var starting_id     = "";
var second_id       = "";
var last_id         = "";
//mou.button yeilds left=>0, middle=>1, right=>2 other buttons need to be captured differently
var board;

function PrintTable(){
  //prints table for debuggin purposes
  document.forms['dform'].debug.value = '';
  str = '';
  for ( row in board ) {   
    for ( col in board[row] ) {   
      if (col != 0) str += ' . ';//document.forms['dform'].debug.value += ' . ';
      //document.forms['dform'].debug.value += board[row].length;
      str += board[row][col];
    }
    str += '\n';
  }
  document.forms['dform'].debug.value = str;
}
function PadNumber(num, totalDigits) {
  var num_padded = num.toString();
  while (num_padded.length < totalDigits) {
    num_padded = "0" + num_padded;
  }
  return num_padded;
}
function GlobalMouseUp() {
  mouse_down = false;
  mouse_button = 0;
  erase = false;
  starting_id = "";
  second_id = "";
  starting_id_color = "";
  last_id = ""
  overwrite_color = false;
  return false;
}
function UndoMove(){
  var move = undo_stack.pop();
  if (move) move[0].style.backgroundColor = move[1];
}
function GetColor(button) {
  //if (button == 0)
  //  return hex_color;
  //if (button == 2)
  //  return hex_alt_color;
  return starting_color;
}
function BackgroundColorEQ(background_color, color){
  if (background_color == color){
    return true;
  }
  if ((background_color == rgb_color) && (color == hex_color)){
    return true;
  }
  if ((background_color == hex_color) && (color == rgb_color)){
    return true;
  }
  if ((background_color == rgb_alt_color) && (color == hex_alt_color)){
    return true;
  }
  if ((background_color == hex_alt_color) && (color == rgb_alt_color)){
    return true;
  }
  return false;
}
function DrawCell(id, button, overwrite_color) {
  var cell = document.getElementById(id);
  if (BackgroundColorEQ(cell.style.backgroundColor, overwrite_color) || (cell.style.backgroundColor == "")) {
    cell.style.backgroundColor = GetColor(button);
    return true;
  }
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
function SetStartingId(id){
  starting_id = id;
  second_id = "";
}
function GetCol(id){
  return id.split('c')[1];
}
function GetRow(id){
  return id.split('c')[0].split('r')[1];
}
function SetSecondId(id){
  if (!starting_id){
    second_id = "";
    starting_id = id;
  }
  else {
    second_id = id;    
  }
}
function SetStartingColor(id, button){
  var cell = document.getElementById(id);
  if (cell.style.backgroundColor == ""){
    overwrite_color = "";
    if (button == 0)
      starting_color = hex_color;
    else if (button == 2)
      starting_color = hex_alt_color;
    else
      starting_color = "";
  }
  else if ((cell.style.backgroundColor == hex_color) || (cell.style.backgroundColor == rgb_color)) {
    overwrite_color = hex_color;
    if (button == 0)
      starting_color = "";
    else if (button == 2)
      starting_color = hex_alt_color;
    else 
      starting_color = cell.style.backgroundColor;
  }
  else if ((cell.style.backgroundColor == hex_alt_color) || (cell.style.backgroundColor == rgb_alt_color)) {
    overwrite_color = hex_alt_color;
    if (button == 0)
      starting_color = hex_color;
    else if (button == 2)
      starting_color = "";
    else
      starting_color = cell.style.backgroundColor;
  }
}
function CatchMouseOver(e) {
  if (!e)
      var e = window.event;
  DrawLine(starting_id, e.target.id, overwrite_color);
}
function CatchContext(e) {
  if (!e) 
    var e = window.event;
  if (e.type == "mousedown"){
    ToggleMouse("down", e.button);
    SetStartingId(e.target.id);
    SetStartingColor(e.target.id, e.button);
  }
  if (e.type == "mouseup") 
    ToggleMouse("up", 0);
  if (mouse_down && (e.type != "contextmenu")) {
    DrawLine(starting_id, e.target.id, overwrite_color);
  }
  e.cancelBubble = true;
  if (e.stopPropagation) 
    e.stopPropagation();
  return false;
}
function WhichAxis(first, last){
  if (!last)
    return "";
  var starting_id_col = GetCol(first);
  var starting_id_row = GetRow(first);
  var second_id_col   = GetCol(last);
  var second_id_row   = GetRow(last);
  if (starting_id_col == second_id_col)
    return "c";
  if (starting_id_row == second_id_row)
    return "r";
}
function GetRowOffset(first,last){
  if (!last || !first)
    return 0;
  var starting_id_row = GetRow(first);
  var second_id_row   = GetRow(last);
  return parseInt(second_id_row,10) - parseInt(starting_id_row,10);
}
function GetColOffset(first,last){
  if (!last || !first)
    return 0;
  var starting_id_col = GetCol(first);
  var second_id_col   = GetCol(last);
  return parseInt(second_id_col,10) - parseInt(starting_id_col,10);
}
function GetCellToDraw(id){
  var curr_cell_col   = GetCol(id);
  var curr_cell_row   = GetRow(id);
  var row_or_col      = WhichAxis(starting_id, second_id);
  if (row_or_col == "c")
    return "r"+curr_cell_row+"c"+GetCol(starting_id);
  else if (row_or_col == "r")
    return "r"+GetRow(starting_id)+"c"+curr_cell_col;
  else 
    return id;
}
function AddOffset(id, row_offset, col_offset){
  var curr_cell_col = parseInt(GetCol(id),10);
  var curr_cell_row = parseInt(GetRow(id),10);
  curr_cell_row += row_offset;
  curr_cell_col += col_offset;
  return "r"+PadNumber(curr_cell_row, 2)+"c"+PadNumber(curr_cell_col,2);
}
function DrawLine (start,stop,overwrite_color) {
  if (!start)
    return false;
  var row_offset = GetRowOffset(start,stop);
  var col_offset = GetColOffset(start,stop);
  var offset = 0;
  if (col_offset == 0){
    if (row_offset >= 0){
      while (offset <= row_offset){
        DrawCell(AddOffset(start, offset, 0), mouse_button, overwrite_color);
        offset += 1;
      }
    }
    else {
      while (offset >= row_offset){
        DrawCell(AddOffset(start, offset, 0), mouse_button, overwrite_color);
        offset -= 1;
      }
    }
  }
  else if (row_offset == 0){
    if (col_offset >= 0){
      while (offset <= col_offset){
        DrawCell(AddOffset(start, 0, offset), mouse_button, overwrite_color);
        offset += 1;
      }
    }
    else {
      while (offset >= col_offset){
        DrawCell(AddOffset(start, 0, offset), mouse_button, overwrite_color);
        offset -= 1;
      }
    }
  }
  else 
    return false;
  return true;
}
function FillClueValues(row_or_col) {
  if (row_or_col == 'row') {
    var i_max = board.length;
    var j_max = board[0].length;
    var seperator = ' ';
    var loop_i_first = true;
  }
  else {
    var i_max = board[0].length;
    var j_max = board.length;
    var seperator = '<br>';
    var loop_i_first = false;
  }
  var i;
  for (i = 0; i < i_max; i++) {
    var value_array = [];
    var counter = 0;
    var adjacent = false;
    var j;
    for (j = 0; j < j_max; j++) {
      if ((loop_i_first && (board[i][j] == false)) || (!loop_i_first && (board[j][i] == false))) {
        value_array[value_array.length] = counter;
        adjacent = false;
        counter = 0;
      }
      else {
        adjacent = true;
        counter += 1;
      }
    }
    if (adjacent = true)
      value_array[value_array.length] = counter;
    var value_nozeroes = [];
    for (index in value_array) {
      if (value_array[index])
        value_nozeroes[value_nozeroes.length] = value_array[index];
    }
    var value_string = value_nozeroes.join(seperator);
    if (value_string == '')
      value_string = '0';
    var row_or_col_id = row_or_col + PadNumber(parseInt(i,10)+1, 2);
    document.getElementById(row_or_col_id).innerHTML = value_string;
  } 
}
function BlankBoard() {
  for (row in board) {
    for (col in board[0]) {
      var div = document.getElementById("r" + PadNumber (parseInt(row,10)+1, 2) + "c" + PadNumber (parseInt(col,10)+1, 2));
      div.style.backgroundColor = "";
    }
  }
}
function MakeBoardClickable(){
  var cell;
  var cell_name;
  var row;
  var col;
  for ( row = 1; row <= board.length; row++ ) {
    for ( col = 1; col <= board[0].length; col++ ) {
      cell_name = 'r' + PadNumber(row, 2) + 'c' + PadNumber(col, 2);
      cell = document.getElementById(cell_name);
      cell.onmouseup = CatchContext;
      cell.onmousedown = CatchContext;
      cell.oncontextmenu = CatchContext;
      cell.onmouseover =  CatchMouseOver;
    }
  }
}
function DrawBoard() {
  //here is where we write to the DOM in order to write the html to make up the board
  var row;
  var col;
  var table_width = parseInt(((board[0].length/2)*10)+50,10);
  table_text = '  <caption>Picture Crossword!</caption>\n'; 
  table_text += '  <tr>\n    <th scope="col" id="numcol" class="nobg"></th>\n';
  var col_head_class = "numcol";
  var col_class;
  for (col = 1; col <= board[0].length; col++) { //draw clue columns
    col_head_class = "numcol";
    if ((col != 1) && ((col - 1) % 5 == 0)) {
      col_head_class += " fifth_col_head"; 
    }
    table_text += '    <th scope="col" id="col' + PadNumber(col,2) + '" class="' + col_head_class + '"></th>\n';
    table_width += 19;
  }
  table_text += '  </tr>\n';
  var row_head_class = 'spec';
  var row_class = 'even';
  for ( row = 1; row <= board.length; row++) {
    if (row % 2 == 0) {
      row_head_class = 'specalt';
      row_class = 'alt';
    }
    else {
      row_head_class = 'spec'; row_class = 'even';
    }
    if ((row != 1) && ((row - 1) % 5 == 0)) {
      row_head_class = "fifth_row_head " + row_head_class;
      row_class += " fifth_row_cell";
    }
    table_text += '  <tr>\n    <th scope="row" id="row' + PadNumber(row,2) + '" class="' + row_head_class + '"></th>\n';
    for ( col = 1; col <= board[0].length; col++) {
      col_class = row_class;
      if ((col != 1) && ((col - 1) % 5 == 0)) {
        col_class += " fifth_col_cell";
      }
      table_text += '<td id="r' + PadNumber(row,2) + 'c' + PadNumber(col,2) + '" class="' + col_class + '"></td>\n';
    }
    table_text += '  </tr>\n';
  }
  var mytable = document.getElementById('mytable');
  mytable.style.width = table_width + 'px';
  mytable.innerHTML = table_text;
  //PrintTable();
  FillClueValues('row');
  FillClueValues('col');
  BlankBoard();
}
function CreateBoard(rows, cols, chance) {
  //This function determines the color values of all spaces
  //chance is a float
  board = new Array(row);
  for (var row=0;row<rows;row++){
    board[row] = new Array(cols);
    for (var col=0;col<cols;col++){
      if (Math.random()<chance) board[row][col] = true;
      else board[row][col] = false;
    }
  }
}
function NewBoard(rows, cols, chance){ 
  if (rows < 1) rows = 1;
  if (cols < 1) cols = 1;
  if (chance < 1) chance = 50;
  CreateBoard(rows, cols, parseInt(chance,10)/100.0);
  DrawBoard();
  MakeBoardClickable();
  undo_stack = [];
  return false;
}

