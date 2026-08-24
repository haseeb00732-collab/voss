# Media pipeline

`grade-media.mjs` bakes the seven-step art-direction recipe from
`Voss-Design.md` §7.1 into the image files themselves, so what ships is what
was art-directed. Nothing is filtered at runtime — CSS filters on a large
image are a per-frame GPU cost, and they leave the source ungraded for anyone
who downloads it.

```
node scripts/grade-media.mjs <source-dir> src/media scripts/media-plan.json
```

`media-plan.json` is the whole record of the shoot: for each output file, the
Unsplash photo id it came from, the target ratio and pixel width, which grade
variant to apply (`paper` for bone sections, `vitrine` for onyx), and an
optional per-image `sat` override for the few frames that arrive far hotter
than the rest.

To re-fetch the sources, resolve each id through Unsplash's photo endpoint and
pull the `urls.raw` it returns:

```sh
raw=$(curl -s "https://unsplash.com/napi/photos/$id" \
      | sed -n 's/.*"raw":"\([^"]*\)".*/\1/p' | head -1)
curl -L -o "$id.jpg" "${raw}&w=2400&q=90&fm=jpg"
```

Two things to know before swapping anything in:

- **Check `plus` on the photo record.** Unsplash+ images come back with a
  tiled watermark across the frame, and it survives the grade. Only use
  photos where `"plus": false`.
- **Subject rules are in §7.3 and they are not decorative.** Tight crops,
  partial hands, macro texture, one visible light source. No full-body model
  shots, no faces beside the wordmark, no legible text inside the frame —
  the last two are licence requirements, not taste.

Every image is referenced through `src/lib/media.ts`. Real photography drops
into the same map and inherits the same treatment.
