let song;
let fft;
let amplitude;

function preload() {
  song = loadSound("2024.mp3");
}

function setup() {
  createCanvas(900, 500);
  angleMode(DEGREES);
  colorMode(HSB);
  noStroke();

  fft = new p5.FFT(0.9, 128);
  amplitude = new p5.Amplitude();
}

function draw() {
  drawGradientBackground();

  let spectrum = fft.analyze();
  let level = amplitude.getLevel();
  let pulse = map(level, 0, 0.3, 0.95, 1.10);
  let timeHue = frameCount % 360;

  push();
  translate(150, 0);
  drawEQ(spectrum, timeHue, false);
  pop();
  
  push();
  translate(width - 150, 0);
  drawEQ(spectrum, timeHue, true);
  pop();
  
  push();
  translate(width / 2, height / 2);
  scale(pulse);
  drawDotRings(spectrum, timeHue);
  pop();
}

function drawGradientBackground() {
  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerp(230, 260, t), 38, lerp(10, 18, t));
    line(0, y, width, y);
  }
}

function drawEQ(spectrum, timeHue, reverse = false) {
  let barCount = 25;
  let barW = 10;

  for (let i = 0; i < barCount; i++) {
    let index = reverse
      ? floor(map(i, 0, barCount, spectrum.length - 1, 0))
      : floor(map(i, 0, barCount, 0, spectrum.length - 1));

    let amp = spectrum[index];
    let hueValue = (timeHue + i * 8) % 360;

    let blockHeight = 7;
    let blocks = floor(map(amp, 0, 255, 0, 22));

    for (let j = 0; j < blocks; j++) {
      fill(hueValue, 80, 95);
      rect(i * barW - (barCount * barW) / 2, height - j * blockHeight - 50, barW * 0.8, -blockHeight);
    }
  }
}

function drawDotRings(spectrum, timeHue) {
  const rings = 6;            // 동심원 개수
  const baseRadius = 40;      // 가장 안쪽 원 반지름
  const radiusGap = 22;       // 각 원 사이 간격
  const dotSize = 6;          // 도트 크기 (작게!)
  
  for (let r = 0; r < rings; r++) {
    let radius = baseRadius + r * radiusGap;
    let count = floor(20 + r * 8); // 바깥쪽으로 갈수록 점 개수 증가

    for (let i = 0; i < count; i++) {
      let angle = map(i, 0, count, 0, 360);
      let idx = floor(map(angle, 0, 360, 0, spectrum.length - 1));

      let amp = spectrum[idx];
      let offset = map(amp, 0, 255, 0, 10); // 반응하는 흔들림

      let x = (radius + offset) * cos(angle);
      let y = (radius + offset) * sin(angle);

      let hueValue = (timeHue + angle) % 360;

      fill(hueValue, 80, 100);
      ellipse(x, y, dotSize, dotSize);
    }
  }
}

function mousePressed() {
  if (!song.isPlaying()) song.play();
}
