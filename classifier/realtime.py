# fire_detection_ws.py
import cv2
import cvzone
import threading
import time
import socketio
import json
import socketio.client
import os 
import socket
from ultralytics import YOLO
import requests



device_name = socket.gethostname()

# -------------------- Configuration --------------------

MODEL_PATH = "classifier/best.pt"
CLASS_NAMES = ['other', 'fire', 'smoke']
SOCKET_IO_SERVER_URL = "http://localhost:8080"  # WebSocket endpoint
BACKEND_API_URL = "http://localhost:8080/api/v1/alert"
DETECTION_CONFIDENCE_THRESHOLD = 0.1
ALERT_CONFIDENCE_THRESHOLD = 0.6
ALERT_COOLDOWN_SECONDS = 5
CAMERA_INDEX = 0
FRAME_SIZE = (640, 640)
DEVICE_LOCATION = [27.6713864,85.3361634] #[lat,lng]. 

DEVICE_NAME = device_name

# -------------------- Load Model --------------------
if not os.path.exists(MODEL_PATH):
    print(f"Model file not found at {MODEL_PATH}")
    exit()

try:
    model = YOLO(MODEL_PATH)
    print(f"✅ Model loaded successfully")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    exit()




# -------------------- WebSocket Client --------------------

sio = socketio.Client()


@sio.event
def connect():
    print("Connected to Socket.IO server")

@sio.event
def disconnect():
    print("Disconnected from Socket.IO server")

try:
    sio.connect(SOCKET_IO_SERVER_URL)
except Exception as e:
    print(f"⚠️ Failed to connect to Socket.IO server: {e}")

def send_fire_alert(location, alert_type, confidence, coordinates):
    data = {
        "location": location,
        "alert_type": alert_type,
        "timestamp": int(time.time()),
        "confidence": float(confidence),
        "source_device_id": "camera_001",
        "geo_location": {
            "type": "Point",
            "coordinates": coordinates  # [longitude, latitude] format for MongoDB
        },
        "additional_info": {
            "camera_id": "camera_001",
            "detection_method": "YOLOv8",
            "alert_source": "automated_detection",
            "device_name": DEVICE_NAME
        }
    }
    try:
        response = requests.post(BACKEND_API_URL, json=data, timeout=5)
        if response.status_code == 201:
            print("✅ Alert sent to backend")
            response_data = response.json()
            # Emit to socket server
            sio.emit("fire-alert", response_data)
        else:
            print(f"Failed to send alert: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Error sending alert: {e}")

def send_alert_threaded(location, alert_type, confidence, coordinates):
    threading.Thread(target=send_fire_alert, args=(location, alert_type, confidence, coordinates), daemon=True).start()

# -------------------- Fire Detection --------------------


def run_fire_detection():
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print("❌ Could not open camera")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_SIZE[0])
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_SIZE[1])
    
    last_alert_time = 0
    print(f"🚀 Fire detection started at {DEVICE_LOCATION})")

    try:
        while True:
            success, frame = cap.read()
            if not success:
                continue

            results = model(frame, stream=True, verbose=False)
            detected_for_alert = []

            for result in results:
                for box in result.boxes:
                    conf = float(box.conf[0])
                    if conf > DETECTION_CONFIDENCE_THRESHOLD:
                        cls = int(box.cls[0])
                        label = CLASS_NAMES[cls] if cls < len(CLASS_NAMES) else "unknown"

                        if label in ["fire", "smoke"]:
                            x1, y1, x2, y2 = map(int, box.xyxy[0])
                            color = (0, 0, 255) if label == "fire" else (100, 100, 100)
                            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                            label_text = f'{label} {int(conf * 100)}%'
                            cvzone.putTextRect(frame, label_text, [x1 + 5, y1 + 20], scale=1, thickness=1)

                            if conf > ALERT_CONFIDENCE_THRESHOLD:
                                detected_for_alert.append({"label": label, "confidence": conf})
            
            current_time = time.time()
            if detected_for_alert and (current_time - last_alert_time > ALERT_COOLDOWN_SECONDS):
                fire_detected = any(d['label'] == 'fire' for d in detected_for_alert)
                smoke_detected = any(d['label'] == 'smoke' for d in detected_for_alert)

                if fire_detected:
                    highest_conf = max(d['confidence'] for d in detected_for_alert if d['label'] == 'fire')
                    cvzone.putTextRect(frame, "🔥 FIRE DETECTED!", [10, 40], scale=2, thickness=2, colorR=(0,0,255))
                    send_alert_threaded(DEVICE_LOCATION, "fire", highest_conf, [DEVICE_LOCATION[1], DEVICE_LOCATION[0]])
                    last_alert_time = current_time
                elif smoke_detected:
                    highest_conf = max(d['confidence'] for d in detected_for_alert if d['label'] == 'smoke')
                    cvzone.putTextRect(frame, "💨 SMOKE DETECTED!", [10, 40], scale=2, thickness=2, colorR=(100,100,100))
                    send_alert_threaded(DEVICE_LOCATION, "smoke", highest_conf, [DEVICE_LOCATION[1], DEVICE_LOCATION[0]])
                    last_alert_time = current_time

            cv2.imshow("Fire Detection", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    except KeyboardInterrupt:
        print("🛑 Interrupted by user")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        sio.disconnect()

if __name__ == "__main__":
    run_fire_detection()

