/*
   Description: Sailor's Strike - many different ships attack a sailor's ship and you have to 
   shoot them
   Author: Preneeth Sudhakar
   Date of last edit: March 12 2026
*/
//variables

//images
let waterWaves, fire;

//pos of sailor
let sailorX = 300;
let sailorY = 425;

let sailorHealth = 100;

//pos of bullet
let bulletX = 0;
let bulletY = 0;

//rate of change of bullet
let bulletXrate = 0;
let bulletYrate = 0;

//state can be moving or ready
let bulletState = "ready";

//enemy position and rate of changes and properties
let enemyX = 0;
let enemyY = 0;

let enemyRateX = 0;
let enemyRateY = 0;

let enemyHealth = 100;
let enemyType = "enemyLv1";

//enemybullet properties. this only appears for enemy lv 2
let eBulletX = 0;
let eBulletY = 0;

let eBulletRateX = 0;
let eBulletRateY = 0;

let eBulletState = "ready";

//this is for showing the start screen or game screen
let screen = "start";


//this is for storing different TYPES of ships destroyed and numbers
let destroyedShips = [];

let score = 0;


//other functions other than draw:
//function to draw the actual ship:
function drawShip(shipX, shipY, type, health) {
  angleMode(RADIANS);
  noStroke();
  //create the main shape of the ship
  fill(193, 154, 107);
  rect(shipX - 20, shipY - 25, 40, 50);
    
  fill(111, 78, 55);
  triangle(shipX - 20, shipY - 25, shipX + 20, shipY - 25, shipX, shipY - 60);

  fill(111, 100, 75);
  quad(shipX -20, shipY + 25, shipX + 20, shipY + 25, shipX + 15, shipY + 45, shipX - 15, shipY + 45);

  //other details:
  fill(123, 63, 0);
  arc(shipX, shipY - 25, 40, 40, PI, 2*PI);
  fill(50);
  rect(shipX - 5, shipY - 20, 10, 2);
    
  //to create texture on the ship
  for (let rectX = shipX - 15; rectX < shipX + 15; rectX += 6) {
    fill(0);
    rect(rectX, shipY - 15, 3, 10);
  }
    
  //main guns:
  fill(100);
  for (let gunY = shipY - 25; gunY < shipY; gunY += 10) {
    rect(shipX - 25, gunY, 5, 8);
    rect(shipX + 20, gunY, 5, 8);
  }

  //different colors for different types of ship
  if (type == "sailor") {
    fill(2, 123, 256);
  }
  else if (type == "enemyLv1") {
    fill(239, 68, 68);
  }
  else {
    fill(0);
  }
  arc(shipX, shipY + 10, 100, 20, PI, TWO_PI);
  arc(shipX, shipY + 35, 75, 15, PI, TWO_PI);

  //health bar
  //draws the total health
  fill(100);
  rect(shipX - 37.5, shipY - 85, 75, 15);

  //draws the health of the unit
  let healthBarWidth = calculateHbarProps(health, 75);
  rect(shipX - 37.5, shipY - 85, healthBarWidth, 15);
}


//function to calculate the health bar width using inputs like health and bar width
function calculateHbarProps(health, width) {
  //this one does the math to calculate the width of the health bar and returns the value
  let finalHealthWidth = (health / 100) * width;
  
  //draws a different color for a different health levels
  if (finalHealthWidth >= 66 && finalHealthWidth <= 100) {
    fill(0, 255, 0);
  }
  else if (finalHealthWidth >= 33 && finalHealthWidth <= 66) {
    fill(255, 255, 0);
  }
  else {
    fill(255, 0, 0);
  }
  return finalHealthWidth;
}

//function to calculate the rate of chaneg for the bullet
//for speed, the lower the value, the faster the bukllet travels
function rateChange(startX, startY, finishX, finishY, speed) {
  let xrate = 0;
  let yrate = 0;
  
   //this is for having a negetive or positive x rate of change - negetive for left and pos for right 
  if (startX > finishX) {
    xrate = (startX - finishX) / speed;
    yrate = (startY - finishY) / speed;
  }
  else if (startX < finishX) {
    xrate = -(finishX - startX) / speed;
    yrate = (startY - finishY) / speed;
  }
  return [xrate, yrate];
}

//creates and resets the position and type of enemy
function resetEnemyPos() {
  //has a 25% change to get enemy lv 2 and a 75 % chance for lv1
  enemyType = random(["enemyLv1", "enemyLv1", "enemyLv1", "enemyLv2"]);

  enemyHealth = 100;
  //resets the position and rate of change for enemy and state
  enemyX = random(0, 600);
  enemyY = 0;
  let rates = rateChange(enemyX, enemyY, sailorX, sailorY, 150);

  enemyRateX = rates[0];
  enemyRateY = rates[1];
  
  enemyState = "moving";
}

