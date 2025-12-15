let songs = [];
let titles = [];   // 제목 저장 배열
let songIndex = 0;
let fft;
let amplitude;
let volumeSlider;   // 볼륨 슬라이더

let isPlaying = false;
let nowPlayingLabel;
let playBtn;

// preload: 곡 로딩 + 제목 배열 직접 정의

function preload() {

  // 실제 재생 파일 로드
  songs[0] = loadSound("Editing a Mii.mp3");
  songs[1] = loadSound("Body Measurement Theme.mp3");
  songs[2] = loadSound("Day Select.mp3");
  songs[3] = loadSound("LEASE.mp3");

  // 표시용 제목 (확장자 제거)
  // p5 에디터 내부 파일명은 UUID로 바뀌므로 직접 관리해야 함 -> 수정
  titles[0] = "Editing a Mii";
  titles[1] = "Body Measurement Theme";
  titles[2] = "Day Select";
  titles[3] = "LEASE";
}

// setup

function setup() {
  hideFileInputs();

  createCanvas(900, 500);
  angleMode(DEGREES);
  colorMode(HSB);
  noStroke();

  fft = new p5.FFT(0.9, 128);
  amplitude = new p5.Amplitude();

  createPlayerButtons();
  createNowPlayingLabel();

  // 볼륨 슬라이더 생성
  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.position(width / 2 - 75, height - 75);  // 하단 중앙
  volumeSlider.style("width", "150px");
}

// 파일 선택 input 제거

function hideFileInputs() {
  let inputs = document.querySelectorAll("input[type='file']");
  inputs.forEach(el => el.remove());
}


// 버튼 생성 (하단 정렬)

function createPlayerButtons() {

  // 이전 곡 버튼
  let prevBtn = createButton("〈 이전 곡");
  prevBtn.position(20, height - 40);        // 좌측 하단
  prevBtn.mousePressed(prevSong);

  // 재생 버튼
  playBtn = createButton("▶ 재생");
  playBtn.position(width / 2 - 40, height - 40);   // 하단 중앙
  playBtn.mousePressed(togglePlay);

  // 다음 곡 버튼
  let nextBtn = createButton("다음 곡 〉");
  nextBtn.position(width - 120, height - 40);       // 우측 하단
  nextBtn.mousePressed(nextSong);
}

// 현재 곡 제목 표시 UI

function createNowPlayingLabel() {
  nowPlayingLabel = createDiv("현재 재생 중: 없음");
  nowPlayingLabel.position(20, 20);         // 상단 좌측
  nowPlayingLabel.style("color", "white");
  nowPlayingLabel.style("font-size", "18px");
  nowPlayingLabel.style("font-weight", "600");
  nowPlayingLabel.style("font-family", "Arial, sans-serif"); // 버튼과 동일 느낌
}

// 제목 갱신 함수

function updateNowPlaying() {
  // 파일 URL 대신 titles 배열의 제목을 표시하도록 수정  // 핵심 수정
  nowPlayingLabel.html(`현재 재생 중: ${titles[songIndex]}`);
}

// 재생 버튼 텍스트 갱신

function updatePlayButton() {
  if (isPlaying) playBtn.html("⏸ 일시정지");
  else playBtn.html("▶ 재생");
}


// 재생 제어

function togglePlay() {
  let s = songs[songIndex];

  if (s.isPlaying()) {
    s.pause();
    isPlaying = false;
  } else {
    stopAllSongs();
    s.play();
    isPlaying = true;
    updateNowPlaying();  // 재생하면 제목 갱신
  }

  updatePlayButton();
}

function nextSong() {
  stopAllSongs();
  songIndex = (songIndex + 1) % songs.length;
  songs[songIndex].play();
  songs[songIndex].setVolume(volumeSlider.value());
  isPlaying = true;

  updateNowPlaying();  // 제목 갱신
  updatePlayButton();
}

function prevSong() {
  stopAllSongs();
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  songs[songIndex].play();
  songs[songIndex].setVolume(volumeSlider.value());
  isPlaying = true;

  updateNowPlaying();  // 제목 갱신
  updatePlayButton();
}

function stopAllSongs() {
  songs.forEach(s => {
    if (s.isPlaying()) s.stop();
  });
}

// DRAW

function draw() {

  // 슬라이더 볼륨값 항상 반영
  let vol = volumeSlider.value();
  songs[songIndex].setVolume(vol);

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

  // 우측 EQ
  push();
  translate(width - 150, 0);
  drawEQ(spectrum, timeHue, true);
  pop();

  // 중앙 원형 도트
  push();
  translate(width / 2, height / 2);
  scale(pulse);
  drawDotRings(spectrum, timeHue);
  pop();
}


// 배경 그라데이션

function drawGradientBackground() {
  for (let y = 0; y < height; y++) {
    let t = y / height;
    stroke(lerp(230, 260, t), 38, lerp(10, 18, t));
    line(0, y, width, y);
  }
}

// EQ 시각화

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
      rect(
        i * barW - (barCount * barW) / 2,
        height - j * blockHeight - 50,
        barW * 0.8,
        -blockHeight
      );
    }
  }
}

// 중앙 도트 원

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
