#!/bin/bash
cd /home/kavia/workspace/code-generation/game-frontend-development-222824-222840/game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

