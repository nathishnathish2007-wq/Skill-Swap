@echo off
setlocal
cd /d "%~dp0"

echo Starting SkillSwap API and web app...
echo Keep both command windows open while using the local preview.

start "SkillSwap API" cmd /k "node server\index.js"
start "SkillSwap Web" cmd /k "npm.cmd run dev --workspace client"

timeout /t 5 /nobreak >nul
start http://localhost:5173
