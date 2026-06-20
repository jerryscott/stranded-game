#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: ./build.sh <major> <minor>"
  echo "  Example: ./build.sh 5 4"
  echo "  Archives the current index.html as archive/stranded_v0_<major>_<minor>.html, then builds a fresh index.html."
  exit 1
fi

MAJOR=$1
MINOR=$2

# Archive the current index.html before overwriting it
if [[ -f index.html ]]; then
  mkdir -p archive
  ARCHIVE="archive/stranded_v0_${MAJOR}_${MINOR}.html"
  mv index.html "$ARCHIVE"
  echo "Archived → $ARCHIVE"
fi

python3 - <<'PYEOF'
import os

css = open('src/style.css', encoding='utf-8').read()

js_files = sorted(f for f in os.listdir('src/js') if f.endswith('.js'))
js = '\n\n'.join(open(f'src/js/{f}', encoding='utf-8').read() for f in js_files)

template = open('src/template.html', encoding='utf-8').read()
out = template.replace('%%CSS%%', css).replace('%%JS%%', js)

with open('index.html', 'w', encoding='utf-8') as fh:
    fh.write(out)

print(f'Built index.html  ({len(out):,} bytes, {len(js_files)} JS modules)')
PYEOF
