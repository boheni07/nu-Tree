@echo off
echo Starting nu_Tree System...

start "FastAPI Backend" cmd /c "python -m uvicorn server.main:app --reload --host 127.0.0.1 --port 8000"

cd web
start "Vite Web Dashboard" cmd /c "npm run dev -- --open"
cd ..

echo Both Backend and Frontend are starting up.
