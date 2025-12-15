let songs = [];
let songIndex = 0;
let fft;
let amplitude;

let isPlaying = false;
let nowPlayingLabel;   // 현재 재생 중 텍스트
let playBtn;           // 재생 버튼 저장

function preload() {
  songs[0] = loadSound("Editing a Mii.mp3");
  songs[1] = loadSound("Body Measurement Theme.mp3");
  songs[2] = loadSound("Day Select.mp3");
  songs[3] = loadSound("LEASE.mp3");
}

function setup() {
  hideFileInputs();

  createCanvas(900, 500);
  angleMode(DEGREES);
  colorMode(HSB);
  noStroke();

  fft = new p5.FFT(0.9, 128);
  amplitude = new p5.Amplitude();

  createPlayerButtons();
  createNowPlayingLabel();  // 제목 표시 DOM 생성
}

function hideFileInputs() {
  let inputs = document.querySelectorAll("input[type='file']");
  inputs.forEach(el => el.remove());
}

function createPlayerButtons() {

  // 이전 곡 버튼 — 좌측 하단
  let prevBtn = createButton("〈 이전 곡");
  prevBtn.position(20, height - 40);
  prevBtn.mousePressed(prevSong);

  // 재생 버튼 — 중앙 하단
  playBtn = createButton("▶ 재생");
  playBtn.position(width / 2 - 40, height - 40);
  playBtn.mousePressed(togglePlay);

  // 다음 곡 버튼 — 우측 하단
  let nextBtn = createButton("다음 곡 〉");
  nextBtn.position(width - 120, height - 40);
  nextBtn.mousePressed(nextSong);
}

function createNowPlayingLabel() {
  nowPlayingLabel = createDiv("현재 재생 중: 없음");
  nowPlayingLabel.position(20, 20);

  nowPlayingLabel.style("color", "white");
  nowPlayingLabel.style("font-size", "18px");
  nowPlayingLabel.style("font-weight", "600");

  nowPlayingLabel.style("font-family", "Arial, sans-serif");
}

function updateNowPlaying() {

  let full = songs[songIndex].url;
  let name = full.substring(full.lastIndexOf("/") + 1);
  name = name.replace(/\.[^/.]+$/, "");

  nowPlayingLabel.html(`현재 재생 중: ${name}`);
}

function updatePlayButton() {
  if (isPlaying) playBtn.html("⏸ 일시정지");
  else playBtn.html("▶ 재생");
}

function togglePlay() {
  let s = songs[songIndex];

  if (s.isPlaying()) {
    s.pause();
    isPlaying = false;
  } else {
    stopAllSongs();
    s.play();
    isPlaying = true;
    updateNowPlaying();
  }

  updatePlayButton();
}

function nextSong() {
  stopAllSongs();
  songIndex = (songIndex + 1) % songs.length;
  songs[songIndex].play();
  isPlaying = true;
  updateNowPlaying();
  updatePlayButton();
}

function prevSong() {
  stopAllSongs();
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  songs[songIndex].play();
  isPlaying = true;
  updateNowPlaying();
  updatePlayButton();
}

function stopAllSongs() {
  songs.forEach(s => {
    if (s.isPlaying()) s.stop();
  });
}

function draw() {
  drawGradientBackground();

  let spectrum = fft.analyze();
  let level = amplitude.getLevel();
  let pulse = map(level, 0, 0.3, 0.95, 1.10);
  let timeHue = frameCount % 360;

  // 좌측 EQ
  push();
  translate(150, 0);
  drawEQ(spectrum, timeHue, false);
  pop();

  // 우측 EQ 반전
  push();
  translate(width - 150, 0);
  drawEQ(spectrum, timeHue, true);
  pop();

  // 중앙 동심원
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
      rect(i * barW - (barCount * barW) / 2, height - j * blockHeight - 50,
           barW * 0.8, -blockHeight);
    }
  }
}

function drawDotRings(spectrum, timeHue) {
  const rings = 6;
  const baseRadius = 40;
  const radiusGap = 22;
  const dotSize = 6;

  for (let r = 0; r < rings; r++) {
    let radius = baseRadius + r * radiusGap;
    let count = floor(20 + r * 8);

    for (let i = 0; i < count; i++) {
      let angle = map(i, 0, count, 0, 360);
      let idx = floor(map(angle, 0, 360, 0, spectrum.length - 1));

      let amp = spectrum[idx];
      let offset = map(amp, 0, 255, 0, 10);

      let x = (radius + offset) * cos(angle);
      let y = (radius + offset) * sin(angle);

      let hueValue = (timeHue + angle) % 360;

      fill(hueValue, 80, 100);
      ellipse(x, y, dotSize, dotSize);
    }
  }
}
