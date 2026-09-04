"""
Rebuild the self-hosted font subsets.

    python scripts/subset-fonts.py

Jost and Noto Nastaliq Urdu are both SIL OFL, fetched from google/fonts and
subset here rather than pulled from the Google Fonts CDN at runtime.

THE NASTALIQ SUBSET IS DRIVEN BY THE SIX NAMES BELOW. If a name changes in
`src/lib/catalogue.ts`, change it here and re-run, or the new letter renders
in a fallback system font — Segoe UI on Windows, Noto Naskh on Android — which
is the exact failure this file exists to prevent.

Size note, measured 2026-08-31: the subset is ~49KB, not the ~15KB the design
prompt assumed. That estimate counted 16 codepoints; Arabic script is cursive,
so GSUB closure pulls in every positional form and ligature — 438 glyphs. All
layout features are kept deliberately: dropping them hits ~the same size (the
outlines dominate, not the tables) and breaks joining.
"""
import os, subprocess, sys, urllib.request
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "src", "app", "fonts")

# Must match the Urdu names in src/lib/catalogue.ts.
URDU = "افسون گلنار نو بہار دل آرا ماہ رُخ مہر"

LATIN = ("U+0020-007E,U+00A0,U+00A9,U+00AB,U+00BB,U+2010-2015,U+2018-201D,"
         "U+2022,U+2026,U+2039,U+203A,U+20A8,U+2192,U+2013,U+2014")

SRC = {
    "jost": "https://raw.githubusercontent.com/google/fonts/main/ofl/jost/Jost%5Bwght%5D.ttf",
    "nastaliq": "https://raw.githubusercontent.com/google/fonts/main/ofl/notonastaliqurdu/NotoNastaliqUrdu%5Bwght%5D.ttf",
}

def fetch(key, dest):
    if not os.path.exists(dest):
        print("fetching", key)
        urllib.request.urlretrieve(SRC[key], dest)
    return dest

def subset(src, out, *, text=None, unicodes=None):
    args = [sys.executable, "-m", "fontTools.subset", src,
            "--layout-features=*", "--flavor=woff2", "--desubroutinize",
            f"--output-file={out}"]
    if text:
        tf = out + ".txt"
        open(tf, "w", encoding="utf-8").write(text)
        args.append(f"--text-file={tf}")
    if unicodes:
        args.append(f"--unicodes={unicodes}")
    subprocess.run(args, check=True)
    if text:
        os.remove(out + ".txt")
    print(f"  {os.path.basename(out)}  {os.path.getsize(out)/1024:.1f} KB  "
          f"{len(TTFont(out).getGlyphOrder())} glyphs")

os.makedirs(OUT, exist_ok=True)
jost = fetch("jost", os.path.join(OUT, "_Jost-var.ttf"))
subset(jost, os.path.join(OUT, "Jost-subset.woff2"), unicodes=LATIN)

nas = fetch("nastaliq", os.path.join(OUT, "_Noto-var.ttf"))
# Pin the weight axis first: the display use is one weight, and dropping the
# variable tables takes the subset from 80KB to 49KB.
pinned = os.path.join(OUT, "_Noto-400.ttf")
instancer.instantiateVariableFont(TTFont(nas), {"wght": 400}, inplace=False).save(pinned)
subset(pinned, os.path.join(OUT, "NotoNastaliqUrdu-subset.woff2"), text=URDU)

for f in ("_Jost-var.ttf", "_Noto-var.ttf", "_Noto-400.ttf"):
    p = os.path.join(OUT, f)
    if os.path.exists(p):
        os.remove(p)
