"""Compose confirmed sets from existing cutouts; never invent accessories."""
from pathlib import Path
import json
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[1]
file = ROOT/'src/lib/studio-media.json'
media = json.loads(file.read_text())
tiles = []
for directory in ('product-05', 'product-08'):
    for colour, photos in media[directory].items():
        # Idempotent: retain the individual front view at its original index.
        photos[:] = [p for p in photos if p['label'] != 'Complete set']
        parts = [photos[0]] + [p for p in photos if p['label'] in ('Matching wallet', 'Matching smaller bag', 'Matching rounded pouch')]
        expected = 2 if directory == 'product-05' else 3
        assert len(parts) == expected
        canvas = Image.new('RGBA',(960,1200))
        placements = [(48,1128,700,1000),(640,1128,265,350)] if expected == 2 else [(120,1128,700,1000),(40,1128,450,510),(635,1128,280,300)]
        for photo, (x,bottom,w,h) in zip(parts,placements):
            im = Image.open(ROOT/'public'/photo['src'].lstrip('/')).convert('RGBA')
            alpha = im.getchannel('A').point(lambda a: 255 if a>128 else 0)
            im = im.crop(alpha.getbbox())
            im.thumbnail((w,h), Image.Resampling.LANCZOS)
            canvas.alpha_composite(im,(x,bottom-im.height))
        key=f'{directory}-{colour}-complete-set'
        for w in (480,960):
            canvas.resize((w,round(w*1.25)),Image.Resampling.LANCZOS).save(ROOT/f'public/studio-grounded-v2/{key}-{w}.webp',quality=94,method=4)
        photos.insert(0,{'src':f'/studio-grounded-v2/{key}-960.webp','label':'Complete set'})
        preview=Image.new('RGBA',canvas.size,(216,221,218,255)); preview.alpha_composite(canvas)
        tile=preview.convert('RGB').resize((240,300)); ImageDraw.Draw(tile).text((8,8),f'{directory} {colour}',fill='black'); tiles.append(tile)
file.write_text(json.dumps(media,indent=2)+'\n')
sheet=Image.new('RGB',(1200,600),(216,221,218))
for i,tile in enumerate(tiles): sheet.paste(tile,((i%5)*240,(i//5)*300))
sheet.save(ROOT/'outputs/media-grounding/complete-sets-review.jpg',quality=94)
print('Composed 10 confirmed complete sets; individual views retained.')
