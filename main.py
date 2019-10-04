from PIL import Image
import numpy as np
import glob
from tqdm import tqdm
from random import random, shuffle

dir = 'lfw_funneled'
N = 50
w, h = 250, 250
margin = 255

image_paths = glob.glob('%s/*/*.jpg'%dir)
shuffle(image_paths)
image_paths = image_paths[0:min(N, len(image_paths))]

img_avg = np.zeros((h, w, 3)).astype(np.uint64)
img_avg_noisy = np.zeros((h, w, 3)).astype(np.uint64)

for p, path in tqdm(enumerate(image_paths)):
    img = Image.open(path)
    if img.width != w or img.height != h:
        img = img.resize((h, w), Image.BICUBIC)
    img = np.array(img).astype(np.uint64)
    img_noisy = img + (-margin + 2 * margin * np.random.rand(h, w, 3)).astype(np.uint64)
    img_avg += img
    img_combined = np.concatenate([img, img_noisy], axis=1)
    if p < 10:
        Image.fromarray(img_combined.astype(np.uint8)).save('img_%03d.jpg'%p)
    img_avg_noisy += img_noisy

img_avg = img_avg / N 
img_avg_noisy = img_avg_noisy / N 

img_combined = np.concatenate([img_avg, img_avg_noisy], axis=1)
Image.fromarray(img_combined.astype(np.uint8)).save('myavg_%d.png'%N)
