#!/usr/bin/env bash
if [ "$NODE_ENV" = "production" ] || [ "$NODE_ENV" = "staging" ]; then
  node dist/src/index.js
else
  node --inspect=0.0.0.0 dist/src/index.js
fi
