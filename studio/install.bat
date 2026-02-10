@echo off
cd /d "%~dp0"
echo Installing ACE-Step Studio dependencies...
echo This requires Node.js and npm to be installed.
echo If they are not installed, please install them from https://nodejs.org/
npm install
echo Done!
pause
