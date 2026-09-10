#!/bin/bash
PORT=${1:-5000}
echo "=========================================================="
echo " Starting Piyush's AI Learning Intelligence Hub"
echo " Serving at: http://localhost:$PORT/"
echo " LAN Access: http://10.71.27.94:$PORT/"
echo "=========================================================="
python3 -m http.server $PORT --bind 0.0.0.0 --directory /root/MY_STUDY_PROJECT
