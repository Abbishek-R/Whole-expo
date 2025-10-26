import cv2
import mediapipe as mp
import pygame
from flask import Flask, Response
from flask_socketio import SocketIO

# ------------------- Flask App -------------------
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# ------------------- Alarm Setup -------------------
pygame.mixer.pre_init(frequency=44100, size=-16, channels=2, buffer=512)
pygame.init()
pygame.mixer.music.load("alarm.wav")

# ------------------- Mediapipe -------------------
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)

# ------------------- Globals -------------------
alarm_triggered = False
last_gesture = None

# ------------------- Gesture Detection -------------------
def detect_gesture(landmarks):
    fingers = []
    if landmarks[4].x < landmarks[3].x:
        fingers.append(1)
    else:
        fingers.append(0)
    for tip_id, pip_id in [(8,6),(12,10),(16,14),(20,18)]:
        fingers.append(1 if landmarks[tip_id].y < landmarks[pip_id].y else 0)
    total = sum(fingers)
    if total >= 4: return "Normal"
    elif fingers[0] == 1 and sum(fingers[1:]) <= 1: return "Moderate"
    elif total == 0: return "Emergency"
    return "Moderate"

# ------------------- Video Generator -------------------
def generate_frames():
    global last_gesture, alarm_triggered
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Camera not detected.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        # ❌ Remove the mirror effect (no cv2.flip)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)
        gesture = None

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                gesture = detect_gesture(hand_landmarks.landmark)

            if gesture and gesture != last_gesture:
                socketio.emit('gesture_update', {'gesture': gesture})
                last_gesture = gesture
                print(f"🖐 Detected: {gesture}")

            if gesture == "Emergency":
                cv2.putText(frame, "🚨 EMERGENCY!", (30, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 3)
                if not alarm_triggered:
                    pygame.mixer.music.play(-1)
                    alarm_triggered = True
            else:
                if alarm_triggered:
                    pygame.mixer.music.stop()
                    alarm_triggered = False
        else:
            gesture = "No Hand"
            if last_gesture != gesture:
                socketio.emit('gesture_update', {'gesture': gesture})
                last_gesture = gesture

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return "Gesture Tracking Server Running"

if __name__ == "__main__":
    print("🚀 Gesture server started at http://localhost:5050")
    socketio.run(app, host="0.0.0.0", port=5050, debug=False)
