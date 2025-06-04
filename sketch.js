let letters = [];
let target = "TKUET";
let collected = "";
let allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()";

let video;
let handPose;
let hands = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Arial');
  noStroke();

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
  // 只顯示鏡頭畫面
  image(video, 0, 0, width, height);

  // 畫標題文字（大且明顯）
  textSize(64);
  textAlign(CENTER);
  stroke(0);
  strokeWeight(6);
  fill(255, 255, 100);
  text("淡江大學教育科技系", width / 2, 90);
  noStroke();
  fill(255);
  text("淡江大學教育科技系", width / 2, 90);

  // 更新並畫掉落的字母（大且有黑框）
  for (let i = letters.length - 1; i >= 0; i--) {
    let letter = letters[i];
    textSize(72);
    textAlign(CENTER, CENTER);
    stroke(0);
    strokeWeight(4);
    fill(255, 255, 255, 220);
    text(letter.char, letter.x, letter.y);
    noStroke();

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
          if (dist(x, y, letter.x, letter.y) < 36) { // 字變大，碰撞半徑也放大
            if (target.includes(letter.char) && !collected.includes(letter.char)) {
              collected += letter.char;
            }
            letters.splice(i, 1);
          }
        }
      }
    }
  }

  // 顯示收集狀況（大且明顯）
  textSize(48);
  textAlign(LEFT, BOTTOM);
  stroke(0);
  strokeWeight(4);
  fill(0, 255, 255);
  text("已收集: " + collected, 30, height - 30);
  noStroke();
  fill(255);
  text("已收集: " + collected, 30, height - 30);

  if (collected.length === target.length) {
    fill(0, 255, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    stroke(0);
    strokeWeight(6);
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
    x: random(80, width - 80),
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
