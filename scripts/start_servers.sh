#!/bin/bash
nohup python -m uvicorn api.index:app --port 8001 > backend.log 2>&1 &
echo $! > backend.pid
nohup npm run dev > frontend.log 2>&1 &
echo $! > frontend.pid
sleep 10
