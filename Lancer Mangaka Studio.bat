@echo off
title Mangaka Studio
echo Lancement de Mangaka Studio...
cd /d "%~dp0"
start /b npx electron .
exit
