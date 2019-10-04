import websocket
import thread
import time
from PIL import Image
from io import BytesIO
import base64
import re
import json
import numpy as np


p_idx = 1

h, w = 240, 240

#img_avg = np.zeros((h, w, 3)).astype(np.uint64)
#img_avg_noisy = np.zeros((h, w, 3)).astype(np.uint64)



    # if img.width != w or img.height != h:
    #     img = img.resize((h, w), Image.BICUBIC)
    # img = np.array(img).astype(np.uint64)
    # img_noisy = img + (-margin + 2 * margin * np.random.rand(h, w, 3)).astype(np.uint64)
    # img_avg += img
    # img_combined = np.concatenate([img, img_noisy], axis=1)
    # if p < 10:
    #     Image.fromarray(img_combined.astype(np.uint8)).save('img_%03d.jpg'%p)
    # img_avg_noisy += img_noisy





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
    initiate("ws://mlsalon.herokuapp.com")
    #initiate("ws://localhost:5000")