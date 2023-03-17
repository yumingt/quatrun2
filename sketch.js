var serial; // variable to hold an instance of the serialport library
var portName = 'COM3'; //rename to the name of your port
var jump; //some data coming in over serial! (left button)
var die; //some data coming in over serial! (right button)
var START = 0;
var PLAY = 1;
var END = 2;
var gameState = START; // three game states: START, PLAY, END

let player; // variable for player
let blobs = []; // array for obstacles
let score = 0; // score counter
let highScore = 0;
let minScore = 0; // minimum score counter

let playerSprite; // sprite of player
let obstacleSprite; // sprite of obstacle
var ground, gameOverImg, playBtnImg, replayImg; // variable for ground and game over sprites

const scoreData = {
  name: "player",
  score: score
};

function preload() {
  playerSprite = loadImage("images/box_cat.PNG"); // load player image onto player sprite
  obstacleSprite = loadImage("images/1pot.PNG"); // load obstacle image onto obstacle sprite
  backImage = loadImage("images/background.PNG"); // load background image onto background
  groundImage = loadImage("images/ground.PNG"); // load ground image onto ground sprite
  gameOverImg = loadImage("images/game_over.png") // load game over image onto game over sprite
  playBtnImg = loadImage("images/play_button.PNG"); // load play button image
  replayImg = loadImage("images/replay.png"); // load replay image
}

function setup() {
  createCanvas(800, 300);
  // // Listen for authentication state changes
  // firebase.auth().onAuthStateChanged(user => {
  //   if (user) {
  //     // User is logged in
  //     saveHighScore(user.uid, highScore);
  //   } else {
  //     // User is logged out
  //     showLoginScreen();
  //   }
  // });

  serial = new p5.SerialPort();       // make a new instance of the serialport library
  serial.on('list', printList);       // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing

  serial.list();                      // list the serial ports
  serial.open(portName);              // open a serial port
  player = new Player(210, 236, 1920, 800, playerSprite);
  ground = createSprite(width, 54, width, 40);
  ground.addImage(groundImage);
  gameOver = createSprite(width/2, 120, 193, 200);
  gameOver.addImage(gameOverImg);
  playBtn = createSprite(width/2, height/2, 1920, 800);
  playBtn.addImage(playBtnImg);
  playBtn.scale = 0.3;
  replayBtn = createSprite(width/2, 180, 193, 200);
  replayBtn.addImage(replayImg);
  replayBtn.scale = 0.04;
}

// get the list of ports:
function printList(portList) {
 // portList is an array of serial port names
 for (var i = 0; i < portList.length; i++) {
 // Display the list the console:
   print(i + " " + portList[i]);
 }
}

function serverConnected() {
  print('connected to server.'); // prints when server is connected
}

function portOpen() {
  print('the serial port opened.') // prints when serial port is opened
}

function serialError(err) {
  //print('Something went wrong with the serial port. ' + err);
  print(err);
}

function portClose() {
  print('The serial port closed.'); // prints when serial port is closed
}

function serialEvent() {
  if (serial.available()) {
    var datastring = serial.readLine(); // reading some serial
    var newarray; // array to store reading from serial
    try {
        newarray = JSON.parse(datastring); // can we parse the serial
      if (typeof newarray == 'object') { // checks of serial reading is an object
          dataarray = newarray; // records value of serial reading
          jump = dataarray[0]; // stores value from left button
          die = dataarray[1]; // stores value from right button
      }
      console.log("got back " + datastring); // logs reading from serial
      } catch(err) {
      // got something that's not a json
    }
  }
}

function keyPressed() {
  if (key == ' ') {
    player.jump();
  }
}

function draw() {
  serial.write(score);
  background(backImage); // set backgound image
  fill(255, 255, 255); // sets score text to be white
  textSize(30); // sets size of score text
  text(round(score), 10, 32); // sets style of score text

  if (gameState === START) {
    gameOver.visible = false; // make game over sprite invisible
    replayBtn.visible = false;
    textSize(14); // sets size of score text
    text("Keyboard controls: Press space to jump", width/2-205, height/2+60)
    text("Handheld controller: Press left button to jump and right button to end game", width/2-205, height/2+90)
    if (mouseX > width/2-85 && mouseX < width/2+85 && mouseY < height/2+30 && mouseY > height/2-30) {
      if (mouseIsPressed) {
        playBtn.visible = false;
        gameState = PLAY;
        playGame();
      }
    }
  } else if (gameState === PLAY) {
    playGame();
  } else if (gameState === END) {
    if (mouseX > width/2-18 && mouseX < width/2+18 && mouseY < height/2+60 && mouseY > height/2-10) {
      if (mouseIsPressed) {
        gameOver.visible = false; // make game over sprite invisible
        replayBtn.visible = false;
        for (var blob of blobs) {
          blob.sprite.visible = false;
        }
        blobs = [];
        score = 0;
        gameState = PLAY;
        //playGame();
      }
    }
  }

  drawSprites(); // displays sprites
}

function playGame() {
  if (jump == 1) {
    player.jump(); // makes player jump if left button or space key is pressed
  }

  if (die == 1) {
    endGame();
  }

  score += 0.05; // increments score

  player.show(); // calls show function in player class
  player.move(); // calls move function in player class

  if (random(1) < 0.03) { // randomizes when new obstacles spawn
    if (score > minScore) { // only if score is continuing to increase
      blobs.push(new Blob(obstacleSprite)); // creates new obstacle from blob class
      minScore = score + 2 + random(1); // updates minScore
    }
  }

  for (var blob of blobs) { // interates through obstacles in obstacle array
    blob.setSpeed(8 + sqrt(score) / 5); // sets speed of obstacle
    blob.move(); // calls move function in blob class
    blob.show(); // calls show function in blob class

    if (player.hits(blob)) { // if player hits obstacle, the game ends
      if (score > highScore) {
        highScore = score;
        serial.write(highScore);
        window.top.postMessage({ type: 'scoreSubmitted', score }, '*');
        // window.top.post message "How to communicate between iframe and parent"
      }
      endGame();
    }

    if (blob.getX() < -50) { // if obstacle is goes off of the screen
      blobs.shift(); // shift obstacle off
      print("Removed"); // prints "removed"
    }
  }
}

function endGame() {
  gameState = END;
  gameOver.visible = true; // makes game over sprite visible if right button is pressed
  replayBtn.visible = true;
  //noLoop(); // ends game if right button is pressed
}

// function saveHighScore(userId, score) {
//   // Save high score to Firebase
//   const db = firebase.firestore();
//   db.collection('high-scores').doc(userId).set({
//     score: score,
//   });
// }

// function showLoginScreen() {
//   // Show login screen
//   const loginScreen = document.getElementById('login-screen');
//   loginScreen.style.display = 'block';
// }