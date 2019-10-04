import websocket
import thread
import time
from PIL import Image
from io import BytesIO
import base64
import re
import json

#data:image/png;base64




#im = Image.open(BytesIO(base64.b64decode(data)))
#image_data = re.sub('^data:image/.+;base64,', '', data['img']).decode('base64')
             
                      
#image = Image.open(cStringIO.StringIO(image_data))


def on_message(ws, message):
    print("heello i received message!")
    #print (message)
    message = json.loads(message)
    if 'imageData' in message:
        imageData = re.sub('^data:image/.+;base64,', '', message['imageData'])
        print("def")
        myImg = Image.open(BytesIO(base64.b64decode(imageData)))
        print("yes size")
        print(myImg.width, myImg.height)
        myImg.save('mysockimg.png');

def on_error(ws, error):
    print(error)

def on_close(ws):
    print( "### closed ###")
    # Attemp to reconnect with 2 seconds interval
    #time.sleep(2)
    #initiate("ws://localhost:5000")

def on_open(ws):
    print("### Initiating new websocket connection ###")
    def run(*args):
        ws.send('{"aggregatorID": 91 }')
        time.sleep(1)
        #ws.close()
        print ("thread terminating...")
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
    #initiate("ws://mlsalon.herokuapp.com")
    initiate("ws://localhost:5000")