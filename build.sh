#!/usr/bin/env bash
set -euo pipefail

mkdir -p dist

python3 - <<'PYEOF'
import os

css = open('src/style.css', encoding='utf-8').read()

js_files = sorted(f for f in os.listdir('src/js') if f.endswith('.js'))
js = '\n\n'.join(open(f'src/js/{f}', encoding='utf-8').read() for f in js_files)

template = open('src/template.html', encoding='utf-8').read()
out = template.replace('%%CSS%%', css).replace('%%JS%%', js)

with open('dist/index.html', 'w', encoding='utf-8') as fh:
    fh.write(out)

print(f'Built dist/index.html  ({len(out):,} bytes, {len(js_files)} JS modules)')
PYEOF
