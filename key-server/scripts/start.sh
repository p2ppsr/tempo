#!/bin/bash

if [ "$NODE_ENV" = "production" ] || [ "$NODE_ENV" = "staging" ]; then
  npm run build
  node dist/src/index.js
  exit
fi

node --inspect=0.0.0.0 dist/src/index.js
