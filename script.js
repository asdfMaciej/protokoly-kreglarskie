function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function isIn2DArray(item, array) {
    for (var i = 0; i < array.length; i++) {
        if (isInArray(item, array[i])) {
            return i;
        }
    }
    return -1;
}

function getCol(matrix, col) {
  var column = [];
  for(var i=0; i<matrix.length; i++){
    column.push(matrix[i][col]);
  }
  return column;
}

function getZawodnicy(array, klub, mf) {
  var newArr = [];
  for (var i=0; i < array.length; i++) {
    if ((array[i][3] == klub) || klub == -1) {
      if ((isInArray(array[i][4], kategorie_m) && mf == 'm') || mf != 'm') {
        if ((isInArray(array[i][4], kategorie_f) && mf == 'f') || mf != 'f') {
          newArr.push(array[i][2]);
        }
      }
    }
  }
  return newArr;
}

var zawodnicy = [  // unsure if I can include
	["license ID","date of license issue","name surname","club","age group","birthday"],
	]
]

var zawodnicy_fullname = getCol(zawodnicy, 2);

var kategorie_m = [
  "Senior",
  "Junior",
  "Junior młodszy",
  "Młodzik"
]

var kategorie_f = [
  "Seniorka",
  "Juniorka",
  "Juniorka młodsza",
  "Młodziczka"
]

var sedzie = [  // unsure if I can include
	"list of bowling referees"
]

var druzyny_miedzyokregowa = [
  "KK Dziewiątka-Amica Wronki",
  "OSiR Vector Tarnowo Podgórne",
  "KS Polonia 1912 Leszno",
  "KS Polonia Łaziska Górne",
  "KS Start Gostyń",
  "MLKS Tucholanka Tuchola"
]

var druzyny_superliga_kobiet = [
  "KS Alfa-Vector Tarnowo Podgórne",
  "KS Czarna Kula Poznań",
  "TKKF Dębinki Gdańsk",
  "KK Dziewiątka-Amica Wronki",
  "KS Polonia 1912 Leszno",
  "MLKS Tucholanka Tuchola"
]

var druzyny_superliga_mezczyzn = [
  "KS Alfa-Vector Tarnowo Podgórne",
  "BOSiR Brzesko",
  "KS Czarna Kula Poznań",
  "KK Dziewiątka-Amica Wronki 1",
  "KK Dziewiątka-Amica Wronki 2",
  "KS Polonia 1912 Leszno",
  "KS Start Gostyń"
]

var sedzia_cell = 'L9';  // komorka sedzi
var druzyny_cells = ['A13', 'A24', 'L13', 'L24'];  // komorki z druzynami
var zawodnicy_cells = ['B16:B20', 'B27:B31', 'M16:M20', 'M27:M31'];  // zawodnicy tych druzyn
var druzyny_cells_val = [];  // generowane w runtime w celu optymalizacji

var s_sedzia_cell = 'R8';  // j.w., ale dla superligi
var s_druzyny_cells = ['E12', 'T12'];  // j.w., ale dla superligi
var s_zawodnicy_cells = ['A14:A61', 'P14:P61'];  // j.w., ale dla superligi
var s_zawodnicy_wtf = [14, 16, 18, 21, 23, 25, 28, 30, 32, 35, 37, 39, 42, 44, 46, 49, 51, 53, 55, 57, 59, 61]; // minus 13
var s_druzyny_cells_val = [];  // ^ niestety nie mozna robic np. A14;A16;A18 ani A14,A16,A18 przy getrange

var licencja_cols = [1, 16]; // kolumny z licencja
var zawodnik_cols = [1, 3, 16, 18];
var okregowa_zawodnik_cols = [2, 3, 4, 13, 14, 15];
var okregowa_rows = [16, 17, 18, 19, 20, 27, 28, 29, 30, 31];
var okregowa_licencja_cols = [5, 16];

var s_kategoria_cols = [12];
var s_zawodnik_cols = [1, 16];

function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  var menu = SpreadsheetApp.getUi().createAddonMenu();
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {  // tbh this if statement is useless but eh
    menu.addItem('Rozpocznij protokół', 'startProto');
    menu.addToUi();
  } else {
    menu.addItem('Rozpocznij protokół', 'startProto');
    menu.addToUi();
  }  
}

