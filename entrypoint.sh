#!/bin/bash
set -e

cd "$(dirname "${BASH_SOURCE[0]}")"
npm install --production --no-fund --no-audit --no-progress
npm prune  --production --no-fund --no-audit --no-progress
node index.js 2>&1 | tee -a service.log
