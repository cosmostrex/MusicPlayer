let song;
let fft;

function setup() {
  createCanvas(800, 400);
  fft = new p5.FFT();
  rectMode(CORNERS);

  document.getElementById("audioFile").onchange = handleFile;
}

function draw() {
  background(10);

  if (!song) {
    fill(255);
    text("노래를 선택해주세요", 20, 30);
    return;
  }

  let spectrum = fft.analyze();

  let barsPerSide = 20;
  let totalBars = barsPerSide * 2;
  let barWidth = (width / 2) / barsPerSide; 
  let blockSize = 6;

  // LEFT SIDE
  for (let i = 0; i < barsPerSide; i++) {

    let specIndex = floor(map(i, 0, barsPerSide, 0, spectrum.length));
    let amp = spectrum[specIndex];
    let h = map(amp, 0, 255, 0, height * 0.9);
    let blocks = floor(h / blockSize);

    // 왼쪽 끝부터 안쪽으로 X좌표 이동
    let xCenter = width / 2;
    let x1 = xCenter - (i + 1) * barWidth;
    let x2 = x1 + barWidth * 0.8;

    let hue = map(i, 0, barsPerSide, 300, 330);

    for (let b = 0; b < blocks; b++) {
      let y1 = height - b * blockSize;
      let y2 = y1 - blockSize + 1;

      fill(hue, 80, 100);
      noStroke();
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = color(hue, 80, 100, 0.8);

      rect(x1, y1, x2, y2);
    }
  }

  // -------------------------
  // RIGHT SIDE  → → →
  // -------------------------
  for (let i = 0; i < barsPerSide; i++) {

    let specIndex = floor(map(i, 0, barsPerSide, 0, spectrum.length));
    let amp = spectrum[specIndex];
    let h = map(amp, 0, 255, 0, height * 0.9);
    let blocks = floor(h / blockSize);

    // 오른쪽 끝부터 안쪽으로 X좌표 이동
    let xCenter = width / 2;
    let x1 = xCenter + (i + 1) * barWidth;
    let x2 = x1 + barWidth * 0.8;

    let hue = map(i, 0, barsPerSide, 300, 330);

    for (let b = 0; b < blocks; b++) {
      let y1 = height - b * blockSize;
      let y2 = y1 - blockSize + 1;

      fill(hue, 80, 100);
      noStroke();
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = color(hue, 80, 100, 0.8);

      rect(x1, y1, x2, y2);
    }
  }
}

function handleFile(e) {
  let file = e.target.files[0];
  if (song) song.stop();

  song = loadSound(URL.createObjectURL(file), () => {
    fft.setInput(song);
    song.play();
  });
}
