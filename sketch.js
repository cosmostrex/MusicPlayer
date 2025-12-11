let song;
let fft;

const NUM_BARS = 32;
const BLOCK_H = 6;
const BAR_W = 10;

function preload() {
  song = loadSound("2024.mp3");
}

function setup() {
  createCanvas(900, 450);
  fft = new p5.FFT(0.9, 128);
  createButtons();
}

function draw() {
  background(0);
  drawEQ();
  drawCenterEffect();
}

function drawEQ() {
  let spectrum = fft.analyze();

  let leftStart = width * 0.25;
  let rightStart = width * 0.75;

  for (let i = 0; i < NUM_BARS; i++) {

    let idx = floor(map(i, 0, NUM_BARS, 0, spectrum.length));
    let amp = spectrum[idx];

    let h = map(amp, 0, 255, 0, height * 0.7);


    let boost = map(abs(i - NUM_BARS/2), 0, NUM_BARS/2, 1.2, 0.4);
    h *= boost;

    let blocks = floor(h / BLOCK_H);

    drawBar(leftStart - i * BAR_W, blocks);
    drawBar(rightStart + i * BAR_W, blocks);
  }
}


function drawCenterEffect() {
  push();
  let cx = width / 2;
  let cy = height / 2;

  noStroke();
  for (let i = 0; i < 60; i++) {

    let x = cx + random(-40, 40);
    let y = cy + random(-80, 80);

    fill( random(150,255), random(50,150), random(200,255), random(40,120) );
    rect(x, y, random(2,5), random(2,5));
  }
  pop();
}


function drawBar(x, blocks) {
  for (let j = 0; j < blocks; j++) {
    let c = color(200 + j * 2, 50, 255 - j * 5);
    fill(c);
    noStroke();

    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = c;

    let y = height - j * BLOCK_H;
    rect(x, y, BAR_W * 0.8, -BLOCK_H);
  }
}


function createButtons() {
  let playBtn = createButton("▶ Play");
  playBtn.mousePressed(() => song.play());

  let pauseBtn = createButton("⏸ Pause");
  pauseBtn.mousePressed(() => song.pause());

  let stopBtn = createButton("⏹ Stop");
  stopBtn.mousePressed(() => song.stop());
}
