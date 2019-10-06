from PIL import Image
import numpy as np
import glob
from tqdm import tqdm
from random import random, shuffle

dir = 'images/'
N = 1e8
w, h = 240, 240

image_paths = glob.glob('%s/*.png'%dir)
shuffle(image_paths)
image_paths = image_paths[0:min(N, len(image_paths))]

img_avg = np.zeros((h, w, 3)).astype(np.uint64)

print("there are %d images"%len(image_paths))
N = min(N, len(image_paths))
for p, path in tqdm(enumerate(image_paths)):
    img = Image.open(path)
    if img.width != w or img.height != h:
        img = img.resize((h, w), Image.BICUBIC)
    img = np.array(img).astype(np.uint64)[:,:,0:3]
    img_avg += img

img_avg = img_avg / N 

Image.fromarray(img_avg.astype(np.uint8)).save('myAverage.png')
print("Created the image myAveragee.png in root directory, which shows average of all the images")
