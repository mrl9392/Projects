let souls = [];
let ress = [];
let resonance;
let resonanceStartTime = null;

let sounds = [];
let lastSoundTime = 0;
let cD = 1500;

let activeColor;
let colorStrength = 0;

let stopBtnX = 20;
let stopBtnY = 20;
let stopBtnSize = 60;

function preload() {
  sounds.push(loadSound("baby_cry.mp3"));
  sounds.push(loadSound("male_cough.mp3"));
  sounds.push(loadSound("sigh.mp3"));
  sounds.push(loadSound("giggle.mp3"));
  sounds.push(loadSound("happy_huming.mp3"));
  sounds.push(loadSound("cutting.mp3"));
  sounds.push(loadSound("shower.mp3"));
  sounds.push(loadSound("snore.mp3"));
  sounds.push(loadSound("clapping.mp3"));
  sounds.push(loadSound("keyboard-typing.mp3"));
  sounds.push(loadSound("breathing-fast.mp3"));
  sounds.push(loadSound("dog-bark.mp3"));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  activeColor = color(0, 0, 0);

  resonance = new p5.Oscillator('pink');
  resonance.amp(0);
}

function draw() {
  // bg fade
  colorStrength = max(colorStrength - 0.002, 0);
  let maxStrength = 0.9;

  let r = lerp(15, red(activeColor), min(colorStrength, maxStrength));
  let g = lerp(20, green(activeColor), min(colorStrength, maxStrength));
  let b = lerp(30, blue(activeColor), min(colorStrength, maxStrength));

  background(r, g, b);

  // update ripple
  for (let i = ress.length - 1; i >= 0; i--) {
    let res = ress[i];
    res.update();
    res.show();
    if (res.finished()) ress.splice(i, 1);
  }

  for (let i = souls.length - 1; i >= 0; i--) {
  let soul = souls[i];

  soul.show();

  // removes soul if too small
  if (soul.size < 1) {
    souls.splice(i, 1);
  }
}


  // ripple collisions
  for (let res of ress) {
    for (let soul of souls) {
      let distance = dist(res.x, res.y, soul.x, soul.y);
      if (!soul.isResing && distance < res.radius + soul.size / 2 && res.trans > 50) {
        soul.Res(activeColor);
        colorStrength = min(colorStrength + 0.0005, 1);
      }
    }
  }

  //stops res if they last too long
  if (resonanceStartTime && millis() - resonanceStartTime > 20000) {
    ress = [];           
    resonance.amp(0, 1);     
    resonanceStartTime = null;
  }

  drawStopButton();
}

function drawStopButton() {
  fill(255, 60);
  rect(stopBtnX, stopBtnY, stopBtnSize, stopBtnSize);
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("STOP", stopBtnX + stopBtnSize / 2, stopBtnY + stopBtnSize / 2);
}

function mousePressed() {
  userStartAudio().then(() => {

    //stop button
    if (
      mouseX > stopBtnX && mouseX < stopBtnX + stopBtnSize &&
      mouseY > stopBtnY && mouseY < stopBtnY + stopBtnSize
    ) {
      stopEverything();
      return;
    }

    // ---- Soul click ----
    for (let soul of souls) {
      let distance = dist(mouseX, mouseY, soul.x, soul.y);
      if (distance < soul.size / 2) {
        activeColor = soul.resColor;
        colorStrength = 0.01;
        soul.Res(activeColor);
      }
    }
  });
}

function keyPressed() {
  if (key === ' ') {
    souls.push(
      new Soul(
        random(width * 0.1, width * 0.9),
        random(height * 0.2, height * 0.8)
      )
    );
  }
}

//drawing souls

function drawSoul(x, y, size, col) {
  push();
  translate(x, y);
  noStroke();

  fill(red(col), green(col), blue(col), 180);
  ellipse(0, 0, size * 1.6, size * 1.6);

  fill(red(col) + 20, green(col) + 20, blue(col) + 20, 220);
  ellipse(0, 0, size * 1.0, size * 1.0);

  fill(col);
  triangle(-size * 0.4, 0, size * 0.4, 0, 0, -size * 1.3);

  pop();
}

// Soul class

class Soul {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseSize = random(4, 7);
    this.size = this.baseSize;
    this.resColor = color(random(50, 255), random(50, 255), random(50, 255));
    this.isResing = false;
    this.lastRes = 0;
    this.voice = random(sounds);

    this.colorStrength = 1;
    this.decayRate = 0.0002;
  }

  show() {
    if (!this.isResing) this.size = max(this.size - 0.003, 0);
    if (!this.isResing) this.colorStrength = max(this.colorStrength - this.decayRate, 0);

    let col = color(
      red(this.resColor) * this.colorStrength,
      green(this.resColor) * this.colorStrength,
      blue(this.resColor) * this.colorStrength
    );

    drawSoul(this.x, this.y, this.size * 3.0, col);
  }

  Res(color) {
    const cooldown = 2000;
    if (millis() - this.lastRes < cooldown) return;

    this.isResing = true;
    this.lastRes = millis();

    this.size = this.baseSize;
    this.colorStrength = min(this.colorStrength + 0.3, 1);

    playResSound(this.x);

    if (this.voice && !this.voice.isPlaying() && millis() - lastSoundTime > cD) {
      this.voice.setVolume(0.3);
      this.voice.play();
      lastSoundTime = millis();
    }

    ress.push(new res(this.x, this.y, color));

    resonanceStartTime = millis(); // START TIMER , doesnt work right now

    setTimeout(() => {
      this.isResing = false;
    }, 800);
  }
}
// Ripple class

class res {
  constructor(x, y, resColor) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.speed = 3;
    this.trans = 255;
    this.resColor = resColor;
  }

  update() {
    this.radius += this.speed;
    this.trans -= 2;
  }

  show() {
    noFill();
    stroke(red(this.resColor), green(this.resColor), blue(this.resColor), this.trans);
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2);
  }

  finished() {
    return this.trans <= 0;
  }
}

function playResSound() {
  resonance.freq(60);
  resonance.amp(0.3, 0.05);
  setTimeout(() => resonance.amp(0, 1.0), 300);
}

//stops everything
function stopEverything() {
  ress = [];
  resonance.amp(0, 1);
  resonanceStartTime = null;
}
