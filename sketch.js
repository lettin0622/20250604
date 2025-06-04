let letters = [];
let target = "TKUET";
let collected = "";
let stars = [];
let allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()";

let video;
let handPose;
let hands = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Arial');
  textSize(32);
  noStroke();

  // 初始化星空
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      brightness: random(100, 255)
    });
  }

  // 啟用攝影機
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 HandPose 模型
  handPose = ml5.handpose(video, () => {
    console.log("Handpose model ready");
  });

  // 設定辨識結果的回呼函數
  handPose.on("predict", gotHands);
}

function draw() {
  // 顯示攝影機畫面
  image(video, 0, 0, width, height);

  // 畫星空背景
  for (let star of stars) {
    fill(star.brightness);
    ellipse(star.x, star.y, star.size);
  }

  // 畫標題文字（加粗並發光）
  textSize(48);
  textAlign(CENTER);
  textStyle(BOLD);
  for (let glow = 10; glow > 0; glow--) {
    fill(255, 255, 100, 10);
    text("淡江大學教育科技系", width / 2, 80);
  }
  fill(255);
  text("淡江大學教育科技系", width / 2, 80);

  // 更新並畫掉落的字母
  for (let i = letters.length - 1; i >= 0; i--) {
    let letter = letters[i];
    fill(255, 255, 255, 200);
    textSize(32);
    text(letter.char, letter.x, letter.y);

    // 畫流星尾巴
    for (let j = 0; j < 10; j++) {
      fill(255, 255, 255, 200 - j * 20);
      ellipse(letter.x - j * 2, letter.y - j * 2, 2);
    }

    letter.y += letter.speed;

    // 如果字母超出畫布，移除
    if (letter.y > height) {
      letters.splice(i, 1);
    }
  }

  // 檢查手指是否碰到字母
  if (hands.length > 0) {
    for (let hand of hands) {
      for (let keypoint of hand.keypoints) {
        let x = keypoint.x;
        let y = keypoint.y;

        for (let i = letters.length - 1; i >= 0; i--) {
          let letter = letters[i];
          if (dist(x, y, letter.x, letter.y) < 20) {
            if (target.includes(letter.char) && !collected.includes(letter.char)) {
              collected += letter.char;
            }
            letters.splice(i, 1);
          }
        }
      }
    }
  }

  // 顯示收集狀況與通關提示
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text("已收集: " + collected, 20, height - 40);

  if (collected.length === target.length) {
    fill(0, 255, 0);
    textSize(32);
    textAlign(CENTER);
    text("通關成功！", width / 2, height / 2);
    noLoop();
  }
}

// 每隔一段時間生成新字母或符號
function addLetter() {
  let char;
  if (random() < 0.5) {
    char = random(target.split(""));
  } else {
    char = random(allChars.split(""));
  }
  letters.push({
    char: char,
    x: random(50, width - 50),
    y: 0,
    speed: random(1, 6)
  });
}

setInterval(addLetter, 800);

// 當視窗大小改變時，重新調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 手掌辨識結果的 callback
function gotHands(results) {
  hands = results;
}