var grid, ruleset;
var cube_size = 10;
var cell_to_turn_on = [];
var paused = false;

// Moore neighborhood
var neighborhood = [[0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, -1], [1, 1], [-1, 1]];

function setup() {
  var myCanvas = createCanvas(window.innerWidth, window.innerHeight - 100);
  myCanvas.parent('sketch');

  grid = new Grid();
  ruleset = new RuleSet();

  ruleset.rules['born'] = HashString['b'].split(',').filter(function(el) {return el.length != 0}).map(Number);
  ruleset.rules['survive'] = HashString['s'].split(',').filter(function(el) {return el.length != 0}).map(Number);

  setDOMRules();
  noStroke();
  smooth();
}

function draw() {

  if (!paused) {
    grid.step();
    update_info();
  }

  if (mouseIsPressed) 
    toggleCell();
}

// Grid Class
function Grid() {
  this.size = cube_size;
  this.x = Math.round(width/this.size);
  this.y = Math.round(height/this.size);
  this.grid = set2dArrayToZero(createArray(this.x, this.y));
  this.temp_grid = [];
  this.steps = 0;
  this.cells_alive = 0;

  // Turn on some middle cells 
  this.grid[Math.round(this.x/2)][Math.round(this.y/2)] = 1;
  this.grid[Math.round(this.x/2)+1][Math.round(this.y/2)] = 1;
  this.grid[Math.round(this.x/2)-1][Math.round(this.y/2)] = 1;
  this.grid[Math.round(this.x/2)+2][Math.round(this.y/2)] = 1;

  this.step = function() {
    this.temp_grid = createArray(this.x, this.y);
    this.cells_alive = 0;
    // Loop through the 2d array and match the interger result of the neighbors to find the rule
    // Since drawing takes a long time, don't redraw if the cell state doesn't change

    // Turn some cells on if it was clicked
    if (cell_to_turn_on.length == 3) {
      var cell_x = cell_to_turn_on[0];
      var cell_y = cell_to_turn_on[1];

      this.grid[cell_x][cell_y] = cell_to_turn_on[2];
      this.grid[cell_x+1][cell_y] = cell_to_turn_on[2];
      this.grid[cell_x-1][cell_y] = cell_to_turn_on[2];

      cell_to_turn_on = [];
    }

    for (x=0; x<this.x; x++) 
      for (y=0; y<this.y; y++) {

        var result = 0;
        // Loop through the neighbors
        for (z=0; z<neighborhood.length; z++) {
          x2 = neighborhood[z][0];
          y2 = neighborhood[z][1];

          // Is this cell inbounds and alive?
          if (x + x2 >= 0 && x + x2 < this.x && y + y2 >= 0 && y + y2 < this.y && this.grid[x+x2][y+y2] == 1)
            result ++;
        }

        current = this.grid[x][y];
        this.temp_grid[x][y] = ruleset.determineFate(result, current);

        // Count total alive cells
        if (this.temp_grid[x][y] == 1)
          this.cells_alive +=1;

        // Take care of the drawing here
        if (current != this.temp_grid[x][y] || this.steps == 0) {
          if (this.temp_grid[x][y] == 0 ) {
            fill(58, 71, 80);
            rect(x*this.size, y*this.size, this.size, this.size);
          }
          else {
            fill(33, 133, 213);
            rect(x*this.size, y*this.size, this.size, this.size);
          }
        }

      }//End 2d array looping 

    this.grid = this.temp_grid;
    this.steps++;
  }
}; //End of class grid

function RuleSet() {
  this.rules = {};

  this.newRules = function() {
    this.rules = {};
    this.rules['born'] = [];
    this.rules['survive'] = [];

    for (i=1; i<neighborhood.length; i++) {
      if (Math.random() > .5) 
        this.rules['born'].push(i);

      if (Math.random() > .5) 
        this.rules['survive'].push(i);
    }
  }

  this.determineFate = function(num_neighbors, cur_state) {
    if (cur_state == 0) {
      if (this.rules['born'].indexOf(num_neighbors) >=0)
        return 1;
    } else if (this.rules['survive'].indexOf(num_neighbors) >=0)
        return 1;  

    return 0;
  }
}

function update_info() {
  document.getElementById('generations').innerHTML = "Generations : <span class = 'blue'>" + grid.steps + '</span>';

  var cells_p_alive = ((grid.cells_alive/(grid.x * grid.y)) * 100).toFixed(2);
  document.getElementById('cells_alive').innerHTML = "% Cells Alive : <span class = 'blue'>" + cells_p_alive + '</span>';
  document.getElementById('cells_dead').innerHTML = "% Cells Dead : <span class = 'blue'>" + (100 - cells_p_alive).toFixed(2) + '</span>';
}

function set2dArrayToZero(array) {
  for (x=0; x<array.length; x++) 
    array[x].fill(0);

  return array;
}

function set2dArrayRandom(array) {
  for (x=0; x<array.length; x++) 
      for (y=0; y<array[x].length; y++) 
         array[x][y] = Math.round(Math.random());

  return array;
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function mouseClicked() {
  toggleCell();
}

function mouseDragged() {
  toggleCell();
}

function mousePressed() {
  toggleCell();
}

function windowResized() {
  resizeSketch();
}

function resizeSketch() {
  resizeCanvas(window.innerWidth, window.innerHeight - 100);
  grid = new Grid();
}

function toggleCell() {
    var x = Math.round(mouseX/cube_size);
    var y = Math.round(mouseY/cube_size);

    if (x >= 0 && x < grid.x && y >= 0 && y < grid.y) 
      cell_to_turn_on = [x, y, 1 ^ grid.grid[x][y]];
}

function keyPressed() {
  // N for new ruleset
  if (keyCode == 78) {
    grid = new Grid();
    grid.grid[Math.round(grid.x/2)][Math.round(grid.y/2)] = 1;
    ruleset.newRules();
    window.location.hash = 'b=' + ruleset.rules['born'].join() + '&s=' + ruleset.rules['survive'].join();
    setDOMRules();
  }

  // R for restart
  if (keyCode == 82) {
    fill(58, 71, 80);
    rect(0, 0, width, height);
    grid.grid = set2dArrayToZero(grid.grid)
  }

  // S for scramble 
  if (keyCode == 83) {
    grid.grid = set2dArrayRandom(grid.grid);
  }
}

function updateRules(born, survive) {
  ruleset.rules['born'] = born || [];
  ruleset.rules['survive'] = survive || [];

  if (!born) {
    $('#born span.lightgreen').each(function() {
      ruleset.rules['born'].push(parseInt($(this).html()));
    });

    $('#survive span.lightgreen').each(function() {
      ruleset.rules['survive'].push(parseInt($(this).html()));
    });
  }

  window.location.hash = 'b=' + ruleset.rules['born'].join() + '&s=' + ruleset.rules['survive'].join();
  setDOMRules();
}

// Sets up the intial conidtions from the url
var HashString = function () {
  var query_string = {};
  var query = window.location.hash.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }

  if (!query) {
    query_string['b'] = "3"
    query_string['s'] = "1,2,3,4,5"
  }
  
  return query_string;
}();

// Set the hash if there is none, okay not to check for overwrite.
window.location.hash = 'b=' + HashString['b'] + '&s=' + HashString['s'];