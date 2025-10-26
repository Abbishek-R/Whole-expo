from flask import Flask, render_template
from flask_socketio import SocketIO

# ------------------- Flask App -------------------
app = Flask(__name__, template_folder="templates")
socketio = SocketIO(app, cors_allowed_origins="*")

# ------------------- Alarm Setup -------------------
import pygame
pygame.mixer.pre_init(frequency=44100, size=-16, channels=2, buffer=512)
pygame.init()
pygame.mixer.music.load("alarm.wav")

# ------------------- Globals -------------------
alarm_triggered = False

# ------------------- Routes -------------------
@app.route('/')
def index():
    # Serve the mobile gesture page
    return render_template("page3.html")

# ------------------- SocketIO Events -------------------
@socketio.on("gesture_alert")
def handle_gesture_alert(data):
    """
    Receive gesture updates from mobile browser and trigger alarm if needed.
    """
    global alarm_triggered
    gesture = data.get("gesture", "")
    print(f"⚡ Gesture Alert from Mobile: {gesture}")

    if gesture == "Emergency" and not alarm_triggered:
        pygame.mixer.music.play(-1)
        alarm_triggered = True
        print("🚨 Alarm triggered!")
    elif gesture != "Emergency" and alarm_triggered:
        pygame.mixer.music.stop()
        alarm_triggered = False
        print("✅ Alarm stopped")

# ------------------- Main -------------------
if __name__ == "__main__":
    print("🚀 Gesture Emergency Server started at http://0.0.0.0:5050")
    socketio.run(app, host="0.0.0.0", port=5050, debug=True)

