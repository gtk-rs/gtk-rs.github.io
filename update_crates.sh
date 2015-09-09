#!/bin/sh

set -e
set -u

mkdir -p _data
curl -s 'https://crates.io/api/v1/crates?keyword=gtk-rs&per_page=50' > tmp1
jq '.crates | map({name, max_version} | select(.name|contains("-sys")|not))' tmp1 > tmp2
mv tmp2 _data/crates.json
rm tmp1
