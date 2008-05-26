
var mouse_down = false;
var mou;
var mouse_button = 0;
var erase = false;
var last_cell_color = "";
//mou.button yeilds left=>0, middle=>1, right=>2 other buttons need to be captured differently
var board;

function PadDigits(n, totalDigits) { 
  n = n.toString(); 
  var pd = ''; 
  if (totalDigits > n.length) { 
    for (i=0; i < (totalDigits-n.length); i++) { 
      pd += '0'; 
    } 
  } 
  return pd + n.toString(); 
} 
function DrawCell(div, button) {
  var cell = document.getElementById(div);
  cell.style.backgroundColor = last_cell_color;
}
function Toggle(div, button){
  var cell = document.getElementById(div);
  if (cell.style.backgroundColor == ""){
    if (button == 0){
      cell.style.backgroundColor = "#ff44ff";
      last_cell_color = "#ff44ff";
    }
    if (button == 2) {
      cell.style.backgroundColor = "#000000";
      last_cell_color = "#000000";
    }
  }
  else if (cell.style.backgroundColor == "rgb(255, 68, 255)" || cell.style.backgroundColor == "#ff44ff") {
    if (button == 0) {
      cell.style.backgroundColor = "";
      erase = true;
      last_cell_color = "";
    }
    if (button == 2) {
      cell.style.backgroundColor = "#000000";
      last_cell_color = "#000000";
    }
  }
  else {
    if (button == 0) {
      cell.style.backgroundColor = "#ff44ff";
      last_cell_color = "#ff44ff";
    }
    if (button == 2) {
      cell.style.backgroundColor = "";
      erase = true;
      last_cell_color = "";
    }
  }
}
function KeyCheck(e){
   var KeyID = (window.event) ? event.keyCode : e.keyCode;
   alert("heyy " + KeyID);
}
function GlobalMouseUp() {
  mouse_down = false;
  mouse_button = 0;
  erase = false;
}
function Mouse(tog, button) {
  mouse_button = button;
  if (mouse_down && tog == "up") {
    GlobalMouseUp();
  }
  else if (!mouse_down && tog == "down") {
    mouse_down = true;
  }
}
function CatchContext(e) {
  if (!e) 
    var e = window.event;
  if (e.type == "mousedown")
    Mouse("down", e.button);
  if (e.type == "mouseup") 
    Mouse("up", 0);
  if (mouse_down) 
    Toggle(e.target.id, e.button);
  
  e.cancelBubble = true;
  if (e.stopPropagation) 
    e.stopPropagation();
  return false;
}
function DrawLine (e) {
  if (!e)
    var e = window.event;
  if (mouse_down) {
    DrawCell(e.target.id, mouse_button);
  }
}
function show_props(obj, obj_name) { 
  var result = "" 
  for (var i in obj) 
    result += i + " = " + obj[i] + "\n" 
  return result; 
} 
function PrintTable(){
  //look at rows
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
    var row_or_col_id = row_or_col + PadDigits(parseInt(i)+1, 2);
    document.getElementById(row_or_col_id).innerHTML = value_string;
  } 
}
function CreateRows(){
  FillClueValues('row');
}
function CreateCols() {
  FillClueValues('col');
}
function BlankBoard() {
  for (row in board) {
    for (col in board[0]) {
      var div = document.getElementById("r" + PadDigits (parseInt(row)+1, 2) + "c" + PadDigits (parseInt(col)+1, 2));
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
      cell_name = 'r' + PadDigits(row, 2) + 'c' + PadDigits(col, 2);
      cell = document.getElementById(cell_name);
      cell.onmouseup = CatchContext;
      cell.onmousedown = CatchContext;
      cell.oncontextmenu = CatchContext;
      cell.onmouseover = DrawLine;
    }
  }
}
function DrawBoard() {
  var row;
  var col;
  var table_width = parseInt(((board[0].length/2)*10)+50);
  table_text = '  <caption>Picture Crossword!</caption>\n'; 
  table_text += '  <tr>\n    <th scope="col" id="numcol" class="nobg"></th>\n';
  var col_head_class = "numcol";
  var col_class;
  for (col = 1; col <= board[0].length; col++) { //draw clue columns
    col_head_class = "numcol";
    if ((col != 1) && ((col - 1) % 5 == 0)) {
      col_head_class += " fifth_col_head"; 
    }
    table_text += '    <th scope="col" id="col' + PadDigits(col,2) + '" class="' + col_head_class + '"></th>\n';
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
    table_text += '  <tr>\n    <th scope="row" id="row' + PadDigits(row,2) + '" class="' + row_head_class + '"></th>\n';
    for ( col = 1; col <= board[0].length; col++) {
      col_class = row_class;
      if ((col != 1) && ((col - 1) % 5 == 0)) {
        col_class += " fifth_col_cell";
      }
      table_text += '<td id="r' + PadDigits(row,2) + 'c' + PadDigits(col,2) + '" class="' + col_class + '"></td>\n';
    }
    table_text += '  </tr>\n';
  }
  var mytable = document.getElementById('mytable');
  mytable.style.width = table_width + 'px';
  mytable.innerHTML = table_text;
  PrintTable();
  CreateRows();
  CreateCols();
  BlankBoard();
}
function PopulateBoard() {
  DrawBoard();
  MakeBoardClickable();
}
function CreateBoard(rows, cols, chance) {//chance is a float
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
  CreateBoard(rows, cols, parseInt(chance)/100.0);
  PopulateBoard();
  return false;
}

