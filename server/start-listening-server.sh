#!/bin/bash
export PATH="/Users/edward/Library/Application Support/Herd/config/nvm/versions/node/v22.22.1/bin:/usr/local/bin:/usr/bin:/bin"
cd /Users/edward/Documents/GitHub/drivesmart--traffic-rules-learning-platform
exec /Users/edward/Library/Application\ Support/Herd/config/nvm/versions/node/v22.22.1/bin/node \
     /Users/edward/Library/Application\ Support/Herd/config/nvm/versions/node/v22.22.1/bin/npx \
     tsx server/listening_server.ts >> /tmp/vina_listening_server.log 2>&1
