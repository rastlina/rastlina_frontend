"""Re-encode retained source footage. Run explicitly with a local FFmpeg path.

No footage is generated or changed. Versioned outputs can be cached permanently.
Usage: python build/encodeJourneyMedia.py /path/to/ffmpeg
"""
import json
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parent.parent
assets = root / 'public' / 'journey' / 'assets'
clips = [(f'story-{i:02}', f'story-{i:02}' + ('-v2' if i == 3 else '') + '.mp4', 3)
         for i in range(1, 6)]
clips += [(room, f'{room}-v4.mp4', 6) for room in ['living-room', 'bedroom', 'office']]
report = []
for name, source, revision in clips:
    # Both regular phone and desktop sessions use full source dimensions.
    # The HD 1280-wide alternative is reserved for explicit data saving / 2G.
    for variant, width, quality in [('mobile', 1280, 23), ('web', None, 21)]:
        output = assets / f'{name}-{variant}-v{revision}.mp4'
        subprocess.run([sys.argv[1], '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(assets / source), '-map', '0:v:0', '-an',
                        '-vf', f'scale=min({width}\\,iw):-2,setsar=1' if width else 'setsar=1',
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', str(quality),
                        '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level:v', '4.1',
                        '-g', '24', '-keyint_min', '24', '-sc_threshold', '0',
                        '-threads', '4', '-movflags', '+faststart', str(output)], check=True)
        record = dict(source=source, output=output.name, original_bytes=(assets / source).stat().st_size,
                      bytes=output.stat().st_size, width=width, crf=quality)
        report.append(record)
        print(json.dumps(record), flush=True)
(assets / 'web-media-v3.json').write_text(json.dumps(report, indent=2) + '\n')
