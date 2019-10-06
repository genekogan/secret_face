import websocket
import thread
import time
from PIL import Image
from io import BytesIO
import base64
import re
import json
import numpy as np
import glob


#host = "ws://mlsalon.herokuapp.com"
host = "ws://localhost:5000"  


p_idx = len(glob.glob('images/obfuscated_image*'))+1
h, w = 240, 240

def on_message(ws, message):
    global p_idx
    message = json.loads(message)
    if 'imageData' in message:
        imageData = re.sub('^data:image/.+;base64,', '', message['imageData'])
        myImg = Image.open(BytesIO(base64.b64decode(imageData)))
        myImg.save('images/obfuscated_image%05d.png'%p_idx)
        myImg = np.array
        p_idx += 1

def on_error(ws, error):
    print(error)

def on_close(ws):
    print( "### closed ###")

def on_open(ws):
    print("### Initiating new websocket connection ###")
    def run(*args):
        ws.send('{"aggregatorID": 1 }')
    thread.start_new_thread(run, ())

def initiate(hostpath):
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(hostpath,
        on_message = on_message,
        on_error = on_error,
        on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()

if __name__ == "__main__":
    initiate(host)
