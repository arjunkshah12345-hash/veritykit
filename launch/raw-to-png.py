#!/usr/bin/env python3
from pathlib import Path
import json
from PIL import Image

out = Path(__file__).parent / "out"
for meta_path in out.glob("*.meta.json"):
    meta = json.loads(meta_path.read_text())
    raw = (out / f"{meta['name']}.raw").read_bytes()
    im = Image.frombytes("RGBA", (meta["w"], meta["h"]), raw)
    if meta["w"] <= 64:
        im = im.resize((meta["w"] * 12, meta["h"] * 12), Image.NEAREST)
    im.convert("RGB").save(out / f"{meta['name']}.png", "PNG", optimize=True)
    print(out / f"{meta['name']}.png")
