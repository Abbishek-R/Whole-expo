
  
  const socket = io();

const video = document.getElementById("cameraFeed");
const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");

const gestureLabel = document.getElementById("gestureLabel");
const alarm = document.getElementById("alarmSound");
const cameraStatus = document.getElementById("cameraStatus");
const gestureStatus = document.getElementById("gestureStatus");
const logList = document.getElementById("logList");

let detector, running = false, alarmOn = false, lastGesture = null;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    video.srcObject = stream;
    cameraStatus.textContent = "Camera: Connected";
    cameraStatus.style.color = "#00ff99";
    startDetector();
  } catch (e) {
    cameraStatus.textContent = "Camera: Denied";
    cameraStatus.style.color = "#ff6666";
    alert("Camera permission denied");
  }
}

async function startDetector() {
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: "mediapipe",
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
    modelType: "lite"
  };
  detector = await handPoseDetection.createDetector(model, detectorConfig);
  running = true;
  detectLoop();
}

async function detectLoop() {
  if (!running) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const hands = await detector.estimateHands(video, { flipHorizontal: true });
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let gesture = "No Hand";

  if (hands.length > 0) {
    for (const hand of hands) drawHand(hand.keypoints);
    gesture = classifyGesture(hands[0].keypoints);
  }

  updateUI(gesture);
  socket.emit("gesture_alert", { gesture: gesture });
  requestAnimationFrame(detectLoop);
}

function drawHand(kp) {
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 2;
  kp.forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff00ff";
    ctx.fill();
  });
}

function classifyGesture(kp) {
  const tipIds = [8, 12, 16, 20];
  let open = 0;
  tipIds.forEach(id => { if (kp[id].y < kp[id - 2].y) open++; });
  const thumbOpen = kp[4].x < kp[3].x;
  if (open >= 4) return "Normal";
  if (thumbOpen && open <= 1) return "Moderate";
  if (open === 0) return "Emergency";
  return "Moderate";
}

function updateUI(gesture) {
  if (gesture === lastGesture) return;
  lastGesture = gesture;
  gestureStatus.textContent = gesture;
  addToLog(gesture);

  gestureLabel.className = gesture.toLowerCase();

  switch (gesture) {
    case "Normal": gestureLabel.textContent = "🖐 Normal – Palm Open"; stopAlarm(); break;
    case "Moderate": gestureLabel.textContent = "👍 Moderate – Thumbs Up"; stopAlarm(); break;
    case "Emergency": gestureLabel.textContent = "✊ EMERGENCY!"; triggerAlarm(); break;
    default: gestureLabel.textContent = "No hand detected"; stopAlarm();
  }
}

function addToLog(gesture) {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("p");
  let icon = "✋";
  if (gesture === "Emergency") icon = "🚨";
  else if (gesture === "Moderate") icon = "👍";
  entry.textContent = `${icon} ${gesture} — ${time}`;
  logList.prepend(entry);
  if (logList.children.length > 15) logList.removeChild(logList.lastChild);
}

function triggerAlarm() {
  if (!alarmOn) { alarm.play(); alarm.loop = true; alarmOn = true; }
}

function stopAlarm() {
  if (alarmOn) { alarm.pause(); alarm.currentTime = 0; alarmOn = false; }
}

initCamera();
