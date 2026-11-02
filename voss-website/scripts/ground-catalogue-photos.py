"""User-approved local cutouts. Keep source product pixels and original files.

AI segmentation changes alpha only; opaque subject RGB is never regenerated.
Every photograph gets the same 4:5 canvas and baseline, without distortion.
Run from voss-website with the workspace Python runtime.
"""
from pathlib import Path
import os
import sys
import json
import argparse
from collections import deque

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'outputs' / 'media-grounding'
sys.path.insert(0, str(WORK / 'python-deps'))
os.environ['U2NET_HOME'] = str(WORK / 'models')
os.environ['OMP_NUM_THREADS'] = '4'
os.environ['NUMBA_CACHE_DIR'] = str(WORK / 'numba-cache')
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

parser = argparse.ArgumentParser()
parser.add_argument('--limit', type=int, default=0)
parser.add_argument('--model', default='u2netp')
parser.add_argument('--keys', default='')
parser.add_argument('--rebuild', action='store_true')
args = parser.parse_args()
media = json.loads((ROOT / 'src/lib/studio-media.json').read_text())
inventory_path = WORK / 'original-studio-media.json'
if inventory_path.exists():
    media = json.loads(inventory_path.read_text())
else:
    inventory_path.write_text(json.dumps(media, indent=2))
