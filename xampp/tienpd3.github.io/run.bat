@echo off
COPY "httpd.conf" "C:/xampp/apache/conf/httpd.conf"
COPY "httpd-xampp.conf" "C:\xampp\apache\conf\extra\httpd-xampp.conf"
COPY "httpd-vhosts.conf" "C:\xampp\apache\conf\extra\httpd-vhosts.conf"
net stop "Apache2.4" & sc start "Apache2.4"
net stop "mysql" & sc start "mysql"

pause