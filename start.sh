#!/bin/bash
vpython="$(python --version | awk -F " " '{print $2}' | awk -F "." '{print $1}')"

if [ $vpython -ge 3 ] 
then
    python -m http.server
else
    python -m SimpleHTTPServer
fi