OUT = ROOT / 'public/studio-grounded-v2'
CACHE = WORK / 'mattes'
OUT.mkdir(exist_ok=True)
CACHE.mkdir(exist_ok=True)
session = None
reports = []
tiles = []
count = 0
for directory, colours in media.items():
    for colour, photos in colours.items():
        for index, photo in enumerate(photos):
            if photo['label'].lower() == 'size guide':
                continue
            count += 1
            if args.limit and count > args.limit:
                continue
            source = ROOT / 'public' / photo['src'].lstrip('/')
            key = f'{directory}-{colour}-{index}'
            if args.keys and key not in args.keys.split(','):
                continue
            cache = CACHE / f'{key}.png'
            original = Image.open(source).convert('RGBA')
            arr = np.asarray(original)
            rgb = arr[:, :, :3].copy()
            if cache.exists():
                cutout = Image.open(cache).convert('RGBA')
            elif arr[:, :, 3].min() < 10:
                cutout = original
                cutout.save(cache)
            else:
                import onnxruntime as ort
                if session is None:
                    options = ort.SessionOptions()
                    options.intra_op_num_threads = 4
                    session = ort.InferenceSession(str(WORK/'models'/f'{args.model}.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
                pixels = np.asarray(original.convert('RGB').resize((320,320), Image.Resampling.LANCZOS)).astype(np.float32)
                pixels /= max(float(pixels.max()),1)
                pixels = (pixels-np.array([.485,.456,.406],dtype=np.float32))/np.array([.229,.224,.225],dtype=np.float32)
                inputs = pixels.transpose(2,0,1)[None,...]
                prediction = session.run(None,{session.get_inputs()[0].name:inputs})[0][0,0]
                prediction = (prediction-prediction.min())/max(float(prediction.max()-prediction.min()),1e-8)
                mask = Image.fromarray(np.uint8(prediction*255)).resize(original.size,Image.Resampling.LANCZOS)
                alpha = np.asarray(mask).copy()
                # Make the subject interior fully opaque and the empty sweep
                # fully transparent, retaining antialiasing at the boundary.
                alpha[alpha >= 240] = 255
                alpha[alpha <= 12] = 0
                rgba = np.dstack((rgb, alpha))
                cutout = Image.fromarray(rgba)
                cutout.save(cache)
            matte = np.asarray(cutout).copy()
            # Remove detached, faint studio shadows, retaining the antialiased
            # product edge within two pixels of the solid subject.
            solid = Image.fromarray(np.uint8(matte[:,:,3] >= 128)*255)
            near_subject = np.asarray(solid.filter(ImageFilter.MaxFilter(5))) > 0
            matte[~near_subject,3] = 0
            cutout = Image.fromarray(matte)
            # A few studio photographs contain a hard grey floor shadow. Keep
            # grey products intact; remove only large neutral floor patches
            # from the lower part of coloured front views.
            if index == 0 and 'grey' not in colour:
                values = matte[:, :, :3].astype(np.int16)
                low, high = values.min(axis=2), values.max(axis=2)
                floor_sweeps = {'product-01-dark-brown-0','product-01-cognac-0','product-01-camel-0','product-04-taupe-0','product-04-green-0','product-04-wine-0'}
                neutrality = 35 if key in floor_sweeps else 9
                candidate = (low>145)&(high<235)&((high-low)<neutrality)&(matte[:,:,3]>0)
                candidate[:round(candidate.shape[0]*.55)] = False
                visited = np.zeros(candidate.shape,dtype=bool)
                h,w=candidate.shape
                for y,x in zip(*np.nonzero(candidate)):
                    if visited[y,x]:
                        continue
                    visited[y,x]=True
                    queue=deque([(int(y),int(x))]); region=[]
                    while queue:
                        py,px=queue.popleft();region.append((py,px))
                        for ny,nx in ((py-1,px),(py+1,px),(py,px-1),(py,px+1)):
                            if 0<=ny<h and 0<=nx<w and candidate[ny,nx] and not visited[ny,nx]:
                                visited[ny,nx]=True;queue.append((ny,nx))
                    if len(region)>=200:
                        yy,xx=zip(*region);matte[yy,xx,3]=0
                cutout=Image.fromarray(matte)
            visible = matte[:, :, 3] >= 128
            ys, xs = np.nonzero(visible)
            if not len(xs):
                raise ValueError(f'Empty cutout: {key}')
            bounds = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
            # Keep a small antialiased edge beyond the bounding rectangle.
            bounds = (max(0,bounds[0]-2),max(0,bounds[1]-2),min(cutout.width,bounds[2]+2),min(cutout.height,bounds[3]+2))
            subject = cutout.crop(bounds)
            subject.thumbnail((864, 1032), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (960, 1200))
            canvas.alpha_composite(subject, ((960-subject.width)//2, 1128-subject.height))
            for width in (480, 960):
                image = canvas.resize((width, round(width*1.25)), Image.Resampling.LANCZOS)
                target = OUT / f'{key}-{width}.webp'
                if args.rebuild or not target.exists():
                    image.save(target, quality=92, method=4, exact=True)
            photo['src'] = f'/studio-grounded-v2/{key}-960.webp'
            opaque = matte[:, :, 3] == 255
            unchanged = bool(np.array_equal(matte[:, :, :3][opaque],rgb[opaque]))
            reports.append({'key':key,'source':str(source.relative_to(ROOT)),'rgb_preserved':unchanged,'source_bounds':bounds,'baseline':1128,'transparent_fraction':float((matte[:,:,3]==0).mean())})
            if index == 0:
                tile = Image.new('RGBA', canvas.size, (216,221,218,255))
                tile.alpha_composite(canvas)
                tile = tile.convert('RGB').resize((192,240))
                ImageDraw.Draw(tile).text((5,5),key,fill=(20,20,20))
                tiles.append(tile)
            print(key, 'OK', flush=True)

(WORK / 'cutout-validation.json').write_text(json.dumps(reports, indent=2))
if tiles:
    columns=6
    sheet=Image.new('RGB',(columns*192,((len(tiles)+columns-1)//columns)*240),(216,221,218))
    for i,tile in enumerate(tiles):
        sheet.paste(tile,((i%columns)*192,(i//columns)*240))
    sheet.save(WORK/'all-colours-review.jpg',quality=93)
if not args.limit and not args.keys:
    (ROOT/'src/lib/studio-media.json').write_text(json.dumps(media,indent=2)+'\n')
print(f'Processed {len(reports)} photographs. Original sources retained.',flush=True)
