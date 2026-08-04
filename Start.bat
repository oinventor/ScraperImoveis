@echo off
setlocal
cd /d "%~dp0"
node .\ChavesNaMao\TemporaryInput.js
if errorlevel 1 (
    echo.
    echo Ocorreu um erro ao executar o script.
)
pause
endlocal
