#!/bin/bash
set -a
cd /Users/edward/Documents/GitHub/drivesmart--traffic-rules-learning-platform
source .env 2>/dev/null || true
set +a

export PATH="/Users/edward/Library/Application Support/Herd/config/nvm/versions/node/v22.22.1/bin:/usr/local/bin:/usr/bin:/bin"
cd /Users/edward/Documents/GitHub/drivesmart--traffic-rules-learning-platform

exec /Users/edward/Library/Application\ Support/Herd/config/nvm/versions/node/v22.22.1/bin/npx \
     tsx server/listening_server.ts >> /tmp/vina_listening_server.log 2>&1