function startProto() {
  var miedzyokregowa = SpreadsheetApp.getActiveSheet().getRange(1, 5).getValue().toLowerCase().indexOf('protokół meczowy') !== -1;
  var superliga = SpreadsheetApp.getActiveSheet().getRange(1, 1).getValue().toLowerCase().indexOf('protokół meczowy') !== -1;
  var ui = SpreadsheetApp.getUi();  // ^ miedzyokregowa ma protokol meczowy w A5, a superliga w A1. 
  ui.createMenu('Kręgle - protokoły').addItem('O dodatku', 'about_addon').addToUi();
  
  if (miedzyokregowa) {
    set_cells();  
  } else if (superliga) {
    s_set_cells();
  }
}

function set_cells() {
  var cell = SpreadsheetApp.getActive().getRange(sedzia_cell);
  var sedzia_rule = SpreadsheetApp.newDataValidation().requireValueInList(sedzie).build();
  cell.setDataValidation(sedzia_rule);
  set_zawodnicy(true, -1);
}

function set_zawodnicy(normal, n) {
  druzyny_cells_val = [];
  if (normal) {var druzyna_rule = SpreadsheetApp.newDataValidation().requireValueInList(druzyny_miedzyokregowa).build();}
  for (var i in druzyny_cells) {
    var rad = SpreadsheetApp.getActive().getRange(druzyny_cells[i]);
    druzyny_cells_val.push(rad.getValue());
    if (normal) {rad.setDataValidation(druzyna_rule);}
  }
  
  for (var i in zawodnicy_cells) {
    var zaw = SpreadsheetApp.getActive().getRange(zawodnicy_cells[i]);
    var druz = getZawodnicy(zawodnicy, druzyny_cells_val[i], -1);
    var klub_rule = SpreadsheetApp.newDataValidation().requireValueInList(druz).build();
    zaw.setDataValidation(klub_rule);
    if (!normal && druzyny_cells[i] == n) {
      zaw.clearContent();
      var lic = zaw.offset(0, 3);  // 3 w prawo
      lic.clearContent();
    }
  }
}

function s_match_m_or_f() {
  var rr = 'L4:L9';  // to te X do zaznaczania mezczyzn/kobiet
  var male_c = [[1,1], [3,1], [5,1]];
  var female_c = [[2,1], [4,1], [6,1]];
  var male_cr = true, female_cr = true;
  var rr = SpreadsheetApp.getActive().getRange(rr);
  for (var i in male_c) {if(!rr.getCell(male_c[i][0], male_c[i][1]).isBlank()) {male_cr = false; break;}}
  for (var i in female_c) {if(!rr.getCell(female_c[i][0], female_c[i][1]).isBlank()) {female_cr = false; break;}}
  if (male_cr && !female_cr) {
    return 'f';
  } else if (female_cr && !male_cr) {
    return 'm';
  } else {
    return -1;
  }
}

function s_normalize_team(team) {
  var last = isInt(team.slice(-1));
  if (!last) {
    return team;
  } else {
    return team.slice(0, -2); // usuwa np. dziewiatka-amica wronki[ 1] <-- to 
  }
}

function s_set_cells() {
  var cell = SpreadsheetApp.getActive().getRange(s_sedzia_cell);
  var sedzia_rule = SpreadsheetApp.newDataValidation().requireValueInList(sedzie).build();
  cell.setDataValidation(sedzia_rule);
  s_set_zawodnicy(true, -1);
}

