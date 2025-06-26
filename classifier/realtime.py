# fire_detection_ws.py
import cv2
import cvzone
import threading
import time
import asyncio
import websockets
import json
from ultralytics import YOLO

# -------------------- Configuration --------------------
MODEL_PATH = "classifier/best.pt"
CLASS_NAMES = ['other', 'fire', 'smoke']
WS_URL = "ws://localhost:8080/ws/fire-alerts"  # WebSocket endpoint
DETECTION_CONFIDENCE_THRESHOLD = 0.1
ALERT_CONFIDENCE_THRESHOLD = 0.6
ALERT_COOLDOWN_SECONDS = 5
CAMERA_INDEX = 0
FRAME_SIZE = (640, 640)
LOCATION = "Your Location Here"

# -------------------- WebSocket Client --------------------


class FireAlertClient:
    def __init__(self):
        self.websocket = None
        self.connected = False
        self.last_alert_time = 0

    async def connect(self):
        while True:
            try:
                print("⌛ Connecting to WebSocket server...")
                self.websocket = await websockets.connect(WS_URL, ping_interval=20, ping_timeout=10)
                self.connected = True
                print("✅ WebSocket connection established")

                # Listen for server messages (acknowledgements)
                async for message in self.websocket:
                    print(f"Received from server: {message}")

            except Exception as e:
                print(f"❌ WebSocket error: {e}")
                self.connected = False
                await asyncio.sleep(5)  # Reconnect delay

    async def send_alert(self, location):
        if not self.connected:
            print("⚠️ Not connected, skipping alert")
            return

        current_time = time.time()
        if current_time - self.last_alert_time < ALERT_COOLDOWN_SECONDS:
            return

        alert_data = {
            "type": "fire_alert",
            "location": location,
            "timestamp": int(current_time),
            "confidence": ALERT_CONFIDENCE_THRESHOLD
        }

        try:
            await self.websocket.send(json.dumps(alert_data))
            self.last_alert_time = current_time
            print("🔥 Fire alert sent via WebSocket")
        except Exception as e:
            print(f"⚠️ Failed to send WebSocket alert: {e}")
            self.connected = False

# -------------------- Fire Detection --------------------


def run_fire_detection(alert_client):
    cap = cv2.VideoCapture(CAMERA_INDEX)
    model = YOLO(MODEL_PATH)

    try:
        while True:
            success, frame = cap.read()
            if not success:
                print("❌ Failed to read from webcam")
                break

            frame = cv2.resize(frame, FRAME_SIZE)
            results = model(frame, stream=True)
            alert_needed = False

            for result in results:
                for box in result.boxes:
                    conf = float(box.conf[0])
                    if conf > DETECTION_CONFIDENCE_THRESHOLD:
                        cls = int(box.cls[0])
                        label = CLASS_NAMES[cls]

                        if label in ["fire", "smoke"]:
                            x1, y1, x2, y2 = map(int, box.xyxy[0])
                            cv2.rectangle(frame, (x1, y1),
                                          (x2, y2), (0, 0, 255), 3)
                            label_text = f'{label} {int(conf * 100)}%'
                            cvzone.putTextRect(frame, label_text, [
                                               x1 + 5, y1 + 20], scale=1.5, thickness=2)

                            if label == "fire" and conf > ALERT_CONFIDENCE_THRESHOLD:
                                alert_needed = True

            if alert_needed:
                cvzone.putTextRect(
                    frame, "🔥 FIRE DETECTED!", [10, 40], scale=2, thickness=4,
                    colorR=(0, 0, 255), colorT=(255, 255, 255)
                )
                asyncio.run_coroutine_threadsafe(
                    alert_client.send_alert(LOCATION),
                    loop
                )

            cv2.imshow("Real-Time Fire Detection", frame)
            if cv2.waitKey(1) == 27:  # ESC key
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()


# -------------------- Main --------------------
if __name__ == "__main__":
    alert_client = FireAlertClient()
    loop = asyncio.new_event_loop()

    # Start WebSocket connection in background thread
    ws_thread = threading.Thread(
        target=lambda: loop.run_until_complete(alert_client.connect()),
        daemon=True
    )
    ws_thread.start()

    # Run fire detection in main thread
    try:
        run_fire_detection(alert_client)
    except KeyboardInterrupt:
        print("👋 Shutting down...")
    finally:
        loop.close()
