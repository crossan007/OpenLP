#!/bin/bash
SERVICE="OpenLPDisplay"
URL="http://192.168.10.12:4316"

ps -A | grep $SERVICE > /dev/null
ServiceStatus=$?
echo "exit code: ${result}"

curl --max-time 1  $URL > /dev/null
OLPServerStatus=$?

if [ $ServiceStatus -eq 0 ] ; then
    if [ $OLPServerStatus != 0 ]; then
      echo "`date`: $SERVICE service running, but OLP server was not reachable.  Killing service..."
      pkill $SERVICE
      vcgencmd display_power  0
    else
      echo "`date`: $SERVICE service running, everything is fine"
    fi
else
    if [ $OLPServerStatus != 0 ]; then
      echo "`date`: $SERVICE is not running, but neither is OLP Server.  Do nothing."
    else
      echo "`date`: $SERVICE is not running.  Starting."
      export DISPLAY=:0
      /home/pi/Desktop/OpenLPDisplay.py &
      vcgencmd display_power  1
    fi
fi
