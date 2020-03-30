function setup() {
  //createCanvas(800, 600);
  createCanvas(windowWidth, windowHeight - 25);
  angleMode(DEGREES);
  apple.new();
  let startButton = createButton("PLAY / PAUSE");
  let resetButton = createButton("RESET");
  startButton.mousePressed(pausePlay);
  resetButton.mousePressed(resetGame);
  //speed = prompt("Enter speed, 1-10:");
  //SPEED SLIDER
  speedSlider = createSlider(2, 10, 5, 1); //min, max, default, step
  speedSlider.position(width/2 - 50, height);
  //speedSlider.style('width', '200px');
  //frameRate(24);
}

function draw() {
  if (paused === false) {
    background(25, 25, 50);
    drawBorder(10, '#333399'); // Set border width and color
    snake.draw();
    snake.move((width / 1500) * speed); // make speed proportional to canvas width
    //snake.move(2); //controls snake speed
    snake.keyboardControls(3+speed/5); // argument controls turn speed (increases with movement speed)
    snake.updateArray();
    scoreCounter();
    if (snake.collider()) {
      noLoop();
    }
    apple.draw();
    snake.appleEater();
    speed = speedSlider.value();
  }
}

function resetGame() {
  score = 0;
  snake.x = 100;
  snake.y = 300;
  snake.dir = 0;
  snake.positionArray = [];
  snake.bodyLength = 5;
  apple.new();
  paused = false;
  console.log("game reset");
  background(25, 25, 50);
  loop();
}

function pausePlay() {
  paused = !paused;
  console.log("paused is " + paused);
}

let paused = false;
let score = 0;
let speed = 5;

function drawBorder(thickness, color) {
  fill(color);
  rect(0, 0, thickness, height);
  rect(width - thickness, 0, thickness, height);
  rect(0, 0, width, thickness);
  rect(0, height - thickness, width, thickness);
}

let apple = {
  x: 0,
  y: 0,
  size: 30, //QUESTION: WHY CAN'T WIDTH/HEIGHT BE USED HERE (AS A MULTIPLIER)? HOW TO FIX INITIALIZATION ERROR?
  new: function() {
    this.x = random(this.size*2, width - this.size*2); //gives three apples of margin-space between spawn area and canvas edge
    this.y = random(this.size*2, height - this.size*2);
    for (i = 0; i < snake.positionArray.length; i++) {
      if ( //prevents apples from spawning on top of snake body (with one-apple margin)
        this.x > snake.positionArray[i].x - this.size &&
        this.x < snake.positionArray[i].x + this.size &&
        this.y > snake.positionArray[i].y - this.size &&
        this.y < snake.positionArray[i].y + this.size
      ) {
        console.log("overlapped on spawn");
        this.new();
      }
    }
  },
  draw: function() {
    strokeWeight(0);
    fill(255, 100, 100); //sets apple color
    circle(this.x, this.y, this.size);
    fill(255, 255, 255);
    circle(this.x - this.size / 6, this.y - this.size / 6, this.size / 5);
  }
}

function scoreCounter() {
  textSize(32);
  fill(225, 225, 255);
  text(score, 20, 40);
}

let snake = {
  x: 100, // IMPROVE: MAKE RELATIVE TO DISPLAY WIDTH
  y: 300, // IMPROVE: MAKE RELATIVE TO DISPLAY HEIGHT
  moveDist: 0,
  size: 30,
  colorR: 255,
  colorG: 255,
  colorB: 255,
  bodyLength: 5,
  positionArray: [],
  dir: 0,
  //dir: "right", // Legacy directional movement
  appleEater: function() {
    if (this.x >= apple.x - apple.size && this.x <= apple.x + apple.size && this.y >= apple.y - apple.size && this.y <= apple.y + apple.size) {
      apple.new();
      this.bodyLength += width / 100; //control snake growth (use 'width' for canvas-proportional)
      score++;
    }
  },
  updateArray: function() {
    this.positionArray.unshift({ //pushes coordinates to front of array
      x: this.x,
      y: this.y,
      size: abs(3 * sin(frameCount * 10)) + 40,
      colorR: abs(100 * sin(frameCount / 2)) + 155,
      colorG: abs(100 * sin(frameCount / 3)) + 155,
      colorB: abs(100 * cos(frameCount / 2)) + 155,
    });

    if (this.positionArray.length > this.bodyLength) {
      this.positionArray.pop();
      /*keep snake length correct by removing last items of positionArray if it gets longer than bodyLength*/
    }
  },
  draw: function() {
    for (i = this.positionArray.length - 1; i > 0; i--) { //reverse order to draw head above body
      strokeWeight(0.5);
      stroke(255, 255, 255);
      fill(this.positionArray[i].colorR, this.positionArray[i].colorG, this.positionArray[i].colorB); //sets snake color
      circle(this.positionArray[i].x, this.positionArray[i].y, this.positionArray[i].size); //draws body segments
    }
  },
  move: function(speed) {
    this.moveDist = speed;
    this.x += cos(this.dir) * this.moveDist;
    this.y += sin(this.dir) * this.moveDist;


    /* LEGACY DIRECTIONAL MOVEMENT
    if (this.dir === "up") {
      this.y -= moveDist;
    }
    if (this.dir === "down") {
      this.y += moveDist;
    }
    if (this.dir === "left") {
      this.x -= moveDist;
    }
    if (this.dir === "right") {
      this.x += moveDist;
    }
    */
  },
  keyboardControls: function(turnSpeed) {
    if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && this.dir != "down") { //keyCode 87 is S
      //this.dir = "up"; // Legacy directional-movement code
    }
    if ((keyIsDown(DOWN_ARROW) || keyIsDown(83)) && this.dir != "up") { //keyCode 83 is W
      //this.dir = "down"; // Legacy directional-movement code
    }
    if ((keyIsDown(LEFT_ARROW) || keyIsDown(65)) && this.dir != "right") { //keyCode 65 is A
      //this.dir = "left"; // Legacy directional-movement code
      this.dir -= turnSpeed;
    }
    if ((keyIsDown(RIGHT_ARROW) || keyIsDown(68)) && this.dir != "left") { //keyCode 68 is D
      //this.dir = "right"; // Legacy directional-movement code
      this.dir += turnSpeed;
    }
    if (keyIsDown(32)) { //keyCode 32 is spacebar
      this.bodyLength++;
    }
  },
  collider: function() {
    if (this.y < 0 || this.y > height || this.x < 0 || this.x > width) {
      console.log("Crashed into wall");
      return true;
    }
    for (i = 1; i < this.positionArray.length; i++) {
      //if (this.x === this.positionArray[i].x && this.y === this.positionArray[i].y) {
      // legacy checks current x and y against all coordinates in positionArray
      if ( //adds margin to collision detection, necessary for Slither version
        this.x > this.positionArray[i].x - this.moveDist / 2 &&
        this.x < this.positionArray[i].x + this.moveDist / 2 &&
        this.y > this.positionArray[i].y - this.moveDist / 2 &&
        this.y < this.positionArray[i].y + this.moveDist / 2
      ) {
        console.log("crashed into self");
        return true;
      }
    }
    return false;
  }
}