#!/bin/bash

# Kill existing processes
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:5174 | xargs kill -9 2>/dev/null

sleep 1

# Start services
cd "$(dirname "$0")"
npm run dev
