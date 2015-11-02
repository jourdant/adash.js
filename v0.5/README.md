#adash.js

##Introduction
If you've reached this page, you're looking at the result of my day hacking a raspberry pi to detect wireless traffic from [Amazon Dash]() buttons. A quick disclaimer, the code isn't pretty, but it does the job and has been running consistently for days.

##Pre-requisites
###Hardware
1. Raspberry Pi 2 (or your device + linux of choice)
2. Ralink RT2870 Wifi Adapter (or any other wifi adapter with monitor mode)

###Software
I just used the latest Raspbian OS release for the rpi. I knew that it had the drivers for the wifi adapter and didn't want to waste time getting drivers sorted on a PoC hack. Now it works, I'd like to try porting this to snappy or similar.

1. Node.js
```
curl -sL https://deb.nodesource.com/setup_5.x | bash -
apt-get install -y nodejs
```

2. aircrack-ng suite
```
apt-get -y install libssl-dev libnl-dev iw
wget http://download.aircrack-ng.org/aircrack-ng-1.2-rc2.tar.gz
tar -zxvf aircrack-ng-1.2-rc2.tar.gz
cd aircrack-ng-1.2-rc2
make
make install
airodump-ng-oui-update
```

 ##

ifconfig wlan0 down
iw del wlan0
iw phy phy0 interface add mon0 type monitor
ifconfig mon0 up