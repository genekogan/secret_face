from PIL import Image
import numpy as np
import glob
from tqdm import tqdm
from random import random, shuffle

dir = 'images/'
#dir = 'lfw/lfw_funneled'
N = 1e8
w, h = 240, 240
margin = 0

#image_paths = glob.glob('%s/*/*.jpg'%dir)
image_paths = glob.glob('%s/*.png'%dir)
shuffle(image_paths)
image_paths = image_paths[0:min(N, len(image_paths))]

img_avg = np.zeros((h, w, 3)).astype(np.uint64)
img_avg_noisy = np.zeros((h, w, 3)).astype(np.uint64)

print("there are %d images"%len(image_paths))
N = min(N, len(image_paths))
for p, path in tqdm(enumerate(image_paths)):
    img = Image.open(path)
    if img.width != w or img.height != h:
        img = img.resize((h, w), Image.BICUBIC)
    img = np.array(img).astype(np.uint64)[:,:,0:3]
    img_noisy = img + (-margin + 2 * margin * np.random.rand(h, w, 3)).astype(np.uint64)
    img_avg += img
    img_combined = np.concatenate([img, img_noisy], axis=1)
    #if p % 500:
    #    Image.fromarray(img_combined.astype(np.uint8)).save('lfw/img_%05d.png'%p)
    img_avg_noisy += img_noisy

img_avg = img_avg / N 
img_avg_noisy = img_avg_noisy / N 

img_combined = np.concatenate([img_avg, img_avg_noisy], axis=1)
Image.fromarray(img_combined.astype(np.uint8)).save('my2avg_%d.png'%N)