//function to reset enemy bullet. the black enemy can shoot only once
function resetEBullet() {
  if (eBulletState == "ready") {
    let rates = rateChange(enemyX, enemyY, sailorX, sailorY, 50);

    eBulletX = enemyX;
    eBulletY = enemyY;

    eBulletRateX = rates[0];
    eBulletRateY = rates[1];

    eBulletState = "moving";
  }
}

//for the background image used and fire 
function preload() {
  waterWaves = loadImage("waterWaves.png");
  fire = loadImage("fire.png");
}

function setup() {
  createCanvas(500, 500);
  background(200);
  resetEnemyPos();
}

function draw() {
  if (screen == "game") {
    //using angle mode degrees to allow easy rotation
    angleMode(DEGREES);
    
    //draws an array of water waves on the screen creating more texture for background
    let imageX = 0;
    let imageY = 0;
    //creates a grid of images using 2 while loops one for x axis and one for y axis
    while (imageY < height) {
      while (imageX < width) {
        image(waterWaves, imageX, imageY, 200, 100);
        imageX += 100;
      }
      imageY += 50;
      imageX = 0;
    }
  
    //move the ship with a and d keys with satifying rotate annimations. push() and pop() makes sure only the ship rotates
    push();
    if (keyIsPressed == true && key == "a") {
      //locks the ship to the screen
      if (sailorX < 0) {
        sailorX = 0;
      }
      sailorX -= 3;
      translate(sailorX, 450);
      rotate(345);
    } 
    else if (keyIsPressed == true && key == "d") {
      //locks the ship to the screen
      if (sailorX > 500) {
        sailorX = 500;
      }
      sailorX += 3;
      translate(sailorX, 450);
      rotate(15);
    }
    else {
      translate(sailorX, 450);
      rotate(0);
    }
    drawShip(0, 0, "sailor", sailorHealth);
    pop();
  
    //controls the path of bullet and checks for when bullet is movng
    if (bulletState == "moving") {
      bulletY -= bulletYrate;
      bulletX -= bulletXrate;
      fill(0);
      circle(bulletX, bulletY, 10);
    }
    if (bulletY < 0 || bulletY > 600 || bulletX < 0 || bulletX > 600) {
      bulletState = "ready";
    }
  
    //moves the enemy
    if (enemyState == "moving") {
      enemyY -= enemyRateY;
      enemyX -= enemyRateX;
      
      //the enemy ship is rotated
      push();
      angleMode(DEGREES);
      translate(enemyX, enemyY);
      //rotates the enemy accordng to the directon
      if (enemyRateX < 0) {
        rotate(165);
      }
      else {
        rotate(195);
      }
      drawShip(0, 0, enemyType, enemyHealth);
      pop();
    }
    
    //destroys enemy and add the enemy TYPE to destroyed enemies array and resets enemy
    if (enemyHealth < 0 && enemyType == "enemyLv2") {
      resetEnemyPos();
      destroyedShips.push("enemyLv2");
    }
    else if (enemyHealth < 0) {
      resetEnemyPos();
      destroyedShips.push("enemyLv1");
    }
  
    
    //this is to reduce score and reset enemy position if enemy reaches end
    if (enemyY < 0 || enemyY > 650 || enemyX < 0 || enemyX > 600) {
      resetEnemyPos();
      sailorHealth -= 10;
    }
  
    //if statement to reduce damage if enemy crashes onto user. more damage for different enemy level
    //this for loop is to check every x frame of the enemy to check if it's touching the sailor
    for (let xFrame = enemyX - 20; xFrame < enemyX + 20; xFrame += 1) {
      //reduces 50% for lv 2 and 25% for lv 1
      if (enemyY > sailorY - 60 && xFrame > sailorX - 20 && xFrame < sailorX + 20 && enemyType == "enemyLv1") {
        resetEnemyPos();
        sailorHealth -= 25; 
      }
      else if (enemyY > sailorY - 60 && xFrame > sailorX - 20 && xFrame < sailorX + 20 && enemyType == "enemyLv2") {
        resetEnemyPos();
        sailorHealth -= 50;
  
      }
    }
  
    //detects and reduces damage from enemy if bullet touches enemy
    if (bulletX > enemyX - 20 && bulletX < enemyX + 20 && bulletY > enemyY - 60 && bulletY < enemyY + 45) {
      //this resets the position of the bullet its -100 to avoid one tapping the enemy
      bulletState = "ready";
      bulletX = -100;
      bulletY = -100;
      if (enemyType == "enemyLv1") {
        enemyHealth -= 34;
      }
      else {
        enemyHealth -= 26;
      }
    }
  
    //ends the game if sailor health is below 0
    if (sailorHealth <= 0) {
      //displays the ship with 0 health
      drawShip(sailorX, sailorY + 25, "sailor", 0);

      //displays score and text
      textSize(60);
      fill(0);
      text("GAME OVER GG", 10, 100);
      text(`Score: ${score}`, 150, 200);
      
      //shows the fire image to represent game is over
      image(fire, sailorX- 20, sailorY - 60, 60, 80);
      noLoop();
    }
  
    //calculates and displayes the score using destroyed ships array and for loop to scrol through the array
    score = 0;
    for (let shipNum = 0; shipNum < destroyedShips.length; shipNum += 1) {
      if (destroyedShips[shipNum] == "enemyLv1") {
        score += 1;
      }
      else if (destroyedShips[shipNum] == "enemyLv2") {
        score += 3;
      }
      fill(255);
      rect(390, 10, 100, 20);
      
      fill(0);
      textSize(15);
      text(`Score: ${score}`, 400, 25);
      }
    
    //to creat ad move the boss enemy bullet
    if (enemyType == "enemyLv2" && enemyY >= 100 && enemyY <= 150) {
      resetEBullet();
    }
  
    if (eBulletState == "moving" && enemyType == "enemyLv2") {
      eBulletX -= eBulletRateX;
      eBulletY -= eBulletRateY;
  
      circle(eBulletX, eBulletY, 10);
    }
      
    //keeps the bullet out of the screen to avoid bugs
    else if (eBulletState == "ready") {
      eBulletY = -100;
      eBulletY = -100;
    }
    
    //reset the posision of the enemy bullet every timeit hits corner or sailor
    if (eBulletX < 0 || eBulletY > 500 || eBulletX > 600) {
      eBulletState = "ready";
    }
  
    //detect if bullet touches player and reduce points
    if (eBulletX > sailorX - 20 && eBulletX < sailorX + 20 && eBulletY > sailorY -50) {
      sailorHealth -= 20;
      eBulletState = "ready";
    }
    
    //this is to show a aim cursor thingy that folloes the mouse
    noFill();
    strokeWeight(5);
    stroke(255, 0, 0);
    circle(mouseX, mouseY, 20);
    stroke(0, 0, 255);
    line(mouseX + 5, mouseY, mouseX + 15, mouseY);
    line(mouseX - 5, mouseY, mouseX - 15, mouseY);
    line(mouseX, mouseY - 7.5, mouseX, mouseY - 12.5);
    line(mouseX, mouseY + 7.5, mouseX, mouseY + 12.5);
    strokeWeight(1);
    stroke(0);
    fill(255);

    //checks all the pixels of the ship to check if any enemy has entered a radius and giev a small alert
    let checkX = sailorX - 60;
    let checkY = sailorY - 120;
  }
    
  //this is to show the start screen of the game (shows instructions). game starts when user clicks "s" key
  else if (screen == "start") {
    //shows the instructions and titles
    background(192, 228, 218);
    fill(0);
    textSize(55);
    text("Sailor's Strike", 70, 80);
    textSize(20);
    
    text("Instructions:", 190, 120);
    text("▸ After starting, move the ship with 'a' and 'd' keys", 30, 145);
    text("▸ Aim at a spot and click the mouse to shoot enemies", 15, 170);
    text("▸ 🅁🄴🄼🄴🄼🄱🄴🅁: never click close to the sailor", 25, 195)
    text("▸ dodge the enemies and bullets to survive", 60, 220);
    text("▸ You lose after your health is over", 85, 245);
    
    textSize(35);
    text("Click & Press 's' Key to Start", 20, 280);
    
    drawShip(100, 400, "sailor", 100);
    drawShip(250, 400, "enemyLv1", 100);
    drawShip(400, 400, "enemyLv2", 100);
    
    textSize(15);
    fill(0);
    text("sailor's ship", 50, 467);
    text("Enemy1 - targets you", 170, 467);
    text("Enemy2 - shoots!", 350, 467);
    
    //startes the game when s key pressed
    if (keyIsPressed == true && key == "s") {
      screen = "game";
      //for some reason, the bullet appears after start so I fixed it with this
      bulletState = "ready";
    }
  }
}

//setups the bullet for it's path after user clicked mouse. for example, setting up the rate of change for x and y
function mouseClicked() {
  if (bulletState == "ready") {
    bulletX = sailorX;
    bulletY = sailorY;
    bulletState = "moving";

    //gets the rates of the x and y inside a array
    let speed = 25;
    rates = rateChange(sailorX, sailorY, mouseX, mouseY, speed); 

    //gets the y and x rate from the array recieved by the functon
    bulletYrate = rates[1];
    bulletXrate = rates[0];
  }
}