function s_set_zawodnicy(normal, n) {
  druzyny_cells_val = [];
  var m_or_f = s_match_m_or_f();
  if (normal) {
    var druz = [];
    if (m_or_f == 'm') {druz = druzyny_superliga_mezczyzn;}
    else if (m_or_f == 'f') {druz = druzyny_superliga_kobiet;}
    else {druz = druzyny_superliga_mezczyzn.concat(druzyny_superliga_kobiet);}
    var druzyna_rule = SpreadsheetApp.newDataValidation().requireValueInList(druz).build();
  }
  for (var i in s_druzyny_cells) {
    var rad = SpreadsheetApp.getActive().getRange(s_druzyny_cells[i]);
    s_druzyny_cells_val.push(rad.getValue());
    if (normal) {rad.clearDataValidations(); rad.setDataValidation(druzyna_rule);}
  }
  
  for (var i in s_zawodnicy_cells) {
    var zaw = SpreadsheetApp.getActive().getRange(s_zawodnicy_cells[i]);
    var druz = getZawodnicy(zawodnicy, s_normalize_team(s_druzyny_cells_val[i]), m_or_f);
    var klub_rule = SpreadsheetApp.newDataValidation().requireValueInList(druz).build();
    for (var x in s_zawodnicy_wtf) {
      var c = zaw.getCell(s_zawodnicy_wtf[x]-13, 1);
      c.clearDataValidations();
      c.setDataValidation(klub_rule);
      if (!normal && s_druzyny_cells[i] == n) { 
        c.clearContent();
        var lic = c.offset(1, 0);  // jedno ponizej
        lic.clearContent();
        var dat = lic.offset(0, 2); // i dwa w prawo. jedno range i jedno clearc nie dziala
        dat.clearContent();
      }
    }
    
  }
}

function onEdit(e) {
  var range = e.range;
  var superliga = SpreadsheetApp.getActiveSheet().getRange(11, 5).getBackground();
  var sheet = e.source.getActiveSheet();
  var column = range.getColumn();
  var row = range.getRow();
  var ui = SpreadsheetApp.getUi();
  var miedzyokregowa = SpreadsheetApp.getActiveSheet().getRange(3, 5).getValue().toLowerCase() == "liga międzyokręgowa";
  var superliga = SpreadsheetApp.getActiveSheet().getRange(1, 1).getValue().toLowerCase().indexOf('protokół meczowy') !== -1;
  
  if (miedzyokregowa) {
    if (
      (isInArray(column, okregowa_zawodnik_cols) || isInArray(column, okregowa_licencja_cols))
      && isInArray(row, okregowa_rows)  // inaczej losowi zawodnicy po calym arkuszu
      ) {
      zawodnik_n = isIn2DArray(range.getValue(), zawodnicy_fullname);
      if (zawodnik_n != -1) {
        if (isInArray(column, okregowa_licencja_cols)) {
            var zawodnik = sheet.getRange(row, column-3);
            var licencja = range;
        } else if (isInArray(column, okregowa_zawodnik_cols)) {
          var zawodnik = range;
          var licencja = sheet.getRange(row, column+3);
        }
        zawodnik.setValue(zawodnicy[zawodnik_n][2]);
        licencja.setValue(zawodnicy[zawodnik_n][0]);
      } else {
        Logger.log("nie znaleziono");
        Logger.log(row + " : "+ column);
      }
    } else if (row == 13 || row == 24) {
      var n = range.getA1Notation();
      set_zawodnicy(false, n);
    } else {
      //ui.alert(miedzyokregowa);
      //ui.alert(row);
    }
  } else if (superliga) {
    if (isInArray(column, s_zawodnik_cols) && isInArray(row, s_zawodnicy_wtf)) {
      zawodnik_n = isIn2DArray(range.getValue(), zawodnicy);
      if (zawodnik_n != -1) {
        var zawodnik = range;
        var licencja = sheet.getRange(row+1, column);
        var urodzenie = sheet.getRange(row+1, column+2);
        zawodnik.setValue(zawodnicy[zawodnik_n][2]);
        licencja.setValue(zawodnicy[zawodnik_n][0]);
        urodzenie.setValue(zawodnicy[zawodnik_n][5]);
        urodzenie.setNumberFormat("d/mm/yyyy");
      }
    } else if (row == 12) { // druzyna
      var n = range.getA1Notation();
      s_set_zawodnicy(false, n);
    } else if (column == 12) { // kobiety/mezczyzni
      s_set_zawodnicy(true, -1);
    }
  } 
  
}

function about_addon() {
  bragga = "Dodatek służący do wypełniania protokołów w kręglarstwie klasycznym.\
            Stworzony przez Macieja Kaszkowiaka."
  SpreadsheetApp.getUi().alert(bragga);
}
