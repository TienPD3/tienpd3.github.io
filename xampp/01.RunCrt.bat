@echo off
xcopy /i /e /y "D:\Working\tienpd3.github.io\xampp\crt" "C:\xampp\apache\crt"

C:
cd "C:\xampp\apache\crt\"
call "make-cert.bat"

start "" "C:\xampp\apache\crt\tienpd3.com\server.crt"
